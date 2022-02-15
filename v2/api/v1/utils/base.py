from typing import Generic, List, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

from utils.oauth import get_password_hash

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)
ReadSchemaType = TypeVar("ReadSchemaType", bound=SQLModel)


class APIBase(Generic[ModelType, CreateSchemaType, ReadSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def by_email(self, session: Session, email: str) -> Optional[ReadSchemaType]:
        statement = select(self.model).where(self.model.email == email)
        results = session.exec(statement)
        user = results.first()

        return user

    def by_username(self, session: Session, username: str) -> Optional[ReadSchemaType]:
        statement = select(self.model).where(self.model.username == username)
        results = session.exec(statement)
        user = results.first()

        return user

    def by_id(self, session: Session, id: int) -> Optional[ReadSchemaType]:
        db_user = session.get(self.model, id)

        return db_user

    def get(self, session: Session, offset: int, limit: int) -> List[ReadSchemaType]:
        db_users = session.exec(select(self.model).offset(offset).limit(limit)).all()

        return db_users

    def create(self, session: Session, user: CreateSchemaType) -> ReadSchemaType:
        hashed_password = get_password_hash(user.password)
        user.hashed_password = hashed_password

        db_user = self.model.from_orm(user)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        return db_user

    def update(
        self, session: Session, id: int, user: UpdateSchemaType
    ) -> Optional[ReadSchemaType]:
        db_user = session.get(self.model, id)

        if not db_user:
            return None

        user_data = user.dict(exclude_unset=True)
        for key, value in user_data.items():
            setattr(db_user, key, value)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        return db_user

    def delete(self, session: Session, id: int) -> bool:
        db_user = session.get(self.model, id)

        if not db_user:
            return False

        session.delete(db_user)
        session.commit()

        return True

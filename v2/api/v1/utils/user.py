from typing import List, Optional

from sqlmodel import Session

from api.v1.utils.base import APIBase
from models.user import User, UserCreate, UserRead, UserUpdate


class APIUser(APIBase[User, UserCreate, UserRead, UserUpdate]):
    def get_by_email(self, session: Session, email: str) -> Optional[UserRead]:
        db_user = self.by_email(session, email)
        return db_user

    def get_by_username(self, session: Session, username: str) -> Optional[UserRead]:
        db_user = self.by_username(session, username)
        return db_user

    def get_by_id(self, session: Session, id: int) -> Optional[UserRead]:
        db_user = self.by_id(session, id)
        return db_user

    def filter(self, session: Session, offset: int, limit: int) -> List[UserRead]:
        db_users = self.get(session, offset, limit)
        return db_users

    def create_user(self, session: Session, user: UserCreate) -> UserRead:
        db_user = self.create(session, user)
        return db_user

    def update_user(
        self, session: Session, id: int, user: UserUpdate
    ) -> Optional[UserRead]:
        db_user = self.update(session, id, user)
        return db_user

    def delete_user(self, session: Session, id: int) -> bool:
        ok = self.delete(session, id)

        if ok:
            return True

        return False


api_user = APIUser(User)

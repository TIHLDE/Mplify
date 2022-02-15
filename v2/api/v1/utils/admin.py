from typing import List, Optional

from sqlmodel import Session

from api.v1.utils.base import APIBase
from models.admin import Admin, AdminCreate, AdminRead, AdminUpdate


class APIAdmin(APIBase[Admin, AdminCreate, AdminRead, AdminUpdate]):
    def get_by_email(self, session: Session, email: str) -> Optional[AdminRead]:
        db_user = self.by_email(session, email)
        return db_user

    def get_by_username(self, session: Session, username: str) -> Optional[AdminRead]:
        db_user = self.by_username(session, username)
        return db_user

    def get_by_id(self, session: Session, id: int) -> Optional[AdminRead]:
        db_user = self.by_id(session, id)
        return db_user

    def filter(self, session: Session, offset: int, limit: int) -> List[AdminRead]:
        db_users = self.get(session, offset, limit)
        return db_users

    def create_admin(self, session: Session, user: AdminCreate) -> AdminRead:
        db_user = self.create(session, user)
        return db_user

    def update_admin(
        self, session: Session, id: int, user: AdminUpdate
    ) -> Optional[AdminRead]:
        db_user = self.update(session, id, user)
        return db_user

    def delete_admin(self, session: Session, id: int) -> bool:
        ok = self.delete(session, id)

        if ok:
            return True

        return False


api_admin = APIAdmin(Admin)

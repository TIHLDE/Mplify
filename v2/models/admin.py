from typing import Optional

from sqlmodel import Field, SQLModel


class AdminBase(SQLModel):
    username: str = Field(index=True)
    hashed_password: str
    email: str


class Admin(AdminBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class AdminCreate(AdminBase):
    pass


class AdminUpdate(SQLModel):
    username: Optional[str]
    hashed_password: Optional[str]
    email: Optional[str]


class AdminRead(SQLModel):
    id: int

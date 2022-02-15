from typing import Optional

from sqlmodel import Field, SQLModel


class AdminBase(SQLModel):
    username: str = Field(index=True)
    email: str


class Admin(AdminBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    disabled: bool = Field(default=False)
    hashed_password: str


class AdminCreate(AdminBase):
    password: str
    hashed_password: Optional[str] = Field(default=None)


class AdminUpdate(SQLModel):
    username: Optional[str] = None
    hashed_password: Optional[str] = None
    email: Optional[str] = None


class AdminRead(AdminBase):
    id: int


class AdminInDB(SQLModel):
    hashed_password: str

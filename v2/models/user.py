from typing import Optional

from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    username: str = Field(index=True)
    first_name: str
    last_name: str
    email: str = Field(index=True)
    age: int


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    disabled: bool = Field(default=False)
    hashed_password: str


class UserCreate(UserBase):
    password: str
    hashed_password: Optional[str] = Field(default=None)


class UserUpdate(SQLModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    hashed_password: Optional[str] = None
    age: Optional[int] = None


class UserRead(UserBase):
    id: int


class UserInDB(SQLModel):
    hashed_password: str

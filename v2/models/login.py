from typing import Optional

from sqlmodel import Field, SQLModel

# TODO: Change to Admin instead of Login,
# Also associate an Admin with a User!


class LoginBase(SQLModel):
    username: str = Field(index=True)
    hash: str


class Login(LoginBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class LoginCreate(SQLModel):
    username: str
    password: str


class LoginRegister(LoginBase):
    pass

from sqlmodel import SQLModel


class Login(SQLModel):
    username: str
    password: str

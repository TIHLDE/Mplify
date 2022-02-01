from sqlmodel import SQLModel


class Register(SQLModel):
    username: str
    password: str
    email: str

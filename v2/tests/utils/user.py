import random
import string
from typing import Dict

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from models.user import User, UserCreate, UserUpdate
from utils.oauth import get_password_hash


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def user_authentication_headers(
    *, client: TestClient, username: str, password: str
) -> Dict[str, str]:
    data = {"username": username, "password": password}

    r = client.post("/token/", data=data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


def authentication_token_from_email(
    *, client: TestClient, email: str, session: Session
) -> Dict[str, str]:
    """
    Return a valid token for the user with given email.
    If the user doesn't exist it is created first.
    """
    password = random_lower_string()
    hashed_password = get_password_hash(password)

    statement = select(User).where(User.email == email)
    results = session.exec(statement)
    user = results.first()
    username = "nisse"

    if not user:
        user_in_create = UserCreate(
            username=username,
            first_name="pølse",
            last_name="tomatsuppe",
            email=email,
            hashed_password=hashed_password,
            age=20,
        )
        user_db = User.from_orm(user_in_create)

        session.add(user_db)
        session.commit()
        session.refresh(user_db)
    else:
        user_in_update = UserUpdate(hashed_password=hashed_password)
        user_db = User.from_orm(user_in_update)

        session.add(user_db)
        session.commit()
        session.refresh(user_db)

    return user_authentication_headers(
        client=client, username=username, password=password
    )

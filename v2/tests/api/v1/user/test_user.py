from typing import Dict

from fastapi.testclient import TestClient
from sqlmodel import Session

from models.user import User
from utils.oauth import get_password_hash

hashed_password = get_password_hash("fake")

user_1 = {
    "username": "nisse",
    "first_name": "pølse",
    "last_name": "tomatsuppe",
    "age": 22,
    "email": "nisse@pølse.localhost",
    "hashed_password": hashed_password,
}

user_1_no_age = {
    "username": "nisse",
    "first_name": "pølse",
    "last_name": "tomatsuppe",
    "email": "nisse@pølse.localhost",
    "hashed_password": hashed_password,
}

user_1_invalid_age = {
    "username": "nisse",
    "first_name": "pølse",
    "last_name": "tomatsuppe",
    "age": "feil",
    "email": "nisse@pølse.localhost",
    "hashed_password": hashed_password,
}

user_2 = {
    "username": "katt",
    "first_name": "bok",
    "last_name": "fisk",
    "age": 40,
    "email": "kat@bok.localhost",
    "hashed_password": hashed_password,
}


def test_get_users_normal_user_me(
    client: TestClient, normal_user_token_headers: Dict[str, str]
) -> None:
    r = client.get("/user/me/", headers=normal_user_token_headers)
    current_user = r.json()

    assert current_user
    assert current_user["username"] == "nisse"
    assert current_user["first_name"] == "pølse"
    assert current_user["last_name"] == "tomatsuppe"
    assert current_user["email"] == "nisse@pølse.localhost"


def test_create_user(client: TestClient):
    response = client.post("/user/", json=user_1)
    data = response.json()

    assert response.status_code == 200
    assert data["username"] == user_1["username"]
    assert data["age"] == user_1["age"]
    assert data["id"] is not None


def test_create_user_incomplete(client: TestClient):
    # No age
    response = client.post("/user/", json=user_1_no_age)
    assert response.status_code == 422


def test_create_user_invalid(client: TestClient):
    # age has an invalid type
    response = client.post("/user/", json=user_1_invalid_age)
    assert response.status_code == 422


def test_read_users(session: Session, client: TestClient):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=user_1["hashed_password"],
        age=user_1["age"],
    )

    u2 = User(
        username=user_2["username"],
        first_name=user_2["first_name"],
        last_name=user_2["last_name"],
        email=user_2["email"],
        hashed_password=user_2["hashed_password"],
        age=user_2["age"],
    )

    session.add(u1)
    session.add(u2)
    session.commit()

    response = client.get("/user/")
    data = response.json()

    assert response.status_code == 200

    assert len(data) == 2
    assert data[0]["username"] == u1.username
    assert data[0]["age"] == u1.age
    assert data[0]["id"] == u1.id
    assert data[1]["username"] == u2.username
    assert data[1]["age"] == u2.age
    assert data[1]["id"] == u2.id


def test_read_user(session: Session, client: TestClient):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=user_1["hashed_password"],
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()

    response = client.get(f"/user/{u1.id}")
    data = response.json()

    assert response.status_code == 200
    assert data["username"] == u1.username
    assert data["age"] == u1.age
    assert data["id"] == u1.id


def test_update_user(session: Session, client: TestClient):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=user_1["hashed_password"],
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()

    response = client.patch(f"/user/{u1.id}", json={"username": "Deadpuddle"})
    data = response.json()

    assert response.status_code == 200
    assert data["username"] == "Deadpuddle"
    assert data["age"] == u1.age
    assert data["id"] == u1.id


def test_delete_user(session: Session, client: TestClient):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=user_1["hashed_password"],
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()

    response = client.delete(f"/user/{u1.id}")
    user_in_db = session.get(User, u1.id)

    assert response.status_code == 200
    assert user_in_db is None

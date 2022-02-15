from typing import Dict

from fastapi.testclient import TestClient
from sqlmodel import Session

from models.user import User
from utils.oauth import get_password_hash

# hashed_password = get_password_hash("fake")

user_1 = {
    "username": "nisse",
    "first_name": "pølse",
    "last_name": "tomatsuppe",
    "age": 22,
    "email": "nisse@pølse.localhost",
    "password": "fake",
}

user_1_no_age = {
    "username": "nisse",
    "first_name": "pølse",
    "last_name": "tomatsuppe",
    "email": "nisse@pølse.localhost",
    "password": "fake",
}

user_1_invalid_age = {
    "username": "nisse",
    "first_name": "pølse",
    "last_name": "tomatsuppe",
    "age": "feil",
    "email": "nisse@pølse.localhost",
    "password": "fake",
}

user_2 = {
    "username": "katt",
    "first_name": "bok",
    "last_name": "fisk",
    "age": 40,
    "email": "kat@bok.localhost",
    "password": "fake",
}

API_URL_PREFIX = "/admin/api/v1"


def test_create_user(client: TestClient, admin_token_headers: Dict[str, str]):
    response = client.post(
        f"{API_URL_PREFIX}/user", json=user_1, headers=admin_token_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert data["username"] == user_1["username"]
    assert data["age"] == user_1["age"]
    assert data["id"] is not None


def test_create_user_incomplete(
    client: TestClient, admin_token_headers: Dict[str, str]
):
    # No age
    response = client.post(
        f"{API_URL_PREFIX}/user", json=user_1_no_age, headers=admin_token_headers
    )
    assert response.status_code == 422


def test_create_user_invalid(client: TestClient, admin_token_headers: Dict[str, str]):
    # age has an invalid type
    response = client.post(
        f"{API_URL_PREFIX}/user", json=user_1_invalid_age, headers=admin_token_headers
    )
    assert response.status_code == 422


def test_read_users(
    session: Session, client: TestClient, admin_token_headers: Dict[str, str]
):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=get_password_hash(user_1["password"]),
        age=user_1["age"],
    )

    u2 = User(
        username=user_2["username"],
        first_name=user_2["first_name"],
        last_name=user_2["last_name"],
        email=user_2["email"],
        hashed_password=get_password_hash(user_2["password"]),
        age=user_2["age"],
    )

    session.add(u1)
    session.add(u2)
    session.commit()

    response = client.get(f"{API_URL_PREFIX}/users", headers=admin_token_headers)
    data = response.json()

    assert response.status_code == 200

    assert len(data) == 2
    assert data[0]["username"] == u1.username
    assert data[0]["age"] == u1.age
    assert data[0]["id"] == u1.id
    assert data[1]["username"] == u2.username
    assert data[1]["age"] == u2.age
    assert data[1]["id"] == u2.id


def test_read_user(
    session: Session, client: TestClient, admin_token_headers: Dict[str, str]
):

    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=get_password_hash(user_1["password"]),
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()
    session.refresh(u1)

    response = client.get(f"{API_URL_PREFIX}/user/{u1.id}", headers=admin_token_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["username"] == u1.username
    assert data["age"] == u1.age
    assert data["id"] == u1.id


def test_update_user(
    session: Session, client: TestClient, admin_token_headers: Dict[str, str]
):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=get_password_hash(user_1["password"]),
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()
    session.refresh(u1)

    response = client.patch(
        f"{API_URL_PREFIX}/user/{u1.id}",
        json={"username": "Deadpuddle"},
        headers=admin_token_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["username"] == "Deadpuddle"
    assert data["age"] == u1.age
    assert data["id"] == u1.id


def test_delete_user(
    session: Session, client: TestClient, admin_token_headers: Dict[str, str]
):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=get_password_hash(user_1["password"]),
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()
    session.refresh(u1)

    response = client.delete(
        f"{API_URL_PREFIX}/user/{u1.id}", headers=admin_token_headers
    )
    data = response.json()
    user_in_db = session.get(User, u1.id)

    assert response.status_code == 200
    assert data["message"] == "ok"
    assert user_in_db is None


def test_delete_user_unauthorized(
    session: Session, client: TestClient, normal_user_token_headers: Dict[str, str]
):
    u1 = User(
        username=user_1["username"],
        first_name=user_1["first_name"],
        last_name=user_1["last_name"],
        email=user_1["email"],
        hashed_password=get_password_hash(user_1["password"]),
        age=user_1["age"],
    )
    session.add(u1)
    session.commit()
    session.refresh(u1)

    response = client.delete(
        f"{API_URL_PREFIX}/user/{u1.id}", headers=normal_user_token_headers
    )
    user_in_db = session.get(User, u1.id)

    assert response.status_code == 401
    assert user_in_db.id == u1.id
    assert user_in_db.username == u1.username

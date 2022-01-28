# import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from models.user import User

# from tests.test_main import client_fixture, session_fixture


def test_create_user(client: TestClient):
    response = client.post("/user/", json={"name": "Deadpond", "age": 22})
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == "Deadpond"
    assert data["age"] == 22
    assert data["id"] is not None


def test_create_user_incomplete(client: TestClient):
    # No age
    response = client.post("/user/", json={"name": "Deadpond"})
    assert response.status_code == 422


def test_create_user_invalid(client: TestClient):
    # age has an invalid type
    response = client.post(
        "/user/",
        json={"name": "Deadpond", "age": "nisse"},
    )
    assert response.status_code == 422


def test_read_users(session: Session, client: TestClient):
    user_1 = User(name="Deadpond", age=22)
    user_2 = User(name="Rusty-Man", age=48)

    session.add(user_1)
    session.add(user_2)
    session.commit()

    response = client.get("/user/")
    data = response.json()

    assert response.status_code == 200

    assert len(data) == 2
    assert data[0]["name"] == user_1.name
    assert data[0]["age"] == user_1.age
    assert data[0]["id"] == user_1.id
    assert data[1]["name"] == user_2.name
    assert data[1]["age"] == user_2.age
    assert data[1]["id"] == user_2.id


def test_read_user(session: Session, client: TestClient):
    user_1 = User(name="Deadpond", age=22)
    session.add(user_1)
    session.commit()

    response = client.get(f"/user/{user_1.id}")
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == user_1.name
    assert data["age"] == user_1.age
    assert data["id"] == user_1.id


def test_update_user(session: Session, client: TestClient):
    user_1 = User(name="Deadpond", age=22)
    session.add(user_1)
    session.commit()

    response = client.patch(f"/user/{user_1.id}", json={"name": "Deadpuddle"})
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == "Deadpuddle"
    assert data["age"] == 22
    assert data["id"] == user_1.id


def test_delete_user(session: Session, client: TestClient):
    user_1 = User(name="Deadpond", age=22)
    session.add(user_1)
    session.commit()

    response = client.delete(f"/user/{user_1.id}")

    user_in_db = session.get(User, user_1.id)

    assert response.status_code == 200

    assert user_in_db is None

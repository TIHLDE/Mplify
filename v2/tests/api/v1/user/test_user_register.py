from fastapi.testclient import TestClient
from sqlmodel import Session


def test_register(client: TestClient):
    response = client.post(
        "/user/register/",
        json={
            "username": "nisse",
            "password": "pølse",
            "email": "nisse@pølse.com",
            "first_name": "pølse",
            "last_name": "nisse",
            "age": 20,
        },
    )
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "ok"


def test_register_exist(session: Session, client: TestClient):
    response1 = client.post(
        "/user/register/",
        json={
            "username": "nisse",
            "password": "pølse",
            "email": "nisse@pølse.com",
            "first_name": "pølse",
            "last_name": "nisse",
            "age": 20,
        },
    )
    data = response1.json()

    assert response1.status_code == 200
    assert data["message"] == "ok"

    response2 = client.post(
        "/user/register/",
        json={
            "username": "nisse",
            "password": "pølse",
            "email": "nisse@pølse.com",
            "first_name": "pølse",
            "last_name": "nisse",
            "age": 20,
        },
    )
    assert response2.status_code == 409

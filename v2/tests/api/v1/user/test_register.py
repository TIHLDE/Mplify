from fastapi.testclient import TestClient

from sqlmodel import Session

# from models.admin import Admin
# from utils.hash import generate_hash


def test_register(client: TestClient):
    response = client.post(
        "/register/", json={"username": "nisse", "password": "pølse", "email": "nisse@pølse.com"}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "ok"


def test_register_exist(session: Session, client: TestClient):
    response1 = client.post(
        "/register/", json={"username": "nisse", "password": "pølse", "email": "nisse@pølse.com"}
    )
    data = response1.json()

    assert response1.status_code == 200
    assert data["message"] == "ok"

    # hash = generate_hash("pølse")
    # admin = Admin(username="nisse", hash=hash, email="nisse@pølse.com")
    # session.add(admin)
    # session.commit()
    # session.refresh(admin)

    response2 = client.post(
        "/register/", json={"username": "nisse", "password": "pølse", "email": "nisse@pølse.com"}
    )
    # data = response.json()

    assert response2.status_code == 409

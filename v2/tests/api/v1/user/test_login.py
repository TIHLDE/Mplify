from fastapi.testclient import TestClient
from sqlmodel import Session

from models.admin import Admin
from utils.hash import generate_hash


def test_login(session: Session, client: TestClient):

    hash = generate_hash("pølse")
    admin = Admin(username="nisse", hash=hash, email="nisse@pølse.com")
    session.add(admin)
    session.commit()

    response = client.post("/login/", json={"username": "nisse", "password": "pølse"})
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "ok"

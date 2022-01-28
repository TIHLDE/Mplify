from fastapi.testclient import TestClient
from sqlmodel import Session

from models.login import Login
from utils.hash import generate_hash


def test_login(session: Session, client: TestClient):

    hash = generate_hash("pølse")
    user = Login(username="nisse", hash=hash)
    session.add(user)
    session.commit()

    response = client.post("/login/", json={"username": "nisse", "password": "pølse"})
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "ok"

from fastapi.testclient import TestClient
from sqlmodel import Session

from api.v1.utils.user import api_user
from models.user import UserCreate


def test_login(session: Session, client: TestClient):

    user = UserCreate(
        username="nisse",
        password="pølse",
        email="nisse@pølse.com",
        first_name="nisse",
        last_name="pølse",
        age=22,
    )
    api_user.create_user(session, user)

    response = client.post("/token/", data={"username": "nisse", "password": "pølse"})
    data = response.json()

    assert response.status_code == 200
    assert data["token_type"] == "bearer"

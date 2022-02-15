from fastapi.testclient import TestClient
from sqlmodel import Session

from api.v1.utils.admin import api_admin
from models.admin import AdminCreate


def test_login(session: Session, client: TestClient):

    admin = AdminCreate(
        username="nisse",
        password="pølse",
        email="nisse@pølse.com",
    )
    api_admin.create_admin(session, admin)

    response = client.post("/token/", data={"username": "nisse", "password": "pølse"})
    data = response.json()

    assert response.status_code == 200
    assert data["token_type"] == "bearer"

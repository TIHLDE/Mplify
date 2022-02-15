from typing import Dict

from fastapi.testclient import TestClient
from sqlmodel import Session


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


def test_update_user(
    session: Session, client: TestClient, normal_user_token_headers: Dict[str, str]
) -> None:

    response = client.patch(
        "/user/me/", json={"username": "Deadpuddle"}, headers=normal_user_token_headers
    )
    data = response.json()

    assert response.status_code == 200
    assert data["username"] == "Deadpuddle"
    assert data["first_name"] == "pølse"
    assert data["last_name"] == "tomatsuppe"
    assert data["email"] == "nisse@pølse.localhost"

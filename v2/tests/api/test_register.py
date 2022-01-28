from fastapi.testclient import TestClient


def test_register(client: TestClient):
    response = client.post(
        "/register/", json={"username": "nisse", "password": "pølse"}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "ok"

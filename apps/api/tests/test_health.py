from fastapi.testclient import TestClient

from apps.api.app.main import app


client = TestClient(app)


def test_health_check_returns_versioned_service_status() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "DevHub AI API",
        "version": "0.1.0",
    }


def test_root_exposes_docs_link() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["docs"] == "/docs"

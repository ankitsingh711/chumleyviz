import os
from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import clear_settings_cache
from app.core.database import reset_database_state


def configure_test_environment(tmp_path: Path) -> None:
    test_db = tmp_path / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{test_db}"
    os.environ["SECRET_KEY"] = "test-secret"
    clear_settings_cache()
    reset_database_state()


def test_login_and_resource_access(tmp_path: Path) -> None:
    configure_test_environment(tmp_path)

    from app.main import create_app

    with TestClient(create_app()) as client:
        login_response = client.post("/login", json={"provider": "microsoft_sso"})
        assert login_response.status_code == 200

        access_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        folders_response = client.get("/folders", headers=headers)
        dashboards_response = client.get("/dashboards", headers=headers)

        assert folders_response.status_code == 200
        assert dashboards_response.status_code == 200
        assert len(folders_response.json()) == 3
        assert len(dashboards_response.json()) >= 5

    reset_database_state()
    clear_settings_cache()

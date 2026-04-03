import os
from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import clear_settings_cache
from app.core.database import reset_database_state


def configure_test_environment(tmp_path: Path) -> None:
    test_db = tmp_path / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{test_db}"
    os.environ["SECRET_KEY"] = "test-secret"
    os.environ["ADMIN_EMAILS"] = "ankit.singh@aspect.co.uk,microsoft@aspectdemo.com"
    clear_settings_cache()
    reset_database_state()


def test_login_and_resource_access(tmp_path: Path, monkeypatch) -> None:
    configure_test_environment(tmp_path)

    from app.main import create_app
    from app.services import auth_service

    monkeypatch.setattr(
        auth_service,
        "verify_microsoft_access_token",
        lambda access_token: {
            "aud": "a69d5fb3-99af-440f-b88d-01f4aa7a8db2",
            "iss": "https://login.microsoftonline.com/93ce9c27-3bb2-4ef2-b686-1829de4f2584/v2.0",
            "name": "Ankit Singh",
            "oid": "entra-object-id-1",
            "preferred_username": "ankit.singh@aspect.co.uk",
            "scp": "access_as_user",
            "tid": "93ce9c27-3bb2-4ef2-b686-1829de4f2584",
        },
    )

    with TestClient(create_app()) as client:
        admin_login_response = client.post(
            "/auth/microsoft/exchange",
            json={"access_token": "microsoft-access-token"},
        )
        assert admin_login_response.status_code == 200
        assert admin_login_response.json()["user"]["role"] == "admin"

        admin_token = admin_login_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        folders_response = client.get("/folders", headers=admin_headers)
        dashboards_response = client.get("/dashboards", headers=admin_headers)
        create_folder_response = client.post(
            "/folders",
            json={"name": "New Admin Folder", "color": "#5C4CFF", "description": "admin-owned"},
            headers=admin_headers,
        )

        assert folders_response.status_code == 200
        assert dashboards_response.status_code == 200
        assert create_folder_response.status_code == 201
        assert len(folders_response.json()) == 3
        assert len(dashboards_response.json()) >= 5

        viewer_login_response = client.post(
            "/login",
            json={"email": "viewer@aspectdemo.com", "password": "Aspect@12345"},
        )
        assert viewer_login_response.status_code == 200
        assert viewer_login_response.json()["user"]["role"] == "viewer"

        viewer_token = viewer_login_response.json()["access_token"]
        viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

        viewer_folders_response = client.get("/folders", headers=viewer_headers)
        viewer_dashboards_response = client.get("/dashboards", headers=viewer_headers)
        viewer_create_response = client.post(
            "/folders",
            json={"name": "Blocked Folder", "color": "#FF7A59", "description": "viewer-owned"},
            headers=viewer_headers,
        )
        viewer_patch_response = client.patch(
            f"/dashboards/{dashboards_response.json()[0]['id']}",
            json={"folder_id": None},
            headers=viewer_headers,
        )

        assert viewer_folders_response.status_code == 200
        assert viewer_dashboards_response.status_code == 200
        assert viewer_create_response.status_code == 403
        assert viewer_patch_response.status_code == 403

    reset_database_state()
    clear_settings_cache()

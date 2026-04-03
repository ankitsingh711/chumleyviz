from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ChumleyViz API"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    database_url: str = "sqlite:///./chumleyviz.db"
    cors_origins: str = "http://localhost:5173"
    admin_emails: str = "microsoft@aspectdemo.com"
    demo_sso_email: str = "microsoft@aspectdemo.com"
    demo_sso_password: str = "Aspect@12345"
    demo_viewer_email: str = "viewer@aspectdemo.com"
    demo_viewer_password: str = "Aspect@12345"
    entra_tenant_id: str = ""
    entra_api_client_id: str = ""
    entra_issuer: str = ""
    entra_jwks_url: str = ""
    entra_required_scope: str = "access_as_user"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def admin_emails_list(self) -> list[str]:
        return [email.strip().lower() for email in self.admin_emails.split(",") if email.strip()]

    @property
    def entra_allowed_audiences(self) -> list[str]:
        if not self.entra_api_client_id:
            return []

        return [
            self.entra_api_client_id,
            f"api://{self.entra_api_client_id}",
        ]

    @property
    def entra_allowed_issuers(self) -> list[str]:
        issuers = {self.entra_issuer.strip()}
        if self.entra_tenant_id:
            issuers.add(f"https://login.microsoftonline.com/{self.entra_tenant_id}/v2.0")
            issuers.add(f"https://sts.windows.net/{self.entra_tenant_id}/")
        return [issuer for issuer in issuers if issuer]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def clear_settings_cache() -> None:
    get_settings.cache_clear()

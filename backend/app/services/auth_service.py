from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest


def authenticate_user(db: Session, payload: LoginRequest) -> User | None:
    settings = get_settings()

    if payload.provider == "microsoft_sso":
        return db.query(User).filter(User.email == settings.demo_sso_email).first()

    if not payload.email or not payload.password:
        return None

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        return None
    return user


def issue_token_for_user(user: User) -> str:
    return create_access_token(user.id)

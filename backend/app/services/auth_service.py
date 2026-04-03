from __future__ import annotations

import re
from time import monotonic
from typing import Any, Optional
from uuid import uuid4

import httpx
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest

_JWKS_CACHE: dict[str, Any] = {"expires_at": 0.0, "keys": []}


class AuthenticationError(Exception):
    pass


def authenticate_user(db: Session, payload: LoginRequest) -> Optional[User]:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        return None
    return user


def exchange_microsoft_access_token(db: Session, access_token: str) -> User:
    claims = verify_microsoft_access_token(access_token)
    return upsert_entra_user(db, claims)


def issue_token_for_user(user: User) -> str:
    return create_access_token(user.id)


def verify_microsoft_access_token(access_token: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.entra_tenant_id or not settings.entra_api_client_id or not settings.entra_jwks_url:
        raise AuthenticationError("Microsoft sign-in is not configured on the backend.")

    signing_key = _get_signing_key(access_token)

    try:
        claims = jwt.decode(
            access_token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise AuthenticationError("Microsoft access token could not be verified.") from exc

    _validate_entra_claims(claims)
    return claims


def upsert_entra_user(db: Session, claims: dict[str, Any]) -> User:
    email = _extract_email(claims)
    if not email:
        raise AuthenticationError("Microsoft token is missing a supported email claim.")

    entra_object_id = str(claims.get("oid") or "")
    entra_tenant_id = str(claims.get("tid") or "")
    full_name = str(claims.get("name") or email.split("@")[0])

    user = (
        db.query(User)
        .filter(User.entra_object_id == entra_object_id, User.entra_tenant_id == entra_tenant_id)
        .first()
    )
    if user is None:
        user = db.query(User).filter(User.email == email).first()

    if user is None:
        resolved_role = _resolve_user_role(email, claims)
        user = User(
            email=email,
            full_name=full_name,
            password_hash=get_password_hash(str(uuid4())),
            role=resolved_role,
            entra_object_id=entra_object_id,
            entra_tenant_id=entra_tenant_id,
        )
        db.add(user)
    else:
        resolved_role = _resolve_user_role(email, claims)
        user.email = email
        user.full_name = full_name
        user.entra_object_id = entra_object_id
        user.entra_tenant_id = entra_tenant_id
        if not user.password_hash:
            user.password_hash = get_password_hash(str(uuid4()))
        if user.role != "admin":
            user.role = resolved_role

    db.commit()
    db.refresh(user)
    return user


def _resolve_user_role(email: str, claims: dict[str, Any]) -> str:
    settings = get_settings()
    if any(str(role).lower() == "admin" for role in (claims.get("roles") or [])):
        return "admin"
    if email.lower() in settings.admin_emails_list:
        return "admin"
    return "viewer"


def _extract_email(claims: dict[str, Any]) -> str:
    for claim_name in ("preferred_username", "email", "upn", "unique_name"):
        value = claims.get(claim_name)
        if isinstance(value, str) and value.strip():
            return value.strip().lower()
    return ""


def _validate_entra_claims(claims: dict[str, Any]) -> None:
    settings = get_settings()

    tenant_id = str(claims.get("tid") or "")
    if tenant_id.lower() != settings.entra_tenant_id.lower():
        raise AuthenticationError("Microsoft token tenant is not allowed.")

    issuer = str(claims.get("iss") or "")
    if issuer.lower() not in {allowed.lower() for allowed in settings.entra_allowed_issuers}:
        raise AuthenticationError("Microsoft token issuer is not allowed.")

    audience = str(claims.get("aud") or "")
    if audience.lower() not in {allowed.lower() for allowed in settings.entra_allowed_audiences}:
        raise AuthenticationError("Microsoft token audience is not allowed.")

    scopes = {scope.lower() for scope in str(claims.get("scp") or "").split() if scope}
    roles = {str(role).lower() for role in (claims.get("roles") or [])}
    required_scope = settings.entra_required_scope.lower()
    if required_scope not in scopes and required_scope not in roles:
        raise AuthenticationError("Microsoft token does not include the required API permission.")

    if not claims.get("oid"):
        raise AuthenticationError("Microsoft token is missing an object identifier.")


def _get_signing_key(access_token: str) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(access_token)
    except JWTError as exc:
        raise AuthenticationError("Microsoft access token header is invalid.") from exc

    key_id = header.get("kid")
    if not key_id:
        raise AuthenticationError("Microsoft access token is missing a signing key identifier.")

    keys = _get_cached_jwks()
    for key in keys:
        if key.get("kid") == key_id:
            return key

    keys = _get_cached_jwks(force_refresh=True)
    for key in keys:
        if key.get("kid") == key_id:
            return key

    raise AuthenticationError("Unable to match the Microsoft signing key for this token.")


def _get_cached_jwks(force_refresh: bool = False) -> list[dict[str, Any]]:
    settings = get_settings()
    now = monotonic()
    if not force_refresh and _JWKS_CACHE["keys"] and _JWKS_CACHE["expires_at"] > now:
        return _JWKS_CACHE["keys"]

    try:
        response = httpx.get(settings.entra_jwks_url, timeout=5.0)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise AuthenticationError("Unable to download Microsoft signing keys.") from exc

    payload = response.json()
    keys = payload.get("keys")
    if not isinstance(keys, list) or not keys:
        raise AuthenticationError("Microsoft signing keys response was empty.")

    _JWKS_CACHE["keys"] = keys
    _JWKS_CACHE["expires_at"] = now + _parse_cache_max_age(response.headers.get("cache-control"))
    return keys


def _parse_cache_max_age(cache_control: str | None) -> int:
    if not cache_control:
        return 3600

    match = re.search(r"max-age=(\d+)", cache_control)
    if match is None:
        return 3600
    return int(match.group(1))

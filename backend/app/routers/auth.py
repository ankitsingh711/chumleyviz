from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, MicrosoftExchangeRequest, TokenResponse, UserRead
from app.services.auth_service import (
    AuthenticationError,
    authenticate_user,
    exchange_microsoft_access_token,
    issue_token_for_user,
)

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_user(db, payload)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    return TokenResponse(access_token=issue_token_for_user(user), user=UserRead.model_validate(user))


@router.post("/auth/microsoft/exchange", response_model=TokenResponse)
def exchange_microsoft(
    payload: MicrosoftExchangeRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    try:
        user = exchange_microsoft_access_token(db, payload.access_token)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    return TokenResponse(access_token=issue_token_for_user(user), user=UserRead.model_validate(user))

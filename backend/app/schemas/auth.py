from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, model_validator


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    provider: Optional[str] = None

    @model_validator(mode="after")
    def validate_login(self) -> "LoginRequest":
        if self.provider:
            return self
        if not self.email or not self.password:
            raise ValueError("Either provider or email/password credentials are required.")
        return self


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

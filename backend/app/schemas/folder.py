from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FolderCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    color: str = Field(default="#6C4DFF", max_length=32)
    description: str | None = Field(default=None, max_length=255)


class FolderUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    color: str | None = Field(default=None, max_length=32)
    description: str | None = Field(default=None, max_length=255)


class FolderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    color: str
    description: str | None = None
    dashboard_count: int = 0
    created_at: datetime
    updated_at: datetime

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DashboardWidget(BaseModel):
    id: str
    kind: Literal["metric", "trend", "bar", "table", "note"]
    title: str
    value: str | None = None
    delta: str | None = None
    body: str | None = None
    series: list[int] | None = None
    columns: list[str] | None = None
    rows: list[list[str]] | None = None


class DashboardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    owner: str
    category: str
    preview_tone: str
    widget_count: int
    folder_id: str | None = None
    widgets: list[DashboardWidget]
    created_at: datetime
    updated_at: datetime


class DashboardUpdate(BaseModel):
    folder_id: str | None = Field(default=None)

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class DashboardWidget(BaseModel):
    id: str
    kind: Literal["metric", "trend", "bar", "table", "note"]
    title: str
    value: Optional[str] = None
    delta: Optional[str] = None
    body: Optional[str] = None
    series: Optional[list[int]] = None
    columns: Optional[list[str]] = None
    rows: Optional[list[list[str]]] = None


class DashboardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    owner: str
    category: str
    preview_tone: str
    widget_count: int
    folder_id: Optional[str] = None
    widgets: list[DashboardWidget]
    created_at: datetime
    updated_at: datetime


class DashboardUpdate(BaseModel):
    folder_id: Optional[str] = Field(default=None)

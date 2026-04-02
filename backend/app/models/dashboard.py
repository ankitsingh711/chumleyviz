from uuid import uuid4

from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Dashboard(TimestampMixin, Base):
    __tablename__ = "dashboards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(140), nullable=False)
    description = Column(String(255), nullable=False)
    owner = Column(String(120), nullable=False)
    category = Column(String(64), nullable=False)
    preview_tone = Column(String(32), nullable=False, default="violet")
    widget_count = Column(Integer, nullable=False, default=0)
    folder_id = Column(String(36), ForeignKey("folders.id", ondelete="SET NULL"), nullable=True, index=True)
    widgets = Column(JSON, nullable=False, default=list)

    folder = relationship("Folder", back_populates="dashboards")

from uuid import uuid4

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Folder(TimestampMixin, Base):
    __tablename__ = "folders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(120), nullable=False)
    color = Column(String(32), nullable=False, default="#6C4DFF")
    description = Column(String(255), nullable=True)

    dashboards = relationship("Dashboard", back_populates="folder", passive_deletes=True)

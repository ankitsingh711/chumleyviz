from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.models.base import Base

_engine = None
_session_local = None


def get_engine():
    global _engine, _session_local
    if _engine is None:
        settings = get_settings()
        connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
        _engine = create_engine(settings.database_url, connect_args=connect_args)
        _session_local = sessionmaker(autocommit=False, autoflush=False, bind=_engine, expire_on_commit=False)
    return _engine


def get_session_local():
    get_engine()
    return _session_local


def reset_database_state() -> None:
    global _engine, _session_local
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _session_local = None


def init_db() -> None:
    from app.models import dashboard, folder, user  # noqa: F401

    Base.metadata.create_all(bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import get_session_local, init_db
from app.routers import auth, dashboards, folders, health
from app.services.seed_service import ensure_seed_data


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(title=settings.app_name, version="1.0.0")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(auth.router)
    application.include_router(folders.router)
    application.include_router(dashboards.router)

    @application.on_event("startup")
    def startup() -> None:
        init_db()
        session_local = get_session_local()
        db = session_local()
        try:
            ensure_seed_data(db)
        finally:
            db.close()

    return application


app = create_app()

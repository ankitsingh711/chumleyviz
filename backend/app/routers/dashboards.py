from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardRead, DashboardUpdate
from app.services import dashboard_service

router = APIRouter(tags=["dashboards"])


@router.get("/dashboards", response_model=list[DashboardRead])
def get_dashboards(
    folder_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[DashboardRead]:
    dashboards = dashboard_service.list_dashboards(db, folder_id)
    return [DashboardRead.model_validate(dashboard) for dashboard in dashboards]


@router.patch("/dashboards/{dashboard_id}", response_model=DashboardRead)
def patch_dashboard(
    dashboard_id: str,
    payload: DashboardUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> DashboardRead:
    dashboard = dashboard_service.update_dashboard(db, dashboard_id, payload)
    return DashboardRead.model_validate(dashboard)

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.dashboard import Dashboard
from app.models.folder import Folder
from app.schemas.dashboard import DashboardUpdate


def list_dashboards(db: Session, folder_id: str | None = None) -> list[Dashboard]:
    query = db.query(Dashboard)
    if folder_id == "unassigned":
        query = query.filter(Dashboard.folder_id.is_(None))
    elif folder_id:
        query = query.filter(Dashboard.folder_id == folder_id)

    return query.order_by(Dashboard.updated_at.desc(), Dashboard.title.asc()).all()


def update_dashboard(db: Session, dashboard_id: str, payload: DashboardUpdate) -> Dashboard:
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if dashboard is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found.")

    if "folder_id" in payload.model_fields_set and payload.folder_id:
        folder = db.query(Folder).filter(Folder.id == payload.folder_id).first()
        if folder is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target folder not found.")

    if "folder_id" in payload.model_fields_set:
        dashboard.folder_id = payload.folder_id

    db.commit()
    db.refresh(dashboard)
    return dashboard

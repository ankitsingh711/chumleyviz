from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.dashboard import Dashboard
from app.models.folder import Folder
from app.schemas.folder import FolderCreate, FolderRead, FolderUpdate


def list_folders(db: Session) -> list[FolderRead]:
    folders = db.query(Folder).order_by(Folder.name.asc()).all()

    results: list[FolderRead] = []
    for folder in folders:
        results.append(
            FolderRead.model_validate(
                {
                    **folder.__dict__,
                    "dashboard_count": len(folder.dashboards),
                }
            )
        )
    return results


def create_folder(db: Session, payload: FolderCreate) -> Folder:
    folder = Folder(name=payload.name, color=payload.color, description=payload.description)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


def update_folder(db: Session, folder_id: str, payload: FolderUpdate) -> Folder:
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")

    for field_name in ("name", "color", "description"):
        if field_name in payload.model_fields_set:
            setattr(folder, field_name, getattr(payload, field_name))

    db.commit()
    db.refresh(folder)
    return folder


def delete_folder(db: Session, folder_id: str) -> None:
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")

    db.query(Dashboard).filter(Dashboard.folder_id == folder_id).update({"folder_id": None})
    db.delete(folder)
    db.commit()

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.folder import FolderCreate, FolderRead, FolderUpdate
from app.services import folder_service

router = APIRouter(tags=["folders"])


@router.get("/folders", response_model=list[FolderRead])
def get_folders(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[FolderRead]:
    return folder_service.list_folders(db)


@router.post("/folders", response_model=FolderRead, status_code=status.HTTP_201_CREATED)
def create_folder(
    payload: FolderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> FolderRead:
    folder = folder_service.create_folder(db, payload)
    return FolderRead.model_validate({**folder.__dict__, "dashboard_count": 0})


@router.patch("/folders/{folder_id}", response_model=FolderRead)
def patch_folder(
    folder_id: str,
    payload: FolderUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> FolderRead:
    folder = folder_service.update_folder(db, folder_id, payload)
    return FolderRead.model_validate({**folder.__dict__, "dashboard_count": len(folder.dashboards)})


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Response:
    folder_service.delete_folder(db, folder_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

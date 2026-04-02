import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { formatUpdatedAt } from '@/lib/date';
import type { FolderRecord, ViewMode } from '@/types/models';

interface FolderCardProps {
  folder: FolderRecord;
  viewMode: ViewMode;
  onRename: (folder: FolderRecord) => void;
  onDelete: (folder: FolderRecord) => void;
}

export function FolderCard({ folder, viewMode, onRename, onDelete }: FolderCardProps) {
  return (
    <article className={`folder-card panel folder-card--${viewMode}`}>
      <div className="folder-card__accent" style={{ backgroundColor: folder.color }} />
      <div className="folder-card__body">
        <div className="folder-card__meta">
          <span className="pill">Folder</span>
          <span className="folder-card__count">{folder.dashboardCount} dashboards</span>
        </div>
        <div className="folder-card__title-row">
          <h3>{folder.name}</h3>
          <div className="folder-card__actions">
            <button type="button" className="icon-button" onClick={() => onRename(folder)}>
              Rename
            </button>
            <button type="button" className="icon-button icon-button--danger" onClick={() => onDelete(folder)}>
              Delete
            </button>
          </div>
        </div>
        <p>{folder.description || 'No description added yet.'}</p>
        <div className="folder-card__footer">
          <span>Updated {formatUpdatedAt(folder.updatedAt)}</span>
          <Link to={`/folders/${folder.id}`}>
            <Button variant="secondary" size="sm">
              Open folder
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

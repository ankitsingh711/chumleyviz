import { useDraggable } from '@dnd-kit/core';
import { Link } from 'react-router-dom';

import { formatUpdatedAt } from '@/lib/date';
import type { DashboardRecord, FolderRecord, ViewMode } from '@/types/models';

interface DashboardCardProps {
  dashboard: DashboardRecord;
  folders: FolderRecord[];
  viewMode: ViewMode;
  draggable?: boolean;
  onMove: (dashboardId: string, folderId: string | null) => Promise<void> | void;
}

export function DashboardCard({
  dashboard,
  folders,
  viewMode,
  draggable = true,
  onMove,
}: DashboardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dashboard.id,
    data: {
      dashboardId: dashboard.id,
      folderId: dashboard.folderId,
    },
    disabled: !draggable,
  });

  const style =
    transform && draggable
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

  return (
    <article
      ref={setNodeRef}
      className={`dashboard-card panel dashboard-card--${viewMode} ${isDragging ? 'dashboard-card--dragging' : ''}`}
      style={style}
    >
      <div className="dashboard-card__preview" data-tone={dashboard.previewTone}>
        <div className="dashboard-card__preview-grid">
          <span className="dashboard-card__preview-block dashboard-card__preview-block--wide" />
          <span className="dashboard-card__preview-block" />
          <span className="dashboard-card__preview-block" />
          <span className="dashboard-card__preview-block dashboard-card__preview-block--tall" />
        </div>
      </div>

      <div className="dashboard-card__body">
        <div className="dashboard-card__header">
          <div>
            <div className="dashboard-card__tags">
              <span className="pill">{dashboard.category}</span>
              <span className="dashboard-card__owner">{dashboard.owner}</span>
            </div>
            <h3>{dashboard.title}</h3>
          </div>
          {draggable ? (
            <button type="button" className="drag-handle" aria-label="Drag dashboard" {...listeners} {...attributes}>
              ⋮⋮
            </button>
          ) : null}
        </div>

        <p>{dashboard.description}</p>

        <div className="dashboard-card__footer">
          <div className="dashboard-card__info">
            <span>{dashboard.widgetCount} widgets</span>
            <span>Updated {formatUpdatedAt(dashboard.updatedAt)}</span>
          </div>
          <div className="dashboard-card__actions">
            <select
              className="dashboard-card__select"
              value={dashboard.folderId ?? 'unassigned'}
              onChange={(event) =>
                onMove(dashboard.id, event.target.value === 'unassigned' ? null : event.target.value)
              }
            >
              <option value="unassigned">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            <Link to={`/dashboards/${dashboard.id}`} className="dashboard-card__link">
              Open
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

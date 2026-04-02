import { useDroppable } from '@dnd-kit/core';

import { EmptyState } from '@/components/ui/EmptyState';
import type { DashboardRecord, FolderRecord, ViewMode } from '@/types/models';

import { DashboardCard } from './DashboardCard';

interface FolderLaneProps {
  id: string;
  title: string;
  description: string;
  color?: string;
  dashboards: DashboardRecord[];
  folders: FolderRecord[];
  viewMode: ViewMode;
  onMove: (dashboardId: string, folderId: string | null) => Promise<void>;
}

export function FolderLane({
  id,
  title,
  description,
  color,
  dashboards,
  folders,
  viewMode,
  onMove,
}: FolderLaneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      folderId: id === 'unassigned' ? null : id,
    },
  });

  return (
    <section ref={setNodeRef} className={`folder-lane panel ${isOver ? 'folder-lane--over' : ''}`}>
      <div className="folder-lane__header">
        <div>
          <div className="folder-lane__meta">
            <span className="pill">Drop zone</span>
            {color ? <span className="folder-lane__dot" style={{ backgroundColor: color }} /> : null}
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="folder-lane__count">{dashboards.length}</span>
      </div>

      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards here"
          description="Drop a dashboard card into this lane or use the folder picker on any card."
        />
      ) : (
        <div className={`dashboard-grid dashboard-grid--${viewMode}`}>
          {dashboards.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              folders={folders}
              viewMode={viewMode}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </section>
  );
}

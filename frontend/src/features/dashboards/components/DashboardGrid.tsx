import { EmptyState } from '@/components/ui/EmptyState';
import type { DashboardRecord, FolderRecord, ViewMode } from '@/types/models';

import { DashboardCard } from './DashboardCard';

interface DashboardGridProps {
  dashboards: DashboardRecord[];
  folders: FolderRecord[];
  viewMode: ViewMode;
  emptyTitle: string;
  emptyDescription: string;
  onMove: (dashboardId: string, folderId: string | null) => Promise<void>;
}

export function DashboardGrid({
  dashboards,
  folders,
  viewMode,
  emptyTitle,
  emptyDescription,
  onMove,
}: DashboardGridProps) {
  if (dashboards.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`dashboard-grid dashboard-grid--${viewMode}`}>
      {dashboards.map((dashboard) => (
        <DashboardCard
          key={dashboard.id}
          dashboard={dashboard}
          folders={folders}
          viewMode={viewMode}
          draggable={false}
          onMove={onMove}
        />
      ))}
    </div>
  );
}

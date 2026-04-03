import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { LoadingState } from '@/components/ui/LoadingState';
import { DashboardRenderer } from '@/features/dashboards/components/DashboardRenderer';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

export function DashboardDetailPage() {
  const { dashboardId } = useParams();
  const status = useWorkspaceStore((state) => state.status);
  const dashboardsById = useWorkspaceStore((state) => state.dashboardsById);
  const foldersById = useWorkspaceStore((state) => state.foldersById);
  const dashboard = useMemo(
    () => (dashboardId ? dashboardsById[dashboardId] ?? null : null),
    [dashboardId, dashboardsById],
  );
  const folder = useMemo(
    () => (dashboard?.folderId ? foldersById[dashboard.folderId] ?? null : null),
    [dashboard, foldersById],
  );

  if (status === 'loading' && !dashboard) {
    return <LoadingState label="Loading dashboard…" />;
  }

  if (!dashboardId || (!dashboard && status === 'ready')) {
    return <Navigate to="/" replace />;
  }

  return dashboard ? (
    <section className="page-section">
      <header className="page-header panel">
        <div>
          <div className="page-header__breadcrumb">
            <Link to="/">All dashboards</Link>
            <span>/</span>
            {folder ? <Link to={`/folders/${folder.id}`}>{folder.name}</Link> : <span>Unassigned</span>}
            <span>/</span>
            <span>{dashboard.title}</span>
          </div>
          <h1>{dashboard.title}</h1>
          <p>Reusable dashboard shell ready for external BI content or internal widget definitions.</p>
        </div>
      </header>

      <DashboardRenderer dashboard={dashboard} />
    </section>
  ) : null;
}

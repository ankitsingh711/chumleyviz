import { Link, Navigate, useParams } from 'react-router-dom';

import { LoadingState } from '@/components/ui/LoadingState';
import { DashboardRenderer } from '@/features/dashboards/components/DashboardRenderer';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

export function DashboardDetailPage() {
  const { dashboardId } = useParams();
  const status = useWorkspaceStore((state) => state.status);
  const dashboard = useWorkspaceStore((state) =>
    dashboardId ? state.dashboardsById[dashboardId] ?? null : null,
  );
  const folder = useWorkspaceStore((state) =>
    dashboard?.folderId ? state.foldersById[dashboard.folderId] ?? null : null,
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

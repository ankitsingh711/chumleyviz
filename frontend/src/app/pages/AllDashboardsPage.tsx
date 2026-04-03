import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getErrorMessage } from '@/lib/errors';
import { useThemeStore } from '@/theme/themeStore';
import type { FolderMutationInput } from '@/types/models';

import { DashboardOrganizerBoard } from '@/features/dashboards/components/DashboardOrganizerBoard';
import { DashboardGrid } from '@/features/dashboards/components/DashboardGrid';
import { FolderFormModal } from '@/features/folders/components/FolderFormModal';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

export function AllDashboardsPage() {
  const role = useSessionStore((state) => state.user?.role ?? 'viewer');
  const folderIds = useWorkspaceStore((state) => state.folderIds);
  const foldersById = useWorkspaceStore((state) => state.foldersById);
  const dashboardIds = useWorkspaceStore((state) => state.dashboardIds);
  const dashboardsById = useWorkspaceStore((state) => state.dashboardsById);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const createFolder = useWorkspaceStore((state) => state.createFolder);
  const moveDashboard = useWorkspaceStore((state) => state.moveDashboard);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const isAdmin = role === 'admin';
  const folders = useMemo(
    () => folderIds.map((folderId) => foldersById[folderId]).filter(Boolean),
    [folderIds, foldersById],
  );
  const dashboards = useMemo(
    () => dashboardIds.map((dashboardId) => dashboardsById[dashboardId]).filter(Boolean),
    [dashboardIds, dashboardsById],
  );

  async function handleCreateFolder(payload: FolderMutationInput) {
    try {
      await createFolder(payload);
      toast.success('Folder created.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleMove(dashboardId: string, folderId: string | null) {
    try {
      await moveDashboard(dashboardId, folderId);
      toast.success(folderId ? 'Dashboard moved.' : 'Dashboard removed from folder.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section className="page-section">
      <header className="page-header panel">
        <div>
          <span className="page-header__eyebrow">Organizer</span>
          <h1>All dashboards</h1>
          <p>
            Manage every dashboard in one place, then drag cards between folders to keep the
            workspace clean.
          </p>
        </div>
        <div className="page-header__actions">
          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === 'grid' ? 'view-toggle__button view-toggle__button--active' : 'view-toggle__button'}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'view-toggle__button view-toggle__button--active' : 'view-toggle__button'}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Toggle theme
          </Button>
          {isAdmin ? <Button onClick={() => setIsCreateOpen(true)}>Create folder</Button> : null}
        </div>
      </header>

      {!isAdmin ? (
        <div className="page-note panel">
          Viewer role is read-only. You can open dashboards, but folder and dashboard organization is
          restricted to admins.
        </div>
      ) : null}

      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards loaded"
          description="The organizer will populate as soon as dashboards are available from the API."
        />
      ) : !isAdmin ? (
        <DashboardGrid
          dashboards={dashboards}
          folders={folders}
          viewMode={viewMode}
          emptyTitle="No dashboards loaded"
          emptyDescription="Dashboards will appear here once they are available."
          canManage={false}
          onMove={handleMove}
        />
      ) : (
        <DashboardOrganizerBoard
          dashboards={dashboards}
          folders={folders}
          viewMode={viewMode}
          onMove={handleMove}
        />
      )}

      <FolderFormModal
        isOpen={isCreateOpen}
        title="Create folder"
        submitLabel="Create folder"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </section>
  );
}

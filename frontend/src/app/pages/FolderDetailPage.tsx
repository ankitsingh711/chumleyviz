import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { getErrorMessage } from '@/lib/errors';
import { useThemeStore } from '@/theme/themeStore';
import type { FolderMutationInput } from '@/types/models';

import { DashboardGrid } from '@/features/dashboards/components/DashboardGrid';
import { FolderFormModal } from '@/features/folders/components/FolderFormModal';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

export function FolderDetailPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const status = useWorkspaceStore((state) => state.status);
  const folders = useWorkspaceStore((state) =>
    state.folderIds.map((id) => state.foldersById[id]),
  );
  const dashboards = useWorkspaceStore((state) =>
    state.dashboardIds.map((id) => state.dashboardsById[id]),
  );
  const renameFolder = useWorkspaceStore((state) => state.renameFolder);
  const deleteFolder = useWorkspaceStore((state) => state.deleteFolder);
  const moveDashboard = useWorkspaceStore((state) => state.moveDashboard);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const folder = folderId ? folders.find((item) => item.id === folderId) ?? null : null;
  const folderDashboards = useMemo(
    () => dashboards.filter((dashboard) => dashboard.folderId === folderId),
    [dashboards, folderId],
  );

  if (status === 'loading' && !folder) {
    return <LoadingState />;
  }

  if (!folderId || (!folder && status === 'ready')) {
    return <Navigate to="/folders" replace />;
  }

  async function handleRename(payload: FolderMutationInput) {
    if (!folder) {
      return;
    }

    try {
      await renameFolder(folder.id, payload);
      toast.success('Folder updated.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!folder) {
      return;
    }

    if (!window.confirm(`Delete "${folder.name}"? Dashboards will be moved to unassigned.`)) {
      return;
    }

    try {
      await deleteFolder(folder.id);
      toast.success('Folder deleted.');
      navigate('/folders', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleMove(dashboardId: string, nextFolderId: string | null) {
    try {
      await moveDashboard(dashboardId, nextFolderId);
      toast.success(nextFolderId ? 'Dashboard moved.' : 'Dashboard removed from folder.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return folder ? (
    <section className="page-section">
      <header className="page-header panel">
        <div>
          <div className="page-header__breadcrumb">
            <Link to="/folders">Folders</Link>
            <span>/</span>
            <span>{folder.name}</span>
          </div>
          <h1>{folder.name}</h1>
          <p>{folder.description || 'This folder groups dashboards for a focused review workflow.'}</p>
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
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            Rename
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete folder
          </Button>
        </div>
      </header>

      <DashboardGrid
        dashboards={folderDashboards}
        folders={folders}
        viewMode={viewMode}
        emptyTitle="No dashboards in this folder"
        emptyDescription="Move dashboards here from the organizer or use the folder picker on a dashboard card."
        onMove={handleMove}
      />

      <FolderFormModal
        isOpen={isEditOpen}
        title="Rename folder"
        submitLabel="Save changes"
        initialValues={{
          name: folder.name,
          color: folder.color,
          description: folder.description ?? '',
        }}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleRename}
      />
    </section>
  ) : null;
}

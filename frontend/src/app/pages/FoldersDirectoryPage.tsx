import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getErrorMessage } from '@/lib/errors';
import { useThemeStore } from '@/theme/themeStore';
import type { FolderMutationInput, FolderRecord } from '@/types/models';

import { FolderCard } from '@/features/folders/components/FolderCard';
import { FolderFormModal } from '@/features/folders/components/FolderFormModal';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

export function FoldersDirectoryPage() {
  const folders = useWorkspaceStore((state) =>
    state.folderIds.map((folderId) => state.foldersById[folderId]),
  );
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const createFolder = useWorkspaceStore((state) => state.createFolder);
  const renameFolder = useWorkspaceStore((state) => state.renameFolder);
  const deleteFolder = useWorkspaceStore((state) => state.deleteFolder);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FolderRecord | null>(null);

  async function handleCreate(payload: FolderMutationInput) {
    try {
      await createFolder(payload);
      toast.success('Folder created.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleRename(payload: FolderMutationInput) {
    if (!folderToEdit) {
      return;
    }

    try {
      await renameFolder(folderToEdit.id, payload);
      toast.success('Folder updated.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete(folder: FolderRecord) {
    if (!window.confirm(`Delete "${folder.name}"? Dashboards will be moved to unassigned.`)) {
      return;
    }

    try {
      await deleteFolder(folder.id);
      toast.success('Folder deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section className="page-section">
      <header className="page-header panel">
        <div>
          <span className="page-header__eyebrow">Directory</span>
          <h1>Folders</h1>
          <p>Structure dashboard collections for teams, leaders, and ongoing operating rhythms.</p>
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
          <Button onClick={() => setIsCreateOpen(true)}>New folder</Button>
        </div>
      </header>

      {folders.length === 0 ? (
        <EmptyState
          title="No folders yet"
          description="Create a folder to start grouping dashboards by business function or team."
          action={<Button onClick={() => setIsCreateOpen(true)}>Create the first folder</Button>}
        />
      ) : (
        <div className={`folder-grid folder-grid--${viewMode}`}>
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              viewMode={viewMode}
              onRename={setFolderToEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <FolderFormModal
        isOpen={isCreateOpen}
        title="Create folder"
        submitLabel="Create folder"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <FolderFormModal
        isOpen={folderToEdit !== null}
        title="Rename folder"
        submitLabel="Save changes"
        initialValues={
          folderToEdit
            ? {
                name: folderToEdit.name,
                color: folderToEdit.color,
                description: folderToEdit.description ?? '',
              }
            : undefined
        }
        onClose={() => setFolderToEdit(null)}
        onSubmit={handleRename}
      />
    </section>
  );
}

import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useMemo, useState } from 'react';

import type { DashboardRecord, FolderRecord, ViewMode } from '@/types/models';

import { DashboardCard } from './DashboardCard';
import { FolderLane } from './FolderLane';

interface DashboardOrganizerBoardProps {
  dashboards: DashboardRecord[];
  folders: FolderRecord[];
  viewMode: ViewMode;
  onMove: (dashboardId: string, folderId: string | null) => Promise<void>;
}

export function DashboardOrganizerBoard({
  dashboards,
  folders,
  viewMode,
  onMove,
}: DashboardOrganizerBoardProps) {
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);

  const dashboardsByFolder = useMemo(() => {
    return folders.reduce<Record<string, DashboardRecord[]>>(
      (accumulator, folder) => ({
        ...accumulator,
        [folder.id]: dashboards.filter((dashboard) => dashboard.folderId === folder.id),
      }),
      {
        unassigned: dashboards.filter((dashboard) => dashboard.folderId === null),
      },
    );
  }, [dashboards, folders]);

  const activeDashboard =
    activeDashboardId ? dashboards.find((dashboard) => dashboard.id === activeDashboardId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    const dashboardId = event.active.data.current?.dashboardId as string | undefined;
    setActiveDashboardId(dashboardId ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDashboardId(null);

    const dashboardId = event.active.data.current?.dashboardId as string | undefined;
    const currentFolderId = event.active.data.current?.folderId as string | null | undefined;
    const nextFolderId = event.over?.data.current?.folderId as string | null | undefined;

    if (!dashboardId || nextFolderId === undefined || currentFolderId === nextFolderId) {
      return;
    }

    await onMove(dashboardId, nextFolderId);
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDashboardId(null)}
    >
      <div className="organizer-board">
        <FolderLane
          id="unassigned"
          title="Unassigned dashboards"
          description="Dashboards not currently placed inside a folder."
          dashboards={dashboardsByFolder.unassigned}
          folders={folders}
          viewMode={viewMode}
          onMove={onMove}
        />

        {folders.map((folder) => (
          <FolderLane
            key={folder.id}
            id={folder.id}
            title={folder.name}
            description={folder.description || 'No folder description available.'}
            color={folder.color}
            dashboards={dashboardsByFolder[folder.id] ?? []}
            folders={folders}
            viewMode={viewMode}
            onMove={onMove}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDashboard ? (
          <DashboardCard
            dashboard={activeDashboard}
            folders={folders}
            viewMode={viewMode}
            draggable={false}
            onMove={onMove}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

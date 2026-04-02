import type { ApiDashboard, ApiFolder, ApiUser } from '@/types/api';
import type { DashboardRecord, FolderRecord, UserSession } from '@/types/models';

function sortFolders(folders: FolderRecord[]): FolderRecord[] {
  return [...folders].sort((left, right) => left.name.localeCompare(right.name));
}

function sortDashboards(dashboards: DashboardRecord[]): DashboardRecord[] {
  return [...dashboards].sort((left, right) => {
    const updatedDelta = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    return updatedDelta !== 0 ? updatedDelta : left.title.localeCompare(right.title);
  });
}

export function mapUser(user: ApiUser): UserSession {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
  };
}

export function mapFolder(folder: ApiFolder): FolderRecord {
  return {
    id: folder.id,
    name: folder.name,
    color: folder.color,
    description: folder.description,
    dashboardCount: folder.dashboard_count,
    createdAt: folder.created_at,
    updatedAt: folder.updated_at,
  };
}

export function mapDashboard(dashboard: ApiDashboard): DashboardRecord {
  return {
    id: dashboard.id,
    title: dashboard.title,
    description: dashboard.description,
    owner: dashboard.owner,
    category: dashboard.category,
    previewTone: dashboard.preview_tone,
    widgetCount: dashboard.widget_count,
    folderId: dashboard.folder_id,
    widgets: dashboard.widgets,
    createdAt: dashboard.created_at,
    updatedAt: dashboard.updated_at,
  };
}

export function withFolderCounts(
  foldersById: Record<string, FolderRecord>,
  dashboardsById: Record<string, DashboardRecord>,
): Record<string, FolderRecord> {
  const counts = Object.values(dashboardsById).reduce<Record<string, number>>((accumulator, dashboard) => {
    if (dashboard.folderId) {
      accumulator[dashboard.folderId] = (accumulator[dashboard.folderId] ?? 0) + 1;
    }
    return accumulator;
  }, {});

  return Object.fromEntries(
    Object.entries(foldersById).map(([folderId, folder]) => [
      folderId,
      {
        ...folder,
        dashboardCount: counts[folderId] ?? 0,
      },
    ]),
  );
}

export function normalizeWorkspace(folders: ApiFolder[], dashboards: ApiDashboard[]) {
  const mappedFolders = sortFolders(folders.map(mapFolder));
  const mappedDashboards = sortDashboards(dashboards.map(mapDashboard));

  const foldersById = Object.fromEntries(mappedFolders.map((folder) => [folder.id, folder]));
  const dashboardsById = Object.fromEntries(
    mappedDashboards.map((dashboard) => [dashboard.id, dashboard]),
  );

  return {
    foldersById: withFolderCounts(foldersById, dashboardsById),
    folderIds: mappedFolders.map((folder) => folder.id),
    dashboardsById,
    dashboardIds: mappedDashboards.map((dashboard) => dashboard.id),
  };
}

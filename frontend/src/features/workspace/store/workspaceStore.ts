import { create } from 'zustand';

import { getErrorMessage } from '@/lib/errors';
import type { DashboardRecord, FolderMutationInput, FolderRecord, ViewMode } from '@/types/models';

import * as workspaceApi from '@/services/api/workspaceApi';

import { mapDashboard, mapFolder, normalizeWorkspace, withFolderCounts } from '../utils/normalizers';

type WorkspaceStatus = 'idle' | 'loading' | 'ready' | 'error';

interface WorkspaceState {
  foldersById: Record<string, FolderRecord>;
  folderIds: string[];
  dashboardsById: Record<string, DashboardRecord>;
  dashboardIds: string[];
  status: WorkspaceStatus;
  error: string | null;
  viewMode: ViewMode;
  fetchWorkspace: () => Promise<void>;
  createFolder: (payload: FolderMutationInput) => Promise<FolderRecord>;
  renameFolder: (folderId: string, payload: FolderMutationInput) => Promise<FolderRecord>;
  deleteFolder: (folderId: string) => Promise<void>;
  moveDashboard: (dashboardId: string, folderId: string | null) => Promise<DashboardRecord>;
  setViewMode: (mode: ViewMode) => void;
}

function sortFolderIds(foldersById: Record<string, FolderRecord>): string[] {
  return Object.values(foldersById)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((folder) => folder.id);
}

function sortDashboardIds(dashboardsById: Record<string, DashboardRecord>): string[] {
  return Object.values(dashboardsById)
    .sort((left, right) => {
      const updatedDelta = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      return updatedDelta !== 0 ? updatedDelta : left.title.localeCompare(right.title);
    })
    .map((dashboard) => dashboard.id);
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  foldersById: {},
  folderIds: [],
  dashboardsById: {},
  dashboardIds: [],
  status: 'idle',
  error: null,
  viewMode: 'grid',
  async fetchWorkspace() {
    set({ status: 'loading', error: null });

    try {
      const [folders, dashboards] = await Promise.all([
        workspaceApi.fetchFolders(),
        workspaceApi.fetchDashboards(),
      ]);

      set({
        ...normalizeWorkspace(folders, dashboards),
        status: 'ready',
        error: null,
      });
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      });
      throw error;
    }
  },
  async createFolder(payload) {
    const createdFolder = mapFolder(await workspaceApi.createFolder(payload));

    set((state) => {
      const foldersById = withFolderCounts(
        {
          ...state.foldersById,
          [createdFolder.id]: createdFolder,
        },
        state.dashboardsById,
      );

      return {
        foldersById,
        folderIds: sortFolderIds(foldersById),
      };
    });

    return createdFolder;
  },
  async renameFolder(folderId, payload) {
    const updatedFolder = mapFolder(await workspaceApi.updateFolder(folderId, payload));

    set((state) => {
      const foldersById = withFolderCounts(
        {
          ...state.foldersById,
          [folderId]: updatedFolder,
        },
        state.dashboardsById,
      );

      return {
        foldersById,
        folderIds: sortFolderIds(foldersById),
      };
    });

    return updatedFolder;
  },
  async deleteFolder(folderId) {
    await workspaceApi.deleteFolder(folderId);

    set((state) => {
      const nextFoldersById = { ...state.foldersById };
      delete nextFoldersById[folderId];

      const nextDashboardsById = Object.fromEntries(
        Object.entries(state.dashboardsById).map(([dashboardId, dashboard]) => [
          dashboardId,
          dashboard.folderId === folderId ? { ...dashboard, folderId: null } : dashboard,
        ]),
      );

      return {
        foldersById: withFolderCounts(nextFoldersById, nextDashboardsById),
        folderIds: sortFolderIds(nextFoldersById),
        dashboardsById: nextDashboardsById,
      };
    });
  },
  async moveDashboard(dashboardId, folderId) {
    const updatedDashboard = mapDashboard(await workspaceApi.moveDashboard(dashboardId, folderId));

    set((state) => {
      const dashboardsById = {
        ...state.dashboardsById,
        [dashboardId]: updatedDashboard,
      };

      return {
        dashboardsById,
        dashboardIds: sortDashboardIds(dashboardsById),
        foldersById: withFolderCounts(state.foldersById, dashboardsById),
      };
    });

    return updatedDashboard;
  },
  setViewMode(mode) {
    set({ viewMode: mode });
  },
}));

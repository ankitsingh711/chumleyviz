import apiClient from '@/services/api/client';
import type { ApiDashboard, ApiFolder } from '@/types/api';

export async function fetchFolders(): Promise<ApiFolder[]> {
  const { data } = await apiClient.get<ApiFolder[]>('/folders');
  return data;
}

export async function fetchDashboards(folderId?: string): Promise<ApiDashboard[]> {
  const { data } = await apiClient.get<ApiDashboard[]>('/dashboards', {
    params: folderId ? { folder_id: folderId } : undefined,
  });
  return data;
}

export async function createFolder(payload: {
  name: string;
  color: string;
  description: string;
}): Promise<ApiFolder> {
  const { data } = await apiClient.post<ApiFolder>('/folders', payload);
  return data;
}

export async function updateFolder(
  folderId: string,
  payload: Partial<{
    name: string;
    color: string;
    description: string;
  }>,
): Promise<ApiFolder> {
  const { data } = await apiClient.patch<ApiFolder>(`/folders/${folderId}`, payload);
  return data;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await apiClient.delete(`/folders/${folderId}`);
}

export async function moveDashboard(
  dashboardId: string,
  folderId: string | null,
): Promise<ApiDashboard> {
  const { data } = await apiClient.patch<ApiDashboard>(`/dashboards/${dashboardId}`, {
    folder_id: folderId,
  });
  return data;
}

export type ThemeMode = 'light' | 'dark';
export type ViewMode = 'grid' | 'list';
export type DashboardTone = 'violet' | 'teal' | 'orange' | 'blue' | 'slate' | string;

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
}

export interface FolderRecord {
  id: string;
  name: string;
  color: string;
  description: string | null;
  dashboardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  kind: 'metric' | 'trend' | 'bar' | 'table' | 'note';
  title: string;
  value?: string | null;
  delta?: string | null;
  body?: string | null;
  series?: number[] | null;
  columns?: string[] | null;
  rows?: string[][] | null;
}

export interface DashboardRecord {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  previewTone: DashboardTone;
  widgetCount: number;
  folderId: string | null;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderMutationInput {
  name: string;
  color: string;
  description: string;
}

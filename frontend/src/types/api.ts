export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'viewer';
}

export interface ApiAuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiFolder {
  id: string;
  name: string;
  color: string;
  description: string | null;
  dashboard_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiDashboardWidget {
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

export interface ApiDashboard {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  preview_tone: string;
  widget_count: number;
  folder_id: string | null;
  widgets: ApiDashboardWidget[];
  created_at: string;
  updated_at: string;
}

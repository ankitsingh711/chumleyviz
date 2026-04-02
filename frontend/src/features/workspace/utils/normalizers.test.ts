import { describe, expect, it } from 'vitest';

import { normalizeWorkspace } from './normalizers';

describe('normalizeWorkspace', () => {
  it('builds entity maps and folder counts', () => {
    const normalized = normalizeWorkspace(
      [
        {
          id: 'folder-1',
          name: 'Revenue',
          color: '#5C4CFF',
          description: null,
          dashboard_count: 1,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      [
        {
          id: 'dashboard-1',
          title: 'Pipeline',
          description: 'desc',
          owner: 'Ops',
          category: 'Sales',
          preview_tone: 'violet',
          widget_count: 2,
          folder_id: 'folder-1',
          widgets: [],
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-02T00:00:00.000Z',
        },
      ],
    );

    expect(normalized.folderIds).toEqual(['folder-1']);
    expect(normalized.dashboardIds).toEqual(['dashboard-1']);
    expect(normalized.foldersById['folder-1'].dashboardCount).toBe(1);
  });
});

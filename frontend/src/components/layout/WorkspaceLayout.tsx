import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { LoadingState } from '@/components/ui/LoadingState';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

import { Sidebar } from './Sidebar';

export function WorkspaceLayout() {
  const token = useSessionStore((state) => state.token);
  const fetchWorkspace = useWorkspaceStore((state) => state.fetchWorkspace);
  const status = useWorkspaceStore((state) => state.status);
  const error = useWorkspaceStore((state) => state.error);
  const isBootstrapping = Boolean(token) && status === 'idle';

  useEffect(() => {
    if (token && status === 'idle') {
      void fetchWorkspace();
    }
  }, [fetchWorkspace, status, token]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="workspace-main">
        {error ? <div className="error-banner panel">{error}</div> : null}
        {isBootstrapping || status === 'loading' ? <LoadingState /> : <Outlet />}
      </main>
    </div>
  );
}

import { NavLink } from 'react-router-dom';

import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useWorkspaceStore } from '@/features/workspace/store/workspaceStore';

export function Sidebar() {
  const folders = useWorkspaceStore((state) =>
    state.folderIds.map((folderId) => state.foldersById[folderId]),
  );
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <BrandMark compact />
        <span className="sidebar__beta">dashboard manager</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          All dashboards
        </NavLink>
        <NavLink
          to="/folders"
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          Folders
        </NavLink>
      </nav>

      <div className="sidebar__folders">
        <div className="sidebar__section-title">Folder shortcuts</div>
        {folders.map((folder) => (
          <NavLink
            key={folder.id}
            to={`/folders/${folder.id}`}
            className={({ isActive }) => `sidebar__folder ${isActive ? 'sidebar__folder--active' : ''}`}
          >
            <span className="sidebar__folder-dot" style={{ backgroundColor: folder.color }} />
            <span>{folder.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__user-label">Signed in as</span>
          <strong>{user?.fullName ?? 'Analyst'}</strong>
          <span>{user?.email ?? 'microsoft@aspect.local'}</span>
        </div>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}

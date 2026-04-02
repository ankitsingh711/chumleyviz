import { createBrowserRouter, Navigate } from 'react-router-dom';

import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { ProtectedRoute } from '@/features/auth/routes/ProtectedRoute';

import { AllDashboardsPage } from './pages/AllDashboardsPage';
import { DashboardDetailPage } from './pages/DashboardDetailPage';
import { FolderDetailPage } from './pages/FolderDetailPage';
import { FoldersDirectoryPage } from './pages/FoldersDirectoryPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <WorkspaceLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AllDashboardsPage />,
      },
      {
        path: 'folders',
        element: <FoldersDirectoryPage />,
      },
      {
        path: 'folders/:folderId',
        element: <FolderDetailPage />,
      },
      {
        path: 'dashboards/:dashboardId',
        element: <DashboardDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

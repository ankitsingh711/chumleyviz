import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useSessionStore } from '@/features/auth/store/sessionStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useSessionStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

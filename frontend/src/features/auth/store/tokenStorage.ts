import type { UserSession } from '@/types/models';

const STORAGE_KEY = 'chumleyviz.session';

interface StoredSession {
  token: string;
  user: UserSession;
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeStoredSession(session: StoredSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return readStoredSession()?.token ?? null;
}

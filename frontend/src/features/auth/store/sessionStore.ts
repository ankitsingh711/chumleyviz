import { create } from 'zustand';

import { getErrorMessage } from '@/lib/errors';
import type { UserSession } from '@/types/models';

import { loginWithMicrosoft } from '../services/authService';
import { clearStoredSession, readStoredSession, writeStoredSession } from './tokenStorage';

type SessionStatus = 'idle' | 'loading' | 'authenticated';

interface SessionState {
  token: string | null;
  user: UserSession | null;
  status: SessionStatus;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const storedSession = readStoredSession();

export const useSessionStore = create<SessionState>((set) => ({
  token: storedSession?.token ?? null,
  user: storedSession?.user ?? null,
  status: storedSession ? 'authenticated' : 'idle',
  error: null,
  async login() {
    set({ status: 'loading', error: null });

    try {
      const session = await loginWithMicrosoft();
      writeStoredSession(session);
      set({
        token: session.token,
        user: session.user,
        status: 'authenticated',
        error: null,
      });
    } catch (error) {
      clearStoredSession();
      set({
        token: null,
        user: null,
        status: 'idle',
        error: getErrorMessage(error),
      });
      throw error;
    }
  },
  logout() {
    clearStoredSession();
    set({
      token: null,
      user: null,
      status: 'idle',
      error: null,
    });
  },
}));

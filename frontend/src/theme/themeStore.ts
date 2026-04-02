import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '@/types/models';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme() {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },
    }),
    {
      name: 'chumleyviz.theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

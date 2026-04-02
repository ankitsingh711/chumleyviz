import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useThemeStore } from '@/theme/themeStore';

import { router } from './router';

function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-shell',
        }}
      />
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '../store/usePreferencesStore';

export function useDashboardTheme() {
  const theme = usePreferencesStore((s) => s.theme);
  const language = usePreferencesStore((s) => s.language);
  // Apply theme class & dir to dashboard root
  useEffect(() => {
    const root = document.querySelector('.dashboard-root') as HTMLElement | null;
    if (!root) return;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    }
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [theme, language]);

  return { theme, language };
}

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

interface PreferencesState {
  theme: Theme;
  language: Language;
  lightPaletteId: string;
  darkPaletteId: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setLightPalette: (id: string) => void;
  setDarkPalette: (id: string) => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'en',
      lightPaletteId: 'emerald',
      darkPaletteId: 'emerald',
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === 'en' ? 'ar' : 'en' }),
      setLightPalette: (lightPaletteId) => set({ lightPaletteId }),
      setDarkPalette: (darkPaletteId) => set({ darkPaletteId }),
    }),
    {
      name: 'dashboard-preferences',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ theme: state.theme, language: state.language, lightPaletteId: state.lightPaletteId, darkPaletteId: state.darkPaletteId }),
    }
  )
);

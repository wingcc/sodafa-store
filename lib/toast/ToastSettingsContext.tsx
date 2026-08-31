// lib/toast/ToastSettingsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastSettings {
  position: ToastPosition;
  duration: number;
  autoDismiss: boolean;
  showProgress: boolean;
  maxToasts: number;
}

const defaultSettings: ToastSettings = {
  position: 'top-right',
  duration: 4000,
  autoDismiss: true,
  showProgress: true,
  maxToasts: 5,
};

const STORAGE_KEY = 'toast_settings';

type ToastSettingsContextType = {
  settings: ToastSettings;
  updateSettings: (newSettings: Partial<ToastSettings>) => void;
  resetSettings: () => void;
};

const ToastSettingsContext = createContext<ToastSettingsContextType | undefined>(undefined);

export function ToastSettingsProvider({ children }: { children: ReactNode }) {
  const getInitialSettings = (): ToastSettings => {
    if (typeof window === 'undefined') return defaultSettings;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultSettings;

      const parsed = JSON.parse(stored) as Partial<ToastSettings>;
      return {
        ...defaultSettings,
        ...parsed,
        maxToasts: Math.min(Math.max(parsed.maxToasts ?? defaultSettings.maxToasts, 1), 10),
      };
    } catch {
      return defaultSettings;
    }
  };

  const [settings, setSettings] = useState<ToastSettings>(getInitialSettings);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ToastSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      maxToasts: Math.min(Math.max(newSettings.maxToasts ?? prev.maxToasts, 1), 10),
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ToastSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </ToastSettingsContext.Provider>
  );
}

export const useToastSettings = () => {
  const context = useContext(ToastSettingsContext);
  if (!context) {
    throw new Error('useToastSettings must be used within a ToastSettingsProvider');
  }
  return context;
};
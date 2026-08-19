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
  duration: number; // milliseconds
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
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (_) {
      // ignore
    }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<ToastSettings>(getInitialSettings);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ToastSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
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
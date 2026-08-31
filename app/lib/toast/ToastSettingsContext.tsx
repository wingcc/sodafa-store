"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

type ToastPosition = "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center";
type ToastSettings = { duration: number; position: ToastPosition; autoDismiss: boolean; showProgress: boolean; maxToasts: number };

type ToastSettingsContextType = {
  settings: ToastSettings;
  updateSettings: (next: Partial<ToastSettings>) => void;
  resetSettings: () => void;
};

const defaultSettings: ToastSettings = {
  duration: 4000,
  position: "top-right",
  autoDismiss: true,
  showProgress: true,
  maxToasts: 5,
};

const ToastSettingsContext = createContext<ToastSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
});

export const useToastSettings = () => useContext(ToastSettingsContext);

export function ToastSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ToastSettings>(defaultSettings);

  const updateSettings = useCallback((next: Partial<ToastSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...next,
      maxToasts: Math.min(Math.max(next.maxToasts ?? prev.maxToasts, 1), 10),
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo(() => ({ settings, updateSettings, resetSettings }), [resetSettings, settings, updateSettings]);

  return <ToastSettingsContext.Provider value={value}>{children}</ToastSettingsContext.Provider>;
}

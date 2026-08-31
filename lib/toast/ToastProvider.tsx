// lib/toast/ToastProvider.tsx
'use client';

import { createContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Toast, ToastContextType, ToastOptions, ToastType } from './types';
import { ToastContainer } from '@/lib/toast/ToastContainer';
import { useToastSettings } from '@/lib/toast/ToastSettingsContext';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { settings } = useToastSettings();

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const newToast: Toast = {
        id,
        type,
        message,
        title: options?.title || type.charAt(0).toUpperCase() + type.slice(1),
        duration: options?.duration ?? settings.duration,
        autoDismiss: options?.autoDismiss ?? settings.autoDismiss,
        showProgress: options?.showProgress ?? settings.showProgress,
      };

      setToasts((prev) => {
        const nextToasts = [...prev, newToast];
        const maxVisible = Math.max(1, settings.maxToasts || 1);
        return nextToasts.length > maxVisible ? nextToasts.slice(-maxVisible) : nextToasts;
      });

      return id;
    },
    [settings]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo<ToastContextType>(() => ({
    toasts,
    addToast,
    removeToast,
    dismissAll,
  }), [addToast, dismissAll, removeToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export { ToastContext };
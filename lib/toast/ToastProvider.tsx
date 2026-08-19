// lib/toast/ToastProvider.tsx
'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastContextType, ToastOptions, ToastType } from './types';
import { ToastContainer } from '@/lib/toast/ToastContainer';
import { useToastSettings } from '@/lib/toast/ToastSettingsContext';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { settings } = useToastSettings();

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
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
        const updated = [...prev, newToast];
        // Enforce maxToasts
        if (updated.length > settings.maxToasts) {
          return updated.slice(-settings.maxToasts);
        }
        return updated;
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

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export { ToastContext };
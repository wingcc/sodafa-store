"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: string; message: string; title?: string; type?: ToastType; duration?: number; autoDismiss?: boolean; showProgress?: boolean };
type ToastContextType = { toasts: Toast[]; addToast: (message: string, type?: ToastType, options?: Partial<Pick<Toast, 'title' | 'duration' | 'autoDismiss' | 'showProgress'>>) => void; removeToast: (id: string) => void };

const ToastContext = createContext<ToastContextType>({ toasts: [], addToast: () => {}, removeToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success", options: Partial<Pick<Toast, 'title' | 'duration' | 'autoDismiss' | 'showProgress'>> = {}) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nextToast: Toast = { id, message, type, title: options.title ?? (type.charAt(0).toUpperCase() + type.slice(1)), duration: options.duration ?? 4000, autoDismiss: options.autoDismiss ?? true, showProgress: options.showProgress ?? true };

    setToasts((prev) => {
      const next = [...prev, nextToast];
      return next.length > 5 ? next.slice(-5) : next;
    });

    if (nextToast.autoDismiss !== false) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), nextToast.duration ?? 4000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [addToast, removeToast, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

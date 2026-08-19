"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: string; message: string; type?: "success" | "error" | "info" };
type ToastContextType = { toasts: Toast[]; addToast: (message: string, type?: Toast["type"]) => void; removeToast: (id: string) => void };

const ToastContext = createContext<ToastContextType>({ toasts: [], addToast: () => {}, removeToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  const removeToast = useCallback((id: string) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);
  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>;
}

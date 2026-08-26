'use client';

import { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { StoreToastItem, ToastType } from './StoreToast';
import { StoreToastContainer } from './StoreToastContainer';

interface StoreToastContextType {
  toasts: StoreToastItem[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const StoreToastContext = createContext<StoreToastContextType | undefined>(undefined);

export function useStoreToast() {
  const context = useContext(StoreToastContext);
  if (!context) {
    throw new Error('useStoreToast must be used within a StoreToastProvider');
  }
  return context;
}

export function StoreToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<StoreToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
    const newToast: StoreToastItem = { id, type, message, duration };
    setToasts((prev) => [...prev, newToast].slice(-3)); // max 3 toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <StoreToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <StoreToastContainer toasts={toasts} removeToast={removeToast} />
    </StoreToastContext.Provider>
  );
}

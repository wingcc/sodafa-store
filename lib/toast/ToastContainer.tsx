// lib/toast/ToastContainer.tsx
'use client';


import { useToast } from './useToast';
import { useToastSettings } from './ToastSettingsContext';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const { settings } = useToastSettings();

  const positionClass = `toast-${settings.position}`;

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none ${positionClass}`}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
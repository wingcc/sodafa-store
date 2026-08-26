'use client';

import { StoreToastItem, StoreToast } from './StoreToast';

interface StoreToastContainerProps {
  toasts: StoreToastItem[];
  removeToast: (id: string) => void;
}

export function StoreToastContainer({ toasts, removeToast }: StoreToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
      <div className="flex flex-col gap-3 p-4 w-full max-w-[420px] pointer-events-auto">
        {toasts.map((toast) => (
          <StoreToast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
}

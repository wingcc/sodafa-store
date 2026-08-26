'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface StoreToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface StoreToastProps {
  toast: StoreToastItem;
  onRemove: (id: string) => void;
}

const iconColorMap: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const bgColorMap: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
};

const progressColorMap: Record<ToastType, string> = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </svg>
  );
}

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

export function StoreToast({ toast, onRemove }: StoreToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const animationRef = useRef<number | null>(null);
  const duration = toast.duration || 3000;
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const handleRemove = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 400);
  }, [onRemove, toast.id]);

  useEffect(() => {
    const entrance = requestAnimationFrame(() => setIsVisible(true));

    const startTime = performance.now();
    const updateProgress = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);
      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        handleRemove();
      }
    };
    animationRef.current = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(entrance);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [duration, handleRemove]);

  const Icon = icons[toast.type];

  return (
    <div
      className={`w-full p-4 rounded-2xl border shadow-lg transition-all duration-400 ease-out ${
        isVisible ? 'store-toast-enter' : 'store-toast-exit'
      } ${bgColorMap[toast.type]}`}
      role="alert"
      tabIndex={-1}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start gap-3">
        <div className="store-toast-icon shrink-0">
          <Icon className={`w-5 h-5 ${iconColorMap[toast.type]}`} />
        </div>
        <div className="grow min-w-0">
          <p className={`text-sm font-semibold text-stone-800 leading-snug ${isAr ? 'font-[Tajawal]' : ''}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors p-0.5"
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-stone-200/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: progressColorMap[toast.type], transition: 'none' }}
        />
      </div>
    </div>
  );
}

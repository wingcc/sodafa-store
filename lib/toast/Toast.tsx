'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from 'lucide-react';
import { Toast as ToastType } from './types';

const typeStyles = {
  success: {
    className: 'border-emerald-200/80 bg-white/90',
    iconWrap: 'bg-emerald-100 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.18)]',
    glow: 'bg-emerald-500/15',
    bar: 'from-emerald-500 via-green-400 to-lime-400',
    accent: 'bg-emerald-500',
    ring: '#10b981',
    icon: CheckCircle2,
  },
  error: {
    className: 'border-red-200/80 bg-white/90',
    iconWrap: 'bg-red-100 text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.18)]',
    glow: 'bg-red-500/15',
    bar: 'from-red-500 via-rose-400 to-orange-400',
    accent: 'bg-red-500',
    ring: '#ef4444',
    icon: AlertCircle,
  },
  warning: {
    className: 'border-amber-200/80 bg-white/90',
    iconWrap: 'bg-amber-100 text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.18)]',
    glow: 'bg-amber-500/15',
    bar: 'from-amber-500 via-yellow-400 to-orange-300',
    accent: 'bg-amber-500',
    ring: '#f59e0b',
    icon: TriangleAlert,
  },
  info: {
    className: 'border-sky-200/80 bg-white/90',
    iconWrap: 'bg-sky-100 text-sky-700 shadow-[0_8px_20px_rgba(59,130,246,0.18)]',
    glow: 'bg-sky-500/15',
    bar: 'from-sky-500 via-cyan-400 to-indigo-400',
    accent: 'bg-sky-500',
    ring: '#0ea5e9',
    icon: Info,
  },
} as const;

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const animationRef = useRef<number | null>(null);
  const duration = toast.duration || 4000;
  const autoDismiss = toast.autoDismiss !== false;
  const showProgress = toast.showProgress !== false;
  const style = typeStyles[toast.type];
  const Icon = style.icon;

  const handleRemove = useCallback(() => {
    setIsVisible(false);
    window.setTimeout(() => {
      onRemove(toast.id);
    }, 220);
  }, [onRemove, toast.id]);

  useEffect(() => {
    const entrance = window.requestAnimationFrame(() => setIsVisible(true));

    if (!autoDismiss) {
      return () => window.cancelAnimationFrame(entrance);
    }

    const startTime = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);

      if (remaining > 0) {
        animationRef.current = window.requestAnimationFrame(updateProgress);
      } else {
        handleRemove();
      }
    };

    animationRef.current = window.requestAnimationFrame(updateProgress);

    return () => {
      window.cancelAnimationFrame(entrance);
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoDismiss, duration, handleRemove]);

  const progressStyle = showProgress && autoDismiss
    ? {
        background: `conic-gradient(${style.ring} 0deg ${Math.max(0, progress) * 3.6}deg, rgba(148, 163, 184, 0.22) ${Math.max(0, progress) * 3.6}deg 360deg)`,
      }
    : undefined;

  return (
    <div
      className={[
        'relative w-full overflow-hidden rounded-2xl border shadow-[0_18px_45px_rgba(15,23,42,0.13)] backdrop-blur-xl transition-all duration-300 ease-out',
        style.className,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0',
      ].join(' ')}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-900/20 to-transparent`} />
      <div className={`absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full blur-2xl ${style.glow}`} />

      <div className="relative flex items-start gap-3 px-3.5 py-3.5 pl-4">
        <div className="relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.1)]"
            style={progressStyle}
          />
          <div className="absolute inset-[7px] rounded-full bg-white shadow-inner shadow-slate-200/80" />
          <div className={`absolute inset-[11px] rounded-full ${style.iconWrap} flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold tracking-[-0.01em] text-slate-900">{toast.title}</p>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-600">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

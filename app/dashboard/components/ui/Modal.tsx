'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

/**
 * Reusable Dashboard Modal — ported from Resources/Shipping.
 * Adapted to dashboard palette (#0b2e22 primary, #d97706 accent).
 * Scoped under .dashboard-root via dashboard.css animations.
 * Features: Esc to close, overlay click, body scroll lock, blur backdrop.
 */
const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className={`dashboard-modal w-full ${sizeMap[size]} max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in`}
        style={{ animation: 'zoomIn 0.18s ease-out' }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0">
            <h3 className="text-lg font-bold" style={{ color: '#0b2e22' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-2 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

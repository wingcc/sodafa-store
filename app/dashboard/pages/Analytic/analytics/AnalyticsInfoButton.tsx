'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  title: string;
  description: string;
  bullets?: string[];
  hint?: string;
}

const AnalyticsInfoButton: React.FC<Props> = ({ title, description, bullets, hint }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const { isRTL } = useTranslation();

  const updatePosition = React.useCallback(() => {
    if (!btnRef.current || !popupRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popup = popupRef.current;
    const pw = popup.offsetWidth || 340;
    const ph = popup.offsetHeight || 200;
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = rect.bottom + margin;
    let left = isRTL ? rect.right - pw : rect.left;
    if (top + ph > vh - margin) {
      const above = rect.top - ph - margin;
      if (above > margin) top = above;
      else top = Math.max(margin, vh - ph - margin);
    }
    if (left + pw > vw - margin) left = vw - pw - margin;
    if (left < margin) left = margin;
    if (vw < 640) {
      left = (vw - Math.min(pw, vw - margin * 2)) / 2;
      top = Math.min(top, vh - ph - margin);
    }
    setPos({ top, left });
  }, [isRTL]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popupRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updatePosition]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Info: ${title}`}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 hover:text-[var(--color-darkGreen)] hover:border-[var(--color-darkGreen)]/20 hover:bg-[var(--color-darkGreen)]/5 dark:hover:text-white shrink-0"
      >
        <Info size={12} strokeWidth={2.2} />
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            role="dialog"
            aria-label={title}
            style={{ position: 'fixed', top: pos.top, left: pos.left, maxWidth: 'calc(100vw - 16px)' }}
            className="z-[100] w-[300px] sm:w-[340px] rounded-2xl border shadow-2xl backdrop-blur-xl bg-white dark:bg-[#131a28] border-gray-100 dark:border-white/10 p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-5 pr-2">{title}</h4>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 shrink-0">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs leading-5 text-gray-600 dark:text-gray-300">{description}</p>
            {bullets && bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-[var(--color-darkGreen)] dark:bg-[var(--color-gold)] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {hint && (
              <p className="mt-3 text-[11px] leading-4 px-2.5 py-2 rounded-xl bg-[var(--color-darkGreen)]/5 dark:bg-white/5 border border-[var(--color-darkGreen)]/10 dark:border-white/10 text-gray-600 dark:text-gray-300">
                {hint}
              </p>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default AnalyticsInfoButton;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  title: string;
  description: string;
  bullets?: string[];
  hint?: string;
}

const DashboardInfoButton: React.FC<Props> = ({ title, description, bullets, hint }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { isRTL } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onEsc); };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Info: ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors
          bg-white dark:bg-white/5 border-gray-200 dark:border-white/10
          text-gray-400 hover:text-[var(--color-darkGreen)] hover:border-[var(--color-darkGreen)]/20 hover:bg-[var(--color-darkGreen)]/5
          dark:hover:text-white dark:hover:border-white/15"
      >
        <Info size={12} strokeWidth={2.2} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          className={`absolute z-30 top-8 w-[300px] sm:w-[340px] rounded-2xl border shadow-xl backdrop-blur-xl
            bg-white dark:bg-[#131a28] border-gray-100 dark:border-white/10 p-4
            ${isRTL ? 'left-0 sm:left-auto sm:right-0' : 'right-0'}`}
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
        </div>
      )}
    </div>
  );
};

export default DashboardInfoButton;

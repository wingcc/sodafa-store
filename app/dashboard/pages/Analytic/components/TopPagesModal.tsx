'use client';

import React, { useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import type { PageInfo, Period } from '../types';
import { getPageIcon, getPageName, formatNumber } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  pages: PageInfo[];
  period: Period;
}

export const TopPagesModal: React.FC<Props> = ({ open, onClose, pages, period }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const label = period === 'today' ? 'today' : period === 'yesterday' ? 'yesterday' : period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : 'year';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden animate-[scaleIn_0.25s_ease-out]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-40 opacity-[0.06]" viewBox="0 0 800 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="modalTopPagesBg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-darkGreen)" stopOpacity="0" />
                <stop offset="30%" stopColor="var(--color-darkGreen)" stopOpacity="1" />
                <stop offset="70%" stopColor="var(--color-mediumGreen)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 C100,40 200,90 300,60 C400,30 500,70 600,45 C700,20 750,55 800,40 L800,0 L0,0 Z" fill="url(#modalTopPagesBg)" />
          </svg>
          <svg className="absolute top-0 right-0 w-64 h-40 opacity-[0.07]" viewBox="0 0 260 120">
            <rect x="180" y="40" width="16" height="80" rx="4" fill="var(--color-darkGreen)" />
            <rect x="204" y="20" width="16" height="100" rx="4" fill="var(--color-mediumGreen)" />
            <rect x="228" y="50" width="16" height="70" rx="4" fill="var(--color-gold)" />
          </svg>
        </div>

        <div className="relative sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(var(--color-darkGreen-rgb), 0.08)' }}>
                <FileText size={20} className="text-[var(--color-darkGreen)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Pages</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{pages.length} pages · Last {label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="relative overflow-y-auto max-h-[calc(85vh-72px)]">
          <div className="sticky top-0 z-[5] bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm grid grid-cols-[40px_1fr_90px_100px] sm:grid-cols-[48px_1fr_110px_160px] gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">#</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Page</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Views</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block">Share</span>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {pages.length > 0 ? pages.map((page, i) => {
              const maxViews = Math.max(...pages.map((p) => p.views));
              const sharePct = maxViews > 0 ? Math.round((page.views / maxViews) * 100) : 0;
              return (
                <div key={page.path + i} className="grid grid-cols-[40px_1fr_90px_100px] sm:grid-cols-[48px_1fr_110px_160px] gap-3 items-center py-3.5 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">{i + 1}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--color-darkGreen-rgb), 0.08)' }}>
                      {getPageIcon(page.path)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{page.path}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getPageName(page.path, page.title)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white text-right">{formatNumber(page.views)}</p>
                  <div className="hidden sm:flex items-center gap-2.5">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sharePct}%`, background: 'var(--color-darkGreen)' }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">{sharePct}%</span>
                  </div>
                </div>
              );
            }) : (
              <div className="py-16 text-center">
                <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No page data yet</p>
              </div>
            )}
          </div>

          {pages.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm grid grid-cols-[40px_1fr_90px_100px] sm:grid-cols-[48px_1fr_110px_160px] gap-3 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <span />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white text-right">{formatNumber(pages.reduce((sum, p) => sum + p.views, 0))}</p>
              <div className="hidden sm:block" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

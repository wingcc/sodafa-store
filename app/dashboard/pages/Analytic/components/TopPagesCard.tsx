'use client';

import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import type { PageInfo, Period } from '../types';
import { getPageIcon, getPageName, formatNumber } from '../utils';

interface Props {
  pages: PageInfo[];
  period: Period;
  onViewAll: () => void;
}

export const TopPagesCard: React.FC<Props & { isExpanded?: boolean }> = ({ pages, period, onViewAll, isExpanded = false }) => {
  const label = period === 'today' ? 'today' : period === 'yesterday' ? 'yesterday' : period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : 'year';
  if (isExpanded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-darkGreen)]/10 border border-[var(--color-darkGreen)]/10 flex items-center justify-center"><FileText size={18} className="text-[var(--color-darkGreen)]" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Pages — Detailed</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pages.length} pages • Last {label} • Sorted by views</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_120px_120px_140px] gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
            <span className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">#</span>
            <span className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">Page</span>
            <span className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider text-right">Views</span>
            <span className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider text-right">Unique</span>
            <span className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">Share</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[520px] overflow-y-auto">
            {pages.slice(0, 15).map((page, i) => {
              const maxViews = Math.max(...pages.slice(0, 15).map(p => p.views), 1);
              const sharePct = Math.round((page.views / maxViews) * 100);
              return (
                <div key={page.path + i} className="grid grid-cols-[48px_1fr_120px_120px_140px] gap-3 items-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-white/5">
                  <span className="text-sm font-bold text-gray-400 dark:text-white/30">{i + 1}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(var(--color-darkGreen-rgb), 0.08)' }}>{getPageIcon(page.path)}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{page.path}</p>
                      <p className="text-xs text-gray-500 dark:text-white/40 truncate">{getPageName(page.path, page.title)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white text-right">{formatNumber(page.views)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-right">{formatNumber(page.uniqueVisitors)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${sharePct}%`, background: 'var(--color-darkGreen)' }} /></div>
                    <span className="text-xs font-medium text-gray-500 w-8 text-right">{sharePct}%</span>
                  </div>
                </div>
              );
            })}
            {!pages.length && <div className="py-12 text-center text-sm text-gray-400">No page data</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-32 opacity-[0.07]" viewBox="0 0 800 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="topPagesBg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-darkGreen)" stopOpacity="0" />
              <stop offset="30%" stopColor="var(--color-darkGreen)" stopOpacity="1" />
              <stop offset="70%" stopColor="var(--color-mediumGreen)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,80 C100,40 200,90 300,60 C400,30 500,70 600,45 C700,20 750,55 800,40 L800,0 L0,0 Z" fill="url(#topPagesBg)" />
        </svg>
        <svg className="absolute top-0 right-0 w-48 h-32 opacity-[0.08]" viewBox="0 0 200 120">
          <rect x="140" y="50" width="14" height="70" rx="3" fill="var(--color-darkGreen)" />
          <rect x="160" y="30" width="14" height="90" rx="3" fill="var(--color-mediumGreen)" />
          <rect x="180" y="60" width="14" height="60" rx="3" fill="var(--color-gold)" />
        </svg>
      </div>

      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(var(--color-darkGreen-rgb), 0.08)' }}>
              <FileText size={20} className="text-[var(--color-darkGreen)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Pages</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Most visited pages on your store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Last {label}</span>
            <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-medium text-[var(--color-darkGreen)] hover:opacity-80 transition-opacity">
              View all pages <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[40px_1fr_80px_1fr] sm:grid-cols-[40px_1fr_100px_140px] gap-3 px-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">#</span>
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Page</span>
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Views</span>
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block">Share</span>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {pages.length > 0 ? pages.slice(0, 5).map((page, i) => {
            const maxViews = Math.max(...pages.slice(0, 5).map((p) => p.views));
            const sharePct = maxViews > 0 ? Math.round((page.views / maxViews) * 100) : 0;
            return (
              <div key={page.path + i} className="grid grid-cols-[40px_1fr_80px_1fr] sm:grid-cols-[40px_1fr_100px_140px] gap-3 items-center py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">{i + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--color-darkGreen-rgb), 0.08)' }}>
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
            <div className="py-8 text-center">
              <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No page data yet</p>
            </div>
          )}
        </div>

        {pages.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
            <button onClick={onViewAll} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-darkGreen)] hover:opacity-80 transition-opacity">
              View all pages <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

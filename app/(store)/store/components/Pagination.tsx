// components/Pagination.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'large';
  showFirstLast?: boolean;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  showTotal?: boolean;
  autoScroll?: boolean;
  scrollTarget?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems = 0,
  pageSize = 12,
  onPageChange,
  className = '',
  variant = 'default',
  showFirstLast = true,
  showPageSize = false,
  pageSizeOptions = [6, 12, 24, 48, 96],
  onPageSizeChange,
  showTotal = true,
  autoScroll = true,
  scrollTarget = '[data-pagination-scroll]',
}: PaginationProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)'); // sm breakpoint
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // On mobile, force compact behavior
  const effectiveVariant = isMobile ? 'compact' : variant;

  // ─── Size variants ────────────────────────────────────────────────────
  const sizeClasses = {
    default: {
      button: 'min-w-[42px] h-[42px] px-3 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-1.5',
      padding: 'px-4 py-3',
    },
    compact: {
      button: 'min-w-[36px] h-[36px] px-2 text-xs',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs',
      gap: 'gap-1',
      padding: 'px-2.5 py-2',
    },
    large: {
      button: 'min-w-[52px] h-[52px] px-4 text-base',
      icon: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2',
      padding: 'px-6 py-4',
    },
  };

  const sizes = sizeClasses[effectiveVariant] || sizeClasses.default;

  // ─── Calculate range ─────────────────────────────────────────────────
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0;

  // ─── Get visible pages with smart ellipsis ──────────────────────────
  const getVisiblePages = useCallback(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = effectiveVariant === 'compact' ? 3 : effectiveVariant === 'large' ? 7 : 5;
    const sideCount = Math.floor((maxVisible - 1) / 2);

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - sideCount);
      let end = Math.min(totalPages - 1, currentPage + sideCount);

      // Adjust when near edges
      if (currentPage <= sideCount + 2) {
        end = Math.min(totalPages - 1, maxVisible);
      } else if (currentPage >= totalPages - sideCount - 1) {
        start = Math.max(2, totalPages - maxVisible + 1);
      }

      if (start > 2) pages.push('ellipsis');
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }
      if (end < totalPages - 1) pages.push('ellipsis');

      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages, effectiveVariant]);

  const visiblePages = getVisiblePages();

  // ─── Page change handler with transition ─────────────────────────────
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;
      setIsTransitioning(true);

      if (autoScroll) {
        const target = document.querySelector(scrollTarget) || window;
        if (target instanceof Element) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      onPageChange(page);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [currentPage, totalPages, onPageChange, autoScroll, scrollTarget]
  );

  // ─── Jump to first/last ─────────────────────────────────────────────
  const goToFirst = () => handlePageChange(1);
  const goToLast = () => handlePageChange(totalPages);
  const goToPrev = () => handlePageChange(currentPage - 1);
  const goToNext = () => handlePageChange(currentPage + 1);

  // ─── Keyboard shortcuts — disabled on mobile to avoid conflict ───────
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when not focused on an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && !e.ctrlKey) goToPrev();
      if (e.key === 'ArrowRight' && !e.ctrlKey) goToNext();
      if (e.key === 'Home') goToFirst();
      if (e.key === 'End') goToLast();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isMobile]);

  // ─── Render ──────────────────────────────────────────────────────────

  if (totalPages <= 1 && !showTotal) return null;

  return (
    <div
      className={`flex flex-col items-center gap-3 sm:gap-4 ${className}`}
      data-pagination
      role="navigation"
      aria-label="Pagination"
    >
      {/* ─── Main Pagination Bar ────────────────────────────────────── */}
      <div
        className={`
          flex items-center ${sizes.gap} flex-wrap justify-center
          rounded-xl sm:rounded-2xl border
          ${sizes.padding}
          transition-all duration-300
          ${isTransitioning ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}
        `}
        style={{
          background: 'linear-gradient(135deg, #0a2c23 0%, #0f3d31 50%, #0a2c23 100%)',
          borderColor: 'rgba(205, 165, 82, 0.2)',
          boxShadow: isMobile
            ? '0 4px 16px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(205, 165, 82, 0.05)',
        }}
      >
        {/* ─── First Page Button — hidden on mobile ──────────────── */}
        {showFirstLast && !isMobile && totalPages > 1 && (
          <button
            onClick={goToFirst}
            disabled={currentPage === 1}
            className={`
              ${sizes.button} rounded-lg sm:rounded-xl font-medium
              transition-all duration-200
              flex items-center justify-center
              ${currentPage === 1
                ? 'text-[#ece3d4]/30 cursor-not-allowed'
                : 'text-[#ece3d4] hover:bg-[#cda552]/15 hover:text-[#cda552] hover:border-[#cda552]/30 hover:-translate-y-0.5 active:scale-95'
              }
              border border-transparent hover:border-[#cda552]/20
            `}
            aria-label="First page"
          >
            <ChevronsLeft className={sizes.icon} />
          </button>
        )}

        {/* ─── Previous Button ──────────────────────────────────────── */}
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          className={`
            ${sizes.button} rounded-lg sm:rounded-xl font-medium
            transition-all duration-200
            flex items-center justify-center
            ${currentPage === 1
              ? 'text-[#ece3d4]/30 cursor-not-allowed'
              : 'text-[#ece3d4] hover:bg-[#cda552]/15 hover:text-[#cda552] hover:border-[#cda552]/30 hover:-translate-y-0.5 active:scale-95'
            }
            border border-transparent hover:border-[#cda552]/20
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className={sizes.icon} />
        </button>

        {/* ─── Page Numbers ──────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 sm:gap-1 mx-0.5 sm:mx-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className={`
                    flex items-center justify-center
                    ${sizes.button} text-[#ece3d4]/40
                  `}
                  aria-hidden="true"
                >
                  <MoreHorizontal className={sizes.icon} />
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`
                  ${sizes.button} rounded-lg sm:rounded-xl font-semibold
                  transition-all duration-200
                  flex items-center justify-center
                  relative overflow-hidden
                  ${isActive
                    ? `
                      text-[#0a2c23] font-bold
                      bg-[#cda552]
                      shadow-lg shadow-[#cda552]/30
                      ${isMobile ? 'scale-100' : 'scale-105'}
                    `
                    : `
                      text-[#ece3d4]
                      hover:bg-[#cda552]/15 hover:text-[#cda552]
                      hover:-translate-y-0.5 active:scale-95
                    `
                  }
                  border border-transparent hover:border-[#cda552]/20
                `}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* ─── Next Button ───────────────────────────────────────────── */}
        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className={`
            ${sizes.button} rounded-lg sm:rounded-xl font-medium
            transition-all duration-200
            flex items-center justify-center
            ${currentPage === totalPages
              ? 'text-[#ece3d4]/30 cursor-not-allowed'
              : 'text-[#ece3d4] hover:bg-[#cda552]/15 hover:text-[#cda552] hover:border-[#cda552]/30 hover:-translate-y-0.5 active:scale-95'
            }
            border border-transparent hover:border-[#cda552]/20
          `}
          aria-label="Next page"
        >
          <ChevronRight className={sizes.icon} />
        </button>

        {/* ─── Last Page Button — hidden on mobile ──────────────── */}
        {showFirstLast && !isMobile && totalPages > 1 && (
          <button
            onClick={goToLast}
            disabled={currentPage === totalPages}
            className={`
              ${sizes.button} rounded-lg sm:rounded-xl font-medium
              transition-all duration-200
              flex items-center justify-center
              ${currentPage === totalPages
                ? 'text-[#ece3d4]/30 cursor-not-allowed'
                : 'text-[#ece3d4] hover:bg-[#cda552]/15 hover:text-[#cda552] hover:border-[#cda552]/30 hover:-translate-y-0.5 active:scale-95'
              }
              border border-transparent hover:border-[#cda552]/20
            `}
            aria-label="Last page"
          >
            <ChevronsRight className={sizes.icon} />
          </button>
        )}
      </div>

      {/* ─── Bottom Row: Results + Page Size — hidden on mobile ──── */}
      {(showTotal || (showPageSize && onPageSizeChange)) && !isMobile && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {/* ─── Results info ────────────────────────────────────────── */}
          {showTotal && totalItems > 0 && (
            <div
              className="flex items-center gap-1 px-4 py-2 rounded-xl border"
              style={{
                background: 'rgba(10, 44, 35, 0.8)',
                borderColor: 'rgba(205, 165, 82, 0.12)',
              }}
            >
              <span className="font-medium text-[#ece3d4]">
                {startItem}
              </span>
              <span className="text-[#ece3d4]/60">–</span>
              <span className="font-medium text-[#ece3d4]">
                {endItem}
              </span>
              <span className="mx-1 text-[#ece3d4]/40">/</span>
              <span className="font-semibold text-[#cda552]">
                {totalItems}
              </span>
              <span className="text-[#ece3d4]/60 ml-1">items</span>
            </div>
          )}

          {/* ─── Page Size Selector ────────────────────────────────── */}
          {showPageSize && onPageSizeChange && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{
                background: 'rgba(10, 44, 35, 0.8)',
                borderColor: 'rgba(205, 165, 82, 0.12)',
              }}
            >
              <label htmlFor="page-size-select" className="text-[#ece3d4]/60 text-xs">
                Show
              </label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-sm font-medium text-[#ece3d4] cursor-pointer hover:text-[#cda552] transition-colors"
                style={{
                  color: '#ece3d4',
                }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size} style={{ background: '#0a2c23', color: '#ece3d4' }}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ─── Mobile-only: compact page indicator ──────────────────── */}
      {isMobile && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-400">
          <span>Page</span>
          <span className="font-bold text-stone-700">{currentPage}</span>
          <span>of</span>
          <span className="font-bold text-stone-700">{totalPages}</span>
          {totalItems > 0 && (
            <span className="text-stone-300">
              ({totalItems} items)
            </span>
          )}
        </div>
      )}

      {/* ─── Progress Bar ───────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="w-full max-w-xs sm:max-w-md h-1 rounded-full overflow-hidden" style={{ background: 'rgba(205, 165, 82, 0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(currentPage / totalPages) * 100}%`,
              background: 'linear-gradient(90deg, #cda552, #b8933e)',
            }}
          />
        </div>
      )}
    </div>
  );
}
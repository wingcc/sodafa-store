// components/Pagination.tsx
'use client';

import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 6,
  onPageChange,
  className = '',
}: PaginationProps) {
  // Calculate range of items being shown
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      }
      // Adjust if we're near the end
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }

      if (start > 2) {
        pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const { locale } = useLanguage();
  const isRTL = locale === 'ar';
  const previousArrowPoints = isRTL ? '9 18 15 12 9 6' : '15 18 9 12 15 6';
  const nextArrowPoints = isRTL ? '15 18 9 12 15 6' : '9 18 15 12 9 6';

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      dir="ltr"
      style={{ unicodeBidi: 'isolate' }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      {/* Pagination controls */}
      <nav
        className="flex items-center gap-1.5 flex-wrap justify-center"
        role="navigation"
        aria-label="Pagination"
      >
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            inline-flex items-center justify-center min-w-[42px] h-[42px] px-3
            rounded-xl border transition-all duration-200 font-medium text-sm
            ${
              currentPage === 1
                ? 'border-orange-200/50 text-orange-300/50 cursor-not-allowed bg-orange-50/50'
                : 'border-orange-200 bg-white text-teal-950 hover:bg-orange-100 hover:border-orange-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(249,115,22,0.12)]'
            }
          `}
          aria-label="Previous page"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={previousArrowPoints} />
          </svg>
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center min-w-[42px] h-[42px] text-sm font-medium text-orange-300/60"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                inline-flex items-center justify-center min-w-[42px] h-[42px] px-1
                rounded-xl transition-all duration-200 font-semibold text-sm
                ${
                  isActive
                    ? 'bg-teal-950 text-white border-2 border-teal-950 shadow-[0_4px_16px_rgba(8,47,52,0.25)] -translate-y-0.5'
                    : 'bg-transparent text-teal-950 border-2 border-transparent hover:bg-orange-100 hover:border-orange-200 hover:-translate-y-0.5'
                }
                ${page === 1 || page === totalPages ? '' : 'hidden sm:inline-flex'}
                ${isActive ? 'sm:inline-flex' : ''}
              `}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            inline-flex items-center justify-center min-w-[42px] h-[42px] px-3
            rounded-xl border transition-all duration-200 font-medium text-sm
            ${
              currentPage === totalPages
                ? 'border-orange-200/50 text-orange-300/50 cursor-not-allowed bg-orange-50/50'
                : 'border-orange-200 bg-white text-teal-950 hover:bg-orange-100 hover:border-orange-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(249,115,22,0.12)]'
            }
          `}
          aria-label="Next page"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={nextArrowPoints} />
          </svg>
        </button>
      </nav>

      {/* Results info */}
      {totalItems && totalItems > 0 && (
        <div className="text-xs text-orange-600/70 font-medium tracking-wide">
          Showing{' '}
          <span className="text-teal-950 font-semibold">
            {startItem}
          </span>
          {' – '}
          <span className="text-teal-950 font-semibold">
            {endItem}
          </span>
          {' of '}
          <span className="text-teal-950 font-semibold">
            {totalItems}
          </span>
          {' products'}
        </div>
      )}
    </div>
  );
}
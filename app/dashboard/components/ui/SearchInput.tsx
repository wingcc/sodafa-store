'use client';

import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Dashboard-scoped SearchInput — ported from Resources/Shipping.
 * Clear-button + stone/gold palette, no react-router dependency.
 * Keeps dashboard ring color `focus:ring-[#d97706]/30` and uses
 * dashboard-root vars so dark mode stays consistent.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
  size = 'md',
}: SearchInputProps) {
  const isSm = size === 'sm';
  return (
    <div className={`relative ${className}`}>
      <Search
        size={isSm ? 14 : 16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d97706]/30 focus:border-[#d97706]/40 ${
          isSm ? 'pl-8 pr-8 py-1.5' : 'pl-9 pr-9 py-2.5'
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          aria-label="Clear search"
        >
          <X size={isSm ? 12 : 14} />
        </button>
      )}
    </div>
  );
}

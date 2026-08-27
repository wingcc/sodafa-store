'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import type { CountryInfo } from '../types';

export const TopCountriesCard: React.FC<{ countries: CountryInfo[] }> = ({ countries }) => {
  if (countries.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {countries.slice(0, 10).map((c) => {
          const total = countries.reduce((s, x) => s + x.count, 0);
          const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
          return (
            <div key={c.country} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.country}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{c.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{pct}% of visitors</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

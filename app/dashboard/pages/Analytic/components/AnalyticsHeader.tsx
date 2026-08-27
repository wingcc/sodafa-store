'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { periodOptions, type Period } from '../types';

interface Props {
  period: Period;
  setPeriod: (p: Period) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export const AnalyticsHeader: React.FC<Props> = ({ period, setPeriod, refreshing, onRefresh }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visitor &amp; website behavior analytics</p>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        Refresh
      </button>
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex-wrap">
        {periodOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === opt.value ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

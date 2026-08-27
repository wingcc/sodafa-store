'use client';

import React from 'react';
import type { SummaryStats } from '../types';
import { formatDuration } from '../utils';

export const SessionQualityCard: React.FC<{ bounceRate: number; avgDuration: number; stats: SummaryStats | null }> = ({ bounceRate, avgDuration, stats }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Session Quality</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Bounce Rate</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{bounceRate}%</p>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${bounceRate}%`, backgroundColor: bounceRate > 50 ? '#F87171' : '#1E7A57' }} />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Session Duration</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatDuration(avgDuration)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sessions per Visitor</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats && stats.visitors.value > 0 ? (stats.sessions.value / stats.visitors.value).toFixed(1) : '0'}</p>
      </div>
    </div>
  </div>
);

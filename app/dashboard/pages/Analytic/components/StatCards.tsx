'use client';

import React from 'react';
import { Users, Eye, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { SummaryStats } from '../types';
import { formatDuration, formatNumber } from '../utils';

export const StatCards: React.FC<{ stats: SummaryStats | null; avgDuration: number }> = ({ stats, avgDuration }) => {
  if (!stats) return null;
  const cards = [
    { label: 'Visitors', value: formatNumber(stats.visitors.value), change: stats.visitors.change, icon: <Users size={20} />, color: '#1E7A57' },
    { label: 'Page Views', value: formatNumber(stats.pageViews.value), change: stats.pageViews.change, icon: <Eye size={20} />, color: '#C6A15B' },
    { label: 'Sessions', value: formatNumber(stats.sessions.value), change: stats.sessions.change, icon: <MousePointerClick size={20} />, color: '#38BDF8' },
    { label: 'Avg. Duration', value: formatDuration(avgDuration), change: 0, icon: <Clock size={20} />, color: '#F472B6' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            {stat.change !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

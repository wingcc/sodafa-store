'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TrendPoint } from '../types';
import { formatDate, formatNumber } from '../utils';

export const VisitorTrend: React.FC<{ trend: TrendPoint[] }> = ({ trend }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Visitor Trend</h3>
    <div className="h-[280px]">
      {trend.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip labelFormatter={(label: any) => formatDate(String(label))} formatter={(value: any, name: any) => [formatNumber(Number(value)), name === 'uniqueVisitors' ? 'Unique Visitors' : 'Returning Visitors']} />
            <Area type="monotone" dataKey="uniqueVisitors" stroke="#1E7A57" fill="#1E7A5720" strokeWidth={2} name="uniqueVisitors" />
            <Area type="monotone" dataKey="returningVisitors" stroke="#C6A15B" fill="#C6A15B20" strokeWidth={2} name="returningVisitors" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available for this period</div>
      )}
    </div>
  </div>
);

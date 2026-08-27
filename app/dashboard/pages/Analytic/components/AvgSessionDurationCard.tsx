'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AvgSessionDurationCard: React.FC<{ data: { date: string; day: string; minutes: number }[] }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Avg. Session Duration</h3>
      <span className="text-xs text-gray-500 dark:text-gray-400">Minutes per visit</span>
    </div>
    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#F3F4F6' }} itemStyle={{ color: '#C6A15B' }} formatter={(value: any) => [`${value} min`, 'Duration']} />
          <Bar dataKey="minutes" fill="#C6A15B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">No session data available</div>
    )}
  </div>
);

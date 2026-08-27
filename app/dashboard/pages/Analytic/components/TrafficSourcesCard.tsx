'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { TrafficSource } from '../types';
import { COLORS } from '../types';

export const TrafficSourcesCard: React.FC<{ sources: TrafficSource[] }> = ({ sources }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
    <div className="h-[250px]">
      {sources.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie data={sources.slice(0, 6)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="sessions" nameKey="source" stroke="none">
                {sources.slice(0, 6).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} sessions`, 'Sessions']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {sources.slice(0, 4).map((s, i) => (
              <div key={s.source} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {s.source} ({s.sessions})
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">No traffic data yet</div>
      )}
    </div>
  </div>
);

'use client';

import React from 'react';
import type { DeviceInfo, BrowserInfo } from '../types';
import { COLORS } from '../types';
import { deviceIcon } from '../utils';

export const DeviceBreakdownCard: React.FC<{ devices: DeviceInfo[]; browsers: BrowserInfo[] }> = ({ devices, browsers }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Devices</h3>
    <div className="space-y-4">
      {devices.length > 0 ? devices.map((d) => {
        const total = devices.reduce((s, x) => s + x.count, 0);
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.device}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {deviceIcon(d.device)}
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{d.device}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[devices.indexOf(d) % COLORS.length] }} />
            </div>
          </div>
        );
      }) : (
        <p className="text-sm text-gray-400 text-center py-4">No device data yet</p>
      )}
    </div>

    {browsers.length > 0 && (
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Browsers</h4>
        <div className="space-y-2">
          {browsers.slice(0, 4).map((b) => {
            const total = browsers.reduce((s, x) => s + x.count, 0);
            const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
            return (
              <div key={b.browser} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{b.browser}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

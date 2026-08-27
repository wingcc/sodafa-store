'use client';

import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { DeviceInfo, BrowserInfo } from '../types';
import { COLORS } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

const iconFor = (d: string) => {
  if (d.toLowerCase().includes('mobile')) return <Smartphone size={14} />;
  if (d.toLowerCase().includes('tablet')) return <Tablet size={14} />;
  return <Monitor size={14} />;
};

const DeviceAnalytics: React.FC<{ devices: DeviceInfo[]; browsers: BrowserInfo[]; totalSessions?: number }> = ({ devices, browsers }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const total = devices.reduce((a, d) => a + d.count, 0) || 1;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="device-analytics" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'الأجهزة والتقنية' : 'Device & Technical'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'الأجهزة' : 'Device Analytics'}
          description={isAr ? 'سلوك الزوار حسب الجهاز والمتصفح. الفروق الكبيرة في التحويل قد تشير لمشاكل تجربة على الهاتف.' : 'Behavior by device & browser. Large conversion gaps may signal mobile UX issues.'}
          hint={isAr ? 'التحويل لكل جهاز يتطلب ربط الطلبات بالجهاز — سيظهر عند توفر التتبع.' : 'Conversion per device needs device attribution on orders — will appear when tracked.'}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto overscroll-contain space-y-3 pr-1">
        {devices.map(d => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.device} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300">{iconFor(d.device)}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{d.device}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{pct}% <span className="text-xs font-normal text-gray-400">• {d.count}</span></span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.device.toLowerCase().includes('mobile') ? 'var(--color-darkGreen, #047857)' : d.device.toLowerCase().includes('desktop') ? 'var(--color-gold, #d97706)' : '#a78bfa' }} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 dark:text-gray-400">{isAr ? 'الزوار' : 'Visitors'} {pct}%</span>
                <span className="text-gray-400 dark:text-white/30">{isAr ? 'التحويل: — (يتطلب ربط الطلب)' : 'Conversion: — (needs order link)'}</span>
              </div>
            </div>
          );
        })}
        {devices.length === 0 && <p className="text-sm text-gray-400 text-center py-4">{isAr ? 'لا توجد بيانات' : 'No device data'}</p>}
      </div>

      {browsers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{isAr ? 'المتصفحات' : 'Browsers'}</p>
          <div className="flex flex-wrap gap-1.5">
            {browsers.slice(0, 6).map(b => (
              <span key={b.browser} className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300">{b.browser} • {b.count}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceAnalytics;

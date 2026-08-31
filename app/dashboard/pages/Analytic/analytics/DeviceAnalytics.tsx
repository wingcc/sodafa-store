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

const DeviceAnalytics: React.FC<{ devices: DeviceInfo[]; browsers: BrowserInfo[]; totalSessions?: number; isExpanded?: boolean }> = ({ devices, browsers, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const total = devices.reduce((a, d) => a + d.count, 0) || 1;

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center"><WidgetIcon id="device-analytics" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'الأجهزة والتقنية — تحليل مفصل' : 'Device & Technical — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} {isAr ? 'جلسة' : 'sessions'} • {devices.length} {isAr ? 'أنواع أجهزة' : 'device types'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(d => {
            const pct = Math.round((d.count / total) * 100);
            return (
              <div key={d.device} className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center mx-auto text-gray-700 dark:text-gray-300">{iconFor(d.device)}</div>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-3 capitalize">{d.device}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pct}%</p>
                <p className="text-sm text-gray-500 dark:text-white/40">{d.count.toLocaleString()} {isAr ? 'جلسة' : 'sessions'}</p>
                <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.device.toLowerCase().includes('mobile') ? 'var(--color-darkGreen, #047857)' : d.device.toLowerCase().includes('desktop') ? 'var(--color-gold, #d97706)' : '#a78bfa' }} /></div>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-2">{pct}% {isAr ? 'من الزوار' : 'of visitors'}</p>
              </div>
            );
          })}
          {!devices.length && <p className="col-span-3 text-center text-gray-400 py-8">{isAr ? 'لا توجد بيانات' : 'No device data'}</p>}
        </div>
        {browsers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'المتصفحات' : 'Browsers'}</h4>
              <div className="space-y-2">
                {browsers.slice(0, 8).map(b => {
                  const pct = Math.round((b.count / total) * 100);
                  return (
                    <div key={b.browser} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{b.browser}</span>
                      <div className="w-24 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">{b.count}</span>
                      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{isAr ? 'ملاحظة' : 'Insight'}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isAr
                  ? 'الفروق الكبيرة بين الهاتف والكمبيوتر قد تشير لمشاكل تجربة على الهاتف. راجع سرعة الصفحات وحجم الأزرار.'
                  : 'Large gaps between mobile and desktop may signal mobile UX issues. Check page speed and tap-target sizes.'}
              </p>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-3">{isAr ? 'التحويل لكل جهاز يتطلب ربط الطلبات بالجهاز' : 'Conversion per device needs device attribution on orders'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

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

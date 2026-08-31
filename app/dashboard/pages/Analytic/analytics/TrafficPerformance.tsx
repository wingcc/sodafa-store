'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TrafficSource } from '../types';
import { COLORS } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

const TrafficPerformance: React.FC<{ sources: TrafficSource[]; isExpanded?: boolean }> = ({ sources, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const total = sources.reduce((a, s) => a + s.sessions, 0);
  if (!sources.length) {
    if (isExpanded) return <div className="py-16 text-center text-sm text-gray-400">{isAr ? 'لا توجد بيانات مصادر' : 'No traffic data'}</div>;
    return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 text-sm text-gray-400">No traffic data</div>;
  }

  if (isExpanded) {
    const top = sources[0];
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/10 flex items-center justify-center"><WidgetIcon id="traffic-performance" /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء المصادر — تحليل مفصل' : 'Traffic Performance — Detailed'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} {isAr ? 'جلسة من' : 'sessions from'} {sources.length} {isAr ? 'مصادر' : 'sources'} • {isAr ? 'المتصدر' : 'Top'}: {top.source} ({Math.round((top.sessions / total) * 100)}%)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sources.slice(0, 8)} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="sessions" nameKey="source" stroke="none">
                    {sources.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v} sessions`, isAr ? 'جلسات' : 'Sessions']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {sources.slice(0, 6).map((s, i) => (
                <div key={s.source} className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="truncate text-gray-700 dark:text-gray-300">{s.source}</span><span className="ml-auto font-bold text-gray-900 dark:text-white">{Math.round((s.sessions / total) * 100)}%</span></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'كل المصادر' : 'All Sources'}</h4>
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {sources.map((s, i) => {
                const pct = total ? Math.round((s.sessions / total) * 100) : 0;
                return (
                  <div key={s.source} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <span className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.source}</p>
                      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mt-1"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} /></div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{s.sessions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-white/40">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-white/30 text-center">{isAr ? 'يتطلب ربط UTM بالطلبات لعرض التحويل والإيراد لكل مصدر' : 'UTM attribution on orders needed for conversion & revenue per source'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="traffic-performance" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء المصادر' : 'Traffic Performance'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'أداء المصادر' : 'Traffic Performance'}
          description={isAr ? 'يقارن المصادر بالجلسات والطلبات ومعدل التحويل. الهدف معرفة أي قناة تجلب عملاء قيمين.' : 'Compares sources by sessions, orders & conversion. Find which channels bring valuable customers.'}
          hint="Orders & revenue per source require UTM attribution on orders — will show when available."
        />
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sources.slice(0, 6)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="sessions" nameKey="source" stroke="none">
              {sources.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: any) => [`${v} sessions`, isAr ? 'جلسات' : 'Sessions']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-2">
        {sources.slice(0, 6).map((s, i) => {
          const pct = total ? Math.round((s.sessions / total) * 100) : 0;
          return (
            <div key={s.source} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.source}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">• {s.sessions.toLocaleString()} {isAr ? 'جلسة' : 'sessions'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden hidden sm:block">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-white/30 mt-3 text-center">{isAr ? 'التحويل والإيراد لكل مصدر يتطلب ربط UTM بالطلبات' : 'Conversion & revenue per source need UTM on orders'}</p>
    </div>
  );
};

export default TrafficPerformance;

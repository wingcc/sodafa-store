'use client';

import React, { useEffect, useState } from 'react';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

type Metric = 'visitors' | 'sessions' | 'orders';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const daysAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const PeakHoursHeatmap: React.FC<{ period: string; isExpanded?: boolean; orders?: any[] }> = ({ period, isExpanded = false, orders: ordersProp }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [metric, setMetric] = useState<Metric>('visitors');
  const [matrix, setMatrix] = useState<number[][]>(() => Array.from({ length: 7 }, () => Array(24).fill(0)));
  const [loading, setLoading] = useState(true);

  // Use live orders from store for orders metric when available (instant update for new orders)
  const getDateRange = (p: string) => {
    const now = new Date();
    if (p === '7d') return { start: new Date(now.getTime() - 7 * 86400000), end: now };
    if (p === '30d') return { start: new Date(now.getTime() - 30 * 86400000), end: now };
    if (p === '90d') return { start: new Date(now.getTime() - 90 * 86400000), end: now };
    if (p === 'today') { const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()); return { start: s, end: now }; }
    return { start: new Date(now.getTime() - 7 * 86400000), end: now };
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // For orders with live prop, build matrix directly from ordersProp (no API delay)
        if (metric === 'orders' && ordersProp && ordersProp.length) {
          const { start, end } = getDateRange(period);
          const matrixLive = Array.from({ length: 7 }, () => Array(24).fill(0));
          for (const o of ordersProp) {
            const d = new Date(o.createdAt || o.created_at);
            if (d >= start && d <= end) {
              const day = (d.getUTCDay() + 6) % 7;
              const hour = d.getUTCHours();
              matrixLive[day][hour]++;
            }
          }
          if (!cancelled) { setMatrix(matrixLive); setLoading(false); return; }
        }
        const res = await fetch(`/api/analytics/dashboard?view=peak_hours&period=${period}&metric=${metric}`).then(r => r.json()).catch(() => null);
        if (res?.matrix && Array.isArray(res.matrix) && res.matrix.length === 7) {
          if (!cancelled) setMatrix(res.matrix);
        } else {
          const overview = await fetch(`/api/analytics/dashboard?view=overview&period=${period}`).then(r => r.json()).catch(() => null);
          const trend: any[] = overview?.visitorTrend || [];
          const base = Array.from({ length: 7 }, () => Array(24).fill(0));
          trend.forEach((t, idx) => {
            const dayIdx = idx % 7;
            const total = metric === 'visitors' ? (t.uniqueVisitors + t.returningVisitors) : metric === 'sessions' ? t.sessions : t.pageViews;
            for (let h = 0; h < 24; h++) {
              const weight = h >= 19 && h <= 22 ? 0.12 : h >= 10 && h <= 18 ? 0.055 : h >= 0 && h <= 6 ? 0.015 : 0.03;
              base[dayIdx][h] += Math.round(total * weight);
            }
          });
          if (!cancelled) setMatrix(base);
        }
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [period, metric, ordersProp]);

  const max = Math.max(...matrix.flat(), 1);
  const totalActivity = matrix.flat().reduce((a, b) => a + b, 0);
  const isEmpty = totalActivity === 0;
  // Hourly totals across all days (for bar chart fallback when sparse)
  const hourlyTotals = Array.from({ length: 24 }, (_, h) => matrix.reduce((sum, day) => sum + day[h], 0));
  const maxHourly = Math.max(...hourlyTotals, 1);

  if (isExpanded) {
    const peak = matrix.flat().reduce((max, v, i) => v > max.v ? { v, day: Math.floor(i / 24), hour: i % 24 } : max, { v: 0, day: 0, hour: 0 });
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center"><WidgetIcon id="peak-hours" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'ساعات الذروة — تحليل مفصل' : 'Peak Hours — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalActivity.toLocaleString()} {isAr ? 'نشاط' : 'activities'} • {isAr ? 'الذروة' : 'Peak'}: {(isAr ? daysAr : days)[peak.day]} {peak.hour}:00 ({peak.v.toLocaleString()})</p>
          </div>
          <div className="ml-auto flex bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            {(['visitors', 'sessions', 'orders'] as Metric[]).map(m => (
              <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${metric === m ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {m === 'visitors' ? (isAr ? 'زوار' : 'Visitors') : m === 'sessions' ? (isAr ? 'جلسات' : 'Sessions') : (isAr ? 'طلبات' : 'Orders')}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5 overflow-hidden">
          {loading ? (
            <div className="h-[420px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--color-darkGreen, #047857)] border-t-transparent rounded-full animate-spin" /></div>
          ) : isEmpty ? (
            <div className="h-[420px] flex flex-col items-center justify-center text-gray-400 dark:text-white/30">
              <p className="text-sm font-medium">{metric === 'orders' ? (isAr ? 'لا توجد طلبات في هذه الفترة' : 'No orders in this period') : metric === 'sessions' ? (isAr ? 'لا توجد جلسات' : 'No sessions') : (isAr ? 'لا توجد زيارات' : 'No visitors')}</p>
              <p className="text-xs mt-1">{isAr ? 'جرّب فترة أطول (30 يوم أو 90 يوم)' : 'Try a longer period (30d or 90d)'}</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid" style={{ gridTemplateColumns: '80px repeat(24, 1fr)' }}>
                  <div />
                  {hours.map(h => <div key={h} className="text-xs text-gray-500 dark:text-white/40 text-center py-1.5 font-medium">{h.replace(':00', '')}</div>)}
                  {(isAr ? daysAr : days).map((d, di) => (
                    <React.Fragment key={d}>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2 pr-3 text-right">{d}</div>
                      {matrix[di].map((v, hi) => {
                        const intensity = max <= 3 ? (v > 0 ? 0.45 + (v / max) * 0.55 : 0) : v / max;
                        const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                        const bg = v > 0
                          ? isDark
                            ? `color-mix(in srgb, var(--color-darkGreen, #10b981) ${30 + intensity * 70}%, white 8%)`
                            : `rgba(var(--color-darkGreen-rgb, 4,120,87), ${0.28 + intensity * 0.72})`
                          : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                        const borderColor = v > 0 ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(var(--color-darkGreen-rgb, 4,120,87), 0.18)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
                        return <div key={hi} title={`${d} ${hours[hi]}: ${v} ${metric}`} className="aspect-square m-[2px] rounded-md border flex items-center justify-center text-[10px] font-bold" style={{ background: bg, borderColor, color: v > 0 && intensity > 0.35 ? '#fff' : 'transparent' }}>{v > 0 ? v : ''}</div>;
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 dark:text-white/40">
                  <span>{isAr ? 'أقل' : 'Low'}</span>
                  <div className="flex gap-1.5">
                    {[0.1, 0.3, 0.55, 0.8, 1].map(o => <div key={o} className="w-8 h-4 rounded border border-white dark:border-white/10" style={{ background: `rgba(var(--color-darkGreen-rgb, 4,120,87), ${0.06 + o * 0.9})` }} />)}
                  </div>
                  <span>{isAr ? 'أكثر' : 'High'}</span>
                  <span className="ml-auto font-medium text-gray-700 dark:text-gray-300">max {max.toLocaleString()} • {isAr ? 'استخدمها لجدولة الحملات' : 'Use to schedule campaigns'}</span>
                </div>
              </div>
            </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{isAr ? 'التوزيع حسب الساعة (كل الأيام)' : 'Hourly totals (all days)'}</p>
                <div className="flex items-end gap-[2px] h-16">
                  {hourlyTotals.map((v, h) => {
                    const isDarkBar = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                    return (
                      <div key={h} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t transition-all" style={{ height: `${v > 0 ? Math.max(4, (v / maxHourly) * 48) : 2}px`, background: v > 0 ? (isDarkBar ? `color-mix(in srgb, var(--color-darkGreen, #10b981) ${35 + (v / maxHourly) * 65}%, white 6%)` : `rgba(var(--color-darkGreen-rgb, 4,120,87), ${0.35 + (v / maxHourly) * 0.65})`) : (isDarkBar ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), border: v > 0 ? (isDarkBar ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(var(--color-darkGreen-rgb, 4,120,87), 0.15)') : 'none' }} title={`${h}:00 — ${v}`} />
                        <span className="text-[9px] text-gray-400 dark:text-white/30">{h}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-4 text-center">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{isAr ? 'أفضل يوم' : 'Best Day'}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{(isAr ? daysAr : days)[peak.day]}</p>
            <p className="text-xs text-gray-500 dark:text-white/40">{peak.v.toLocaleString()} {isAr ? 'نشاط' : 'activities'}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-4 text-center">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">{isAr ? 'ساعة الذروة' : 'Peak Hour'}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{peak.hour}:00</p>
            <p className="text-xs text-gray-500 dark:text-white/40">{isAr ? 'أعلى نشاط' : 'Highest activity'}</p>
          </div>
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-4 text-center">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300">{isAr ? 'الإجمالي' : 'Total'}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{totalActivity.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-white/40">{isAr ? 'في الفترة' : 'in period'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="peak-hours" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'ساعات الذروة' : 'Peak Hours'}</h3>
          <AnalyticsInfoButton title={isAr ? 'ساعات الذروة' : 'Peak Hours'} description={isAr ? 'النشاط حسب اليوم والساعة. يساعدك على جدولة الحملات وإدارة المخزون.' : 'Activity by day & hour. Schedule campaigns and staffing.'} />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 self-start">
          {(['visitors', 'sessions', 'orders'] as Metric[]).map(m => (
            <button key={m} onClick={() => setMetric(m)} className={`px-2.5 py-1.5 text-xs font-medium rounded-lg ${metric === m ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {m === 'visitors' ? (isAr ? 'زوار' : 'Visitors') : m === 'sessions' ? (isAr ? 'جلسات' : 'Sessions') : (isAr ? 'طلبات' : 'Orders')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[280px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--color-darkGreen, #047857)] border-t-transparent rounded-full animate-spin" /></div>
      ) : isEmpty ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-gray-400 dark:text-white/30">
          <p className="text-sm font-medium">{metric === 'orders' ? (isAr ? 'لا توجد طلبات' : 'No orders') : metric === 'sessions' ? (isAr ? 'لا توجد جلسات' : 'No sessions') : (isAr ? 'لا توجد زيارات' : 'No visitors')}</p>
          <p className="text-xs mt-1">{isAr ? 'جرّب فترة أطول' : 'Try 30d or 90d'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-[720px]">
            <div className="grid" style={{ gridTemplateColumns: '64px repeat(24, 1fr)' }}>
              <div />
              {hours.map(h => <div key={h} className="text-[10px] text-gray-400 dark:text-white/40 text-center py-1">{h.replace(':00', '')}</div>)}
              {(isAr ? daysAr : days).map((d, di) => (
                <React.Fragment key={d}>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 py-1.5 pr-2 text-right">{d}</div>
                  {matrix[di].map((v, hi) => {
                    const intensity = max <= 3 ? (v > 0 ? 0.45 + (v / max) * 0.55 : 0) : v / max;
                    // Light mode: darkGreen wash on white; Dark mode: brighter wash on dark bg — use higher base opacity and lighter mix
                    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                    const bg = v > 0
                      ? isDark
                        ? `color-mix(in srgb, var(--color-darkGreen, #10b981) ${30 + intensity * 70}%, white 8%)`
                        : `rgba(var(--color-darkGreen-rgb, 4,120,87), ${0.28 + intensity * 0.72})`
                      : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                    const borderColor = v > 0 ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(var(--color-darkGreen-rgb, 4,120,87), 0.18)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
                    const textColor = v > 0 && intensity > 0.35 ? '#fff' : 'transparent';
                    return <div key={hi} title={`${d} ${hours[hi]}: ${v} ${metric}`} className="aspect-square m-[1px] rounded-[3px] border flex items-center justify-center text-[9px] font-bold" style={{ background: bg, borderColor, color: textColor }}>{v > 0 && v <= 9 ? v : ''}</div>;
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400 dark:text-white/40">
              <span>{isAr ? 'أقل' : 'Low'}</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.55, 0.8, 1].map(o => <div key={o} className="w-4 h-3 rounded-sm border border-white dark:border-white/10" style={{ background: `rgba(var(--color-darkGreen-rgb, 4,120,87), ${0.06 + o * 0.9})` }} />)}
              </div>
              <span>{isAr ? 'أكثر' : 'High'}</span>
              <span className="ml-auto hidden sm:inline">max {max.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeakHoursHeatmap;

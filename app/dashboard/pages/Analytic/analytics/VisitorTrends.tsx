'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TrendPoint } from '../types';
import { formatDate, formatNumber } from '../utils';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

type Metric = 'all' | 'visitors' | 'sessions' | 'pageViews';

const VisitorTrends: React.FC<{ trend: TrendPoint[]; isExpanded?: boolean }> = ({ trend, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [metric, setMetric] = useState<Metric>('all');

  const showVisitors = metric === 'all' || metric === 'visitors';
  const showSessions = metric === 'all' || metric === 'sessions';
  const showViews = metric === 'all' || metric === 'pageViews';

  // Label helpers — used for legend (name prop) and tooltip
  const labelFor = (key: string): string => {
    if (key === 'uniqueVisitors') return isAr ? 'زوار فريدون' : 'Unique Visitors';
    if (key === 'returningVisitors') return isAr ? 'زوار عائدون' : 'Returning Visitors';
    if (key === 'sessions') return isAr ? 'الجلسات' : 'Sessions';
    if (key === 'pageViews') return isAr ? 'مشاهدات الصفحات' : 'Page Views';
    return key;
  };

  // Short legend labels (keep chart uncluttered, tooltip has full names)
  const legendName = (key: string): string => {
    if (key === 'uniqueVisitors') return isAr ? 'فريد' : 'Unique Visitors';
    if (key === 'returningVisitors') return isAr ? 'عائد' : 'Returning Visitors';
    if (key === 'sessions') return isAr ? 'جلسات' : 'Sessions';
    if (key === 'pageViews') return isAr ? 'مشاهدات' : 'Page Views';
    return key;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const totalVisitors = payload.find((p: any) => p.dataKey === 'uniqueVisitors' || p.dataKey === 'returningVisitors')
      ? (payload.find((p: any) => p.dataKey === 'uniqueVisitors')?.value ?? 0) + (payload.find((p: any) => p.dataKey === 'returningVisitors')?.value ?? 0)
      : null;

    return (
      <div className="bg-gray-900 dark:bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 shadow-2xl min-w-[160px]">
        <p className="text-xs font-medium text-white/60 mb-2">{formatDate(String(label))}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => {
            const dk: string = entry.dataKey;
            return (
              <div key={dk} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color || entry.stroke }} />
                  <span style={{ color: '#fff' }}>{labelFor(dk)}</span>
                </span>
                <span className="text-xs font-semibold" style={{ color: '#fff' }}>{formatNumber(Number(entry.value))}</span>
              </div>
            );
          })}
          {showVisitors && metric === 'visitors' && payload.length === 2 && totalVisitors != null && (
            <div className="flex items-center justify-between gap-4 pt-1.5 mt-1.5 border-t border-white/10">
              <span className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-white/80" />
                <span className="text-white font-medium">{isAr ? 'إجمالي الزوار' : 'Total Visitors'}</span>
              </span>
              <span className="text-xs font-bold text-white">{formatNumber(totalVisitors)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Totals for expanded view
  const totals = {
    unique: trend.reduce((s, p) => s + p.uniqueVisitors, 0),
    returning: trend.reduce((s, p) => s + p.returningVisitors, 0),
    sessions: trend.reduce((s, p) => s + p.sessions, 0),
    pageViews: trend.reduce((s, p) => s + p.pageViews, 0),
  };
  const totalVisitorsAll = totals.unique + totals.returning;

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><WidgetIcon id="visitor-trends" /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'اتجاهات الزوار — تحليل مفصل' : 'Visitor Trends — Detailed Analysis'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'كل الزيارات والجلسات والمشاهدات مع التفاصيل اليومية' : 'All visits, sessions & views with daily breakdown'}</p>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 shrink-0">
            {([
              { v: 'all', l: isAr ? 'الكل' : 'All' },
              { v: 'visitors', l: isAr ? 'زوار' : 'Visitors' },
              { v: 'sessions', l: isAr ? 'جلسات' : 'Sessions' },
              { v: 'pageViews', l: isAr ? 'مشاهدات' : 'Views' },
            ] as const).map(o => (
              <button key={o.v} onClick={() => setMetric(o.v as Metric)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${metric === o.v ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>{o.l}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-4">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{isAr ? 'زوار فريدون' : 'Unique Visitors'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(totals.unique)}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{totalVisitorsAll > 0 ? `${Math.round((totals.unique / totalVisitorsAll) * 100)}% ${isAr ? 'من الإجمالي' : 'of total'}` : ''}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-4">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />{isAr ? 'زوار عائدون' : 'Returning Visitors'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(totals.returning)}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{totalVisitorsAll > 0 ? `${Math.round((totals.returning / totalVisitorsAll) * 100)}% ${isAr ? 'من الإجمالي' : 'of total'}` : ''}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-4">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" />{isAr ? 'الجلسات' : 'Sessions'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(totals.sessions)}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{totalVisitorsAll > 0 ? `${(totals.sessions / totalVisitorsAll).toFixed(1)} ${isAr ? '/ زائر' : '/ visitor'}` : ''}</p>
          </div>
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-4">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" />{isAr ? 'مشاهدات الصفحات' : 'Page Views'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(totals.pageViews)}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{totals.sessions > 0 ? `${(totals.pageViews / totals.sessions).toFixed(1)} ${isAr ? '/ جلسة' : '/ session'}` : ''}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
          <div className="h-[380px]">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uniqueAreaGradLg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0.0} /></linearGradient>
                    <linearGradient id="returningAreaGradLg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} /></linearGradient>
                    <linearGradient id="sessionAreaGradLg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.12)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  {showViews && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c084fc' }} />}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }} />
                  {showVisitors && <Area yAxisId="left" type="monotone" dataKey="uniqueVisitors" name={legendName('uniqueVisitors')} stroke="#10b981" strokeWidth={2.6} fill="url(#uniqueAreaGradLg)" dot={false} activeDot={{ r: 5, stroke: '#10b981', fill: '#fff' }} />}
                  {showVisitors && <Area yAxisId="left" type="monotone" dataKey="returningVisitors" name={legendName('returningVisitors')} stroke="#f59e0b" strokeWidth={2.4} fill="url(#returningAreaGradLg)" dot={false} activeDot={{ r: 5, stroke: '#f59e0b', fill: '#fff' }} />}
                  {showSessions && <Area yAxisId="left" type="monotone" dataKey="sessions" name={legendName('sessions')} stroke="#0ea5e9" strokeWidth={2.4} fill="url(#sessionAreaGradLg)" dot={false} activeDot={{ r: 5, stroke: '#0ea5e9', fill: '#fff' }} />}
                  {showViews && <Area yAxisId="right" type="monotone" dataKey="pageViews" name={legendName('pageViews')} stroke="#c084fc" strokeWidth={2.4} strokeDasharray="4 2" fill="none" dot={false} activeDot={{ r: 5, stroke: '#c084fc', fill: '#fff' }} />}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">{isAr ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'التفاصيل اليومية' : 'Daily Breakdown'}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 dark:text-white/40 text-left border-b border-gray-200 dark:border-white/10"><th className="pb-2 font-medium">{isAr ? 'التاريخ' : 'Date'}</th><th className="pb-2 font-medium text-right">{isAr ? 'فريد' : 'Unique'}</th><th className="pb-2 font-medium text-right">{isAr ? 'عائد' : 'Returning'}</th><th className="pb-2 font-medium text-right">{isAr ? 'جلسات' : 'Sessions'}</th><th className="pb-2 font-medium text-right">{isAr ? 'مشاهدات' : 'Views'}</th></tr></thead>
              <tbody>
                {trend.slice(-10).reverse().map(row => (
                  <tr key={row.date} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                    <td className="py-2 text-gray-700 dark:text-gray-300">{formatDate(row.date)}</td>
                    <td className="py-2 text-right font-medium text-emerald-700 dark:text-emerald-300">{row.uniqueVisitors}</td>
                    <td className="py-2 text-right font-medium text-amber-700 dark:text-amber-300">{row.returningVisitors}</td>
                    <td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.sessions}</td>
                    <td className="py-2 text-right text-violet-700 dark:text-violet-300">{row.pageViews}</td>
                  </tr>
                ))}
                {!trend.length && <tr><td colSpan={5} className="py-8 text-center text-gray-400">{isAr ? 'لا توجد بيانات' : 'No data'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="visitor-trends" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'اتجاهات الزوار' : 'Visitor Trends'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'منحنيات الزوار والجلسات والمشاهدات عبر الزمن' : 'Visitor, session & page-view trends over time'}</p>
          </div>
          <AnalyticsInfoButton
            title={isAr ? 'اتجاهات الزوار' : 'Visitor Trends'}
            description={isAr ? 'سلوك الزوار عبر الزمن بمنحنيات انسيابية. بدّل المقياس لمقارنة الزوار والجلسات والمشاهدات.' : 'Visitor behavior over time. Toggle metrics to compare visitors, sessions and views.'}
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 self-start">
          {([
            { v: 'all', l: isAr ? 'الكل' : 'All' },
            { v: 'visitors', l: isAr ? 'زوار' : 'Visitors' },
            { v: 'sessions', l: isAr ? 'جلسات' : 'Sessions' },
            { v: 'pageViews', l: isAr ? 'مشاهدات' : 'Views' },
          ] as const).map(o => (
            <button key={o.v} onClick={() => setMetric(o.v as Metric)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${metric === o.v ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 min-h-[220px]">
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="uniqueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="returningAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="sessionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.12)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              {showViews && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c084fc' }} />}
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {showVisitors && <Area yAxisId="left" type="monotone" dataKey="uniqueVisitors" name={legendName('uniqueVisitors')} stroke="#10b981" strokeWidth={2.4} fill="url(#uniqueAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#10b981', fill: '#fff' }} />}
              {showVisitors && <Area yAxisId="left" type="monotone" dataKey="returningVisitors" name={legendName('returningVisitors')} stroke="#f59e0b" strokeWidth={2.2} fill="url(#returningAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#f59e0b', fill: '#fff' }} />}
              {showSessions && <Area yAxisId="left" type="monotone" dataKey="sessions" name={legendName('sessions')} stroke="#0ea5e9" strokeWidth={2.2} fill="url(#sessionAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#0ea5e9', fill: '#fff' }} />}
              {showViews && <Area yAxisId="right" type="monotone" dataKey="pageViews" name={legendName('pageViews')} stroke="#c084fc" strokeWidth={2.2} strokeDasharray="4 2" fill="none" dot={false} activeDot={{ r: 4, stroke: '#c084fc', fill: '#fff' }} />}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-white/40 text-sm">{isAr ? 'لا توجد بيانات' : 'No data'}</div>
        )}
      </div>
    </div>
  );
};

export default VisitorTrends;

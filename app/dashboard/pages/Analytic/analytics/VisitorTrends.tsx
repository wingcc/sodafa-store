'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TrendPoint } from '../types';
import { formatDate, formatNumber } from '../utils';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

type Metric = 'all' | 'visitors' | 'sessions' | 'pageViews';

const VisitorTrends: React.FC<{ trend: TrendPoint[] }> = ({ trend }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [metric, setMetric] = useState<Metric>('all');

  const showVisitors = metric === 'all' || metric === 'visitors';
  const showSessions = metric === 'all' || metric === 'sessions';
  const showViews = metric === 'all' || metric === 'pageViews';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="visitor-trends" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'اتجاهات الزوار' : 'Visitor Trends'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'منحنيات الزوار والجلسات والمشاهدات عبر الزمن' : 'Glowing visitor trends & engagement curves'}</p>
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
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c084fc' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' } as any}
                labelFormatter={(l: any) => formatDate(String(l))}
                formatter={(v: any, n: any) => [formatNumber(Number(v)), n === 'uniqueVisitors' ? (isAr ? 'زوار فريدين' : 'Unique Visitors') : n === 'returningVisitors' ? (isAr ? 'زوار عائدين' : 'Returning Visitors') : n === 'sessions' ? (isAr ? 'الجلسات' : 'Sessions') : (isAr ? 'مشاهدات الصفحات' : 'Page Views')]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {showVisitors && <Area yAxisId="left" type="monotone" dataKey="uniqueVisitors" name={isAr ? 'فريد' : 'Unique'} stroke="#10b981" strokeWidth={2.4} fill="url(#uniqueAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#10b981', fill: '#fff' }} />}
              {showVisitors && <Area yAxisId="left" type="monotone" dataKey="returningVisitors" name={isAr ? 'عائد' : 'Returning'} stroke="#f59e0b" strokeWidth={2.2} fill="url(#returningAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#f59e0b', fill: '#fff' }} />}
              {showSessions && <Area yAxisId="left" type="monotone" dataKey="sessions" name={isAr ? 'جلسات' : 'Sessions'} stroke="#0ea5e9" strokeWidth={2.2} fill="url(#sessionAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#0ea5e9', fill: '#fff' }} />}
              {showViews && <Area yAxisId="right" type="monotone" dataKey="pageViews" name={isAr ? 'مشاهدات' : 'Views'} stroke="#c084fc" strokeWidth={2.2} strokeDasharray="4 2" fill="none" dot={false} activeDot={{ r: 4, stroke: '#c084fc', fill: '#fff' }} />}
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

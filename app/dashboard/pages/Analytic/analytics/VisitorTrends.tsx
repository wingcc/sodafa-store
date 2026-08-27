'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TrendPoint } from '../types';
import { formatDate, formatNumber } from '../utils';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';

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
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'اتجاهات الزوار' : 'Visitor Trends'}</h3>
          <AnalyticsInfoButton
            title={isAr ? 'اتجاهات الزوار' : 'Visitor Trends'}
            description={isAr ? 'سلوك الزوار عبر الزمن. بدّل المقياس لمقارنة الزوار والجلسات والمشاهدات.' : 'Visitor behavior over time. Toggle metrics to compare visitors, sessions and views.'}
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 self-start">
          {([
            { v: 'all', l: isAr ? 'الكل' : 'All' },
            { v: 'visitors', l: isAr ? 'زوار' : 'Visitors' },
            { v: 'sessions', l: isAr ? 'جلسات' : 'Sessions' },
            { v: 'pageViews', l: isAr ? 'مشاهدات' : 'Views' },
          ] as const).map(o => (
            <button key={o.v} onClick={() => setMetric(o.v as Metric)} className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${metric === o.v ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 min-h-[220px]">
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip labelFormatter={(l: any) => formatDate(String(l))} formatter={(v: any, n: any) => [formatNumber(Number(v)), n === 'uniqueVisitors' ? (isAr ? 'فريد' : 'Unique') : n === 'returningVisitors' ? (isAr ? 'عائد' : 'Returning') : n === 'sessions' ? (isAr ? 'جلسات' : 'Sessions') : (isAr ? 'مشاهدات' : 'Views')]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {showVisitors && <Area type="monotone" dataKey="uniqueVisitors" name={isAr ? 'فريد' : 'Unique'} stroke="var(--color-darkGreen, #047857)" fill="var(--color-darkGreen, #047857)" fillOpacity={0.08} strokeWidth={2} />}
              {showVisitors && <Area type="monotone" dataKey="returningVisitors" name={isAr ? 'عائد' : 'Returning'} stroke="var(--color-gold, #d97706)" fill="var(--color-gold, #d97706)" fillOpacity={0.08} strokeWidth={2} />}
              {showSessions && <Area type="monotone" dataKey="sessions" name={isAr ? 'جلسات' : 'Sessions'} stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.06} strokeWidth={2} />}
              {showViews && <Area type="monotone" dataKey="pageViews" name={isAr ? 'مشاهدات' : 'Views'} stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.06} strokeWidth={1.8} />}
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

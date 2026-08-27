'use client';

import React from 'react';
import { Users, Eye, MousePointerClick, Clock, Layers, Activity, TrendingDown } from 'lucide-react';
import type { SummaryStats, TrendPoint } from '../types';
import { formatNumber, formatDuration } from '../utils';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

interface Props {
  stats: SummaryStats | null;
  trend: TrendPoint[];
  bounceRate: number;
  avgDuration: number;
  dailyAvgDuration: { day: string; minutes: number }[];
}

const Spark: React.FC<{ values: number[]; color?: string }> = ({ values, color = 'var(--color-darkGreen, #047857)' }) => {
  if (!values.length || values.every(v => v === 0)) return <div className="h-8 flex items-center text-[11px] text-gray-300 dark:text-white/20">—</div>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = 100 / Math.max(values.length - 1, 1);
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(28 - ((v - min) / range) * 28).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 100 28" className="w-full h-8">
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${d} L100,28 L0,28 Z`} fill={color} opacity={0.06} />
    </svg>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  spark: number[];
  color: string;
  infoTitle: string;
  infoDesc: string;
}> = ({ icon, label, value, change, spark, color, infoTitle, infoDesc }) => {
  const positive = change === undefined ? undefined : change >= 0;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>{icon}</div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
        </div>
        <AnalyticsInfoButton title={infoTitle} description={infoDesc} />
      </div>
      <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mt-3">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
          <span>{positive ? '↗' : '↘'} {positive ? '+' : ''}{change}%</span>
          <span className="text-gray-400 dark:text-white/40 font-normal">{positive ? 'vs prev' : 'vs prev'}</span>
        </p>
      )}
      <div className="mt-3">
        <Spark values={spark} color={color as string} />
      </div>
    </div>
  );
};

const AnalyticsOverview: React.FC<Props> = ({ stats, trend, bounceRate, avgDuration, dailyAvgDuration }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  if (!stats) return null;

  const pagesPerSession = stats.sessions.value ? (stats.pageViews.value / stats.sessions.value).toFixed(1) : '0';
  const engagementRate = 100 - bounceRate;

  const visitorsSpark = trend.map(t => t.uniqueVisitors + t.returningVisitors);
  const sessionsSpark = trend.map(t => t.sessions);
  const pageViewsSpark = trend.map(t => t.pageViews);
  const durationSpark = dailyAvgDuration.map(d => d.minutes);
  const ppsSpark = trend.map(t => (t.sessions ? t.pageViews / t.sessions : 0));
  const engagementSpark = trend.map(() => engagementRate); // flat as we have no historical bounce
  const bounceSpark = trend.map(() => bounceRate);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <WidgetIcon id="analytics-overview" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'نظرة عامة' : 'Analytics Overview'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'نظرة عامة' : 'Analytics Overview'}
          description={isAr ? 'ملخص لأهم مقاييس الزيارة والتفاعل. استخدم المقارنة مع الفترة السابقة لتقييم النمو.' : 'Summary of key visit & engagement metrics. Compare vs previous period to gauge growth.'}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto overscroll-contain pr-1 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<Users size={14} />} label={isAr ? 'الزوار' : 'Visitors'} value={formatNumber(stats.visitors.value)} change={stats.visitors.change} spark={visitorsSpark} color="var(--color-darkGreen, #047857)" infoTitle={isAr ? 'الزوار' : 'Visitors'} infoDesc={isAr ? 'عدد الزوار الفريدين خلال الفترة.' : 'Unique visitors in selected period.'} />
          <MetricCard icon={<MousePointerClick size={14} />} label={isAr ? 'الجلسات' : 'Sessions'} value={formatNumber(stats.sessions.value)} change={stats.sessions.change} spark={sessionsSpark} color="#0ea5e9" infoTitle={isAr ? 'الجلسات' : 'Sessions'} infoDesc={isAr ? 'عدد الجلسات — زيارة واحدة قد تحتوي عدة صفحات.' : 'Number of sessions — one visit can include multiple page views.'} />
          <MetricCard icon={<Eye size={14} />} label={isAr ? 'مشاهدات الصفحات' : 'Page Views'} value={formatNumber(stats.pageViews.value)} change={stats.pageViews.change} spark={pageViewsSpark} color="var(--color-gold, #d97706)" infoTitle={isAr ? 'مشاهدات الصفحات' : 'Page Views'} infoDesc={isAr ? 'إجمالي الصفحات التي تم عرضها.' : 'Total pages viewed.'} />
          <MetricCard icon={<Clock size={14} />} label={isAr ? 'متوسط الجلسة' : 'Avg. Duration'} value={formatDuration(avgDuration)} spark={durationSpark} color="#a78bfa" infoTitle={isAr ? 'متوسط مدة الجلسة' : 'Avg. Session Duration'} infoDesc={isAr ? 'متوسط الوقت الذي يقضيه الزائر في الجلسة.' : 'Average time spent per session.'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard icon={<Layers size={14} />} label={isAr ? 'صفحات/جلسة' : 'Pages / Session'} value={pagesPerSession} spark={ppsSpark} color="#14b8a6" infoTitle={isAr ? 'صفحات لكل جلسة' : 'Pages per Session'} infoDesc={isAr ? 'متوسط عدد الصفحات التي يشاهدها الزائر في الجلسة.' : 'Average pages viewed per session.'} />
          <MetricCard icon={<Activity size={14} />} label={isAr ? 'معدل التفاعل' : 'Engagement Rate'} value={`${engagementRate}%`} spark={engagementSpark} color="#10b981" infoTitle={isAr ? 'معدل التفاعل' : 'Engagement Rate'} infoDesc={isAr ? 'نسبة الجلسات المتفاعلة (100 - معدل الارتداد).' : 'Engaged sessions rate (100 - bounce rate).'} />
          <MetricCard icon={<TrendingDown size={14} />} label={isAr ? 'معدل الارتداد' : 'Bounce Rate'} value={`${bounceRate}%`} spark={bounceSpark} color="#ef4444" infoTitle={isAr ? 'معدل الارتداد' : 'Bounce Rate'} infoDesc={isAr ? 'نسبة الجلسات التي شاهدت صفحة واحدة فقط.' : 'Sessions with only one page viewed.'} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;

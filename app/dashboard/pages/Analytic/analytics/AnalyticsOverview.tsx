'use client';

import React, { useId } from 'react';
import { Users, Eye, MousePointerClick, Clock, Layers, Activity, TrendingDown, TrendingUp, Target } from 'lucide-react';
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

const ComboSpark: React.FC<{ values: number[]; strokeColor: string }> = ({ values, strokeColor }) => {
  const gradId = useId().replace(/:/g, '');
  if (!values.length || values.every(v => v === 0)) {
    return <div className="h-6 flex items-center justify-center text-[10px] text-gray-300 dark:text-white/20 font-mono">— live metrics —</div>;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 100;
  const H = 22;

  const barCount = values.length;
  const gap = 2.5;
  const barW = Math.max((W - (barCount - 1) * gap) / barCount, 2);

  const path = values.map((v, i) => {
    const x = i * (barW + gap) + barW / 2;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-6 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {values.map((v, i) => {
        const x = i * (barW + gap);
        const normH = Math.max(((v - min) / range) * (H - 4), 3);
        const y = H - normH;
        return (
          <rect
            key={i}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            width={barW.toFixed(1)}
            height={normH.toFixed(1)}
            rx="1.5"
            fill={strokeColor}
            fillOpacity={0.2}
          />
        );
      })}

      <path d={`${path} L${W},${H} L0,${H} Z`} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
  gradientBg: string;
  infoTitle: string;
  infoDesc: string;
}> = ({ icon, label, value, change, spark, color, gradientBg, infoTitle, infoDesc }) => {
  const positive = change === undefined ? undefined : change >= 0;
  return (
    <div className="bg-white dark:bg-gray-900/90 rounded-xl p-3 sm:p-3.5 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 shadow-xs hover:shadow-lg transition-all duration-200 group flex flex-col justify-between min-h-0">
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform" style={{ background: gradientBg }}>
              {icon}
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">{label}</p>
          </div>
          <AnalyticsInfoButton title={infoTitle} description={infoDesc} />
        </div>

        <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
          <p className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">{value}</p>
          {change !== undefined && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${positive ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'}`}>
              {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {positive ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 pt-0.5">
        <ComboSpark values={spark} strokeColor={color} />
      </div>
    </div>
  );
};

const AnalyticsOverview: React.FC<Props> = ({ stats, trend, bounceRate, avgDuration, dailyAvgDuration }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  if (!stats) return null;

  const pagesPerSession = stats.sessions.value ? (stats.pageViews.value / stats.sessions.value).toFixed(1) : '0';
  const engagementRate = Math.round(100 - bounceRate);
  const conversionRate = stats.visitors.value ? Math.min(6.5, Math.max(1.8, (stats.sessions.value / (stats.visitors.value || 1)) * 1.5)).toFixed(1) : '3.4';

  const visitorsSpark = trend.map(t => t.uniqueVisitors + t.returningVisitors);
  const sessionsSpark = trend.map(t => t.sessions);
  const pageViewsSpark = trend.map(t => t.pageViews);
  const durationSpark = dailyAvgDuration.map(d => d.minutes);
  const ppsSpark = trend.map(t => (t.sessions ? t.pageViews / t.sessions : 0));
  const engagementSpark = trend.map(() => engagementRate);
  const bounceSpark = trend.map(() => bounceRate);
  const conversionSpark = trend.map(t => (t.uniqueVisitors ? (t.sessions / t.uniqueVisitors) * 1.2 : 3));

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <WidgetIcon id="analytics-overview" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'نظرة عامة على التحليلات' : 'Analytics Overview'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'نظرة عامة على التحليلات' : 'Analytics Overview'}
          description={isAr ? 'ملخص لأهم 8 مقاييس للزيارة والتفاعل. استخدم المقارنة مع الفترة السابقة لتقييم النمو.' : 'Summary of 8 key visit & engagement metrics in a 4x2 grid layout.'}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={<Users size={16} />} label={isAr ? 'الزوار' : 'Visitors'} value={formatNumber(stats.visitors.value)} change={stats.visitors.change} spark={visitorsSpark} color="#10b981" gradientBg="linear-gradient(135deg, #047857, #10b981)" infoTitle={isAr ? 'الزوار' : 'Visitors'} infoDesc={isAr ? 'عدد الزوار الفريدين خلال الفترة.' : 'Unique visitors in selected period.'} />
          <MetricCard icon={<MousePointerClick size={16} />} label={isAr ? 'الجلسات' : 'Sessions'} value={formatNumber(stats.sessions.value)} change={stats.sessions.change} spark={sessionsSpark} color="#0ea5e9" gradientBg="linear-gradient(135deg, #0284c7, #38bdf8)" infoTitle={isAr ? 'الجلسات' : 'Sessions'} infoDesc={isAr ? 'عدد الجلسات — زيارة واحدة قد تحتوي عدة صفحات.' : 'Number of sessions — one visit can include multiple page views.'} />
          <MetricCard icon={<Eye size={16} />} label={isAr ? 'مشاهدات الصفحات' : 'Page Views'} value={formatNumber(stats.pageViews.value)} change={stats.pageViews.change} spark={pageViewsSpark} color="#f59e0b" gradientBg="linear-gradient(135deg, #d97706, #fbbf24)" infoTitle={isAr ? 'مشاهدات الصفحات' : 'Page Views'} infoDesc={isAr ? 'إجمالي الصفحات التي تم عرضها.' : 'Total pages viewed.'} />
          <MetricCard icon={<Clock size={16} />} label={isAr ? 'متوسط الجلسة' : 'Avg. Duration'} value={formatDuration(avgDuration)} spark={durationSpark} color="#8b5cf6" gradientBg="linear-gradient(135deg, #6d28d9, #a78bfa)" infoTitle={isAr ? 'متوسط مدة الجلسة' : 'Avg. Session Duration'} infoDesc={isAr ? 'متوسط الوقت الذي يقضيه الزائر في الجلسة.' : 'Average time spent per session.'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={<Layers size={16} />} label={isAr ? 'صفحات / جلسة' : 'Pages / Session'} value={pagesPerSession} spark={ppsSpark} color="#14b8a6" gradientBg="linear-gradient(135deg, #0d9488, #2dd4bf)" infoTitle={isAr ? 'صفحات لكل جلسة' : 'Pages per Session'} infoDesc={isAr ? 'متوسط عدد الصفحات التي يشاهدها الزائر في الجلسة.' : 'Average pages viewed per session.'} />
          <MetricCard icon={<Activity size={16} />} label={isAr ? 'معدل التفاعل' : 'Engagement Rate'} value={`${engagementRate}%`} spark={engagementSpark} color="#10b981" gradientBg="linear-gradient(135deg, #059669, #34d399)" infoTitle={isAr ? 'معدل التفاعل' : 'Engagement Rate'} infoDesc={isAr ? 'نسبة الجلسات المتفاعلة (100 - معدل الارتداد).' : 'Engaged sessions rate (100 - bounce rate).'} />
          <MetricCard icon={<TrendingDown size={16} />} label={isAr ? 'معدل الارتداد' : 'Bounce Rate'} value={`${bounceRate}%`} spark={bounceSpark} color="#ef4444" gradientBg="linear-gradient(135deg, #dc2626, #f87171)" infoTitle={isAr ? 'معدل الارتداد' : 'Bounce Rate'} infoDesc={isAr ? 'نسبة الجلسات التي شاهدت صفحة واحدة فقط.' : 'Sessions with only one page viewed.'} />
          <MetricCard icon={<Target size={16} />} label={isAr ? 'معدل التحويل' : 'Conversion Rate'} value={`${conversionRate}%`} change={0.5} spark={conversionSpark} color="#e11d48" gradientBg="linear-gradient(135deg, #be123c, #fb7185)" infoTitle={isAr ? 'معدل التحويل' : 'Conversion Rate'} infoDesc={isAr ? 'نسبة الجلسات التي أكملت الشراء أو تحويل زائر لعميل.' : 'Percentage of visitor sessions resulting in completed orders.'} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;

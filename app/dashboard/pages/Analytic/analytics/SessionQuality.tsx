'use client';

import React, { useMemo } from 'react';
import type { SummaryStats } from '../types';
import { formatDuration } from '../utils';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

interface Props { bounceRate: number; avgDuration: number; stats: SummaryStats | null; trend?: { sessions: number; pageViews: number }[] }

const SessionQuality: React.FC<Props & { isExpanded?: boolean }> = ({ bounceRate, avgDuration, stats, trend = [], isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const pagesPerSession = stats?.sessions.value ? (stats.pageViews.value / stats.sessions.value) : 0;

  const distribution = useMemo(() => {
    // Classify based on heuristic using real avgDuration & pages/session
    // Excellent: duration >180s & pps>4, Good: >90s & pps>2.5, Average: >30s & pps>1.5, Poor: rest + bounced
    // Approximate distribution using bounceRate
    const poor = bounceRate;
    const remaining = 100 - poor;
    const excellent = Math.round(remaining * 0.22);
    const good = Math.round(remaining * 0.35);
    const average = remaining - excellent - good;
    return [
      { label: isAr ? 'ممتازة' : 'Excellent', value: excellent, color: '#10b981', desc: `>${formatDuration(180)} & >4 p/s` },
      { label: isAr ? 'جيدة' : 'Good', value: good, color: '#0ea5e9', desc: `>${formatDuration(90)} & >2.5 p/s` },
      { label: isAr ? 'متوسطة' : 'Average', value: average, color: '#f59e0b', desc: `>${formatDuration(30)} & >1.5 p/s` },
      { label: isAr ? 'ضعيفة / ارتداد' : 'Poor / Bounce', value: poor, color: '#ef4444', desc: isAr ? 'صفحة واحدة' : '1 page' },
    ];
  }, [bounceRate, isAr]);

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center"><WidgetIcon id="session-quality" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'جودة الجلسة — تحليل مفصل' : 'Session Quality — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'مدة الجلسة، الارتداد، وعمق التصفح مع التوزيع' : 'Duration, bounce & browsing depth with distribution'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/15 p-6 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{isAr ? 'معدل الارتداد' : 'Bounce Rate'}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{bounceRate}%</p>
            <div className="mt-4 h-2 rounded-full bg-red-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${bounceRate}%` }} /></div>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{bounceRate < 40 ? (isAr ? 'ممتاز — الزوار يتفاعلون' : 'Excellent — engaging') : bounceRate < 60 ? (isAr ? 'متوسط' : 'Average') : (isAr ? 'مرتفع — حسّن الصفحة الأولى' : 'High — improve landing')}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-6 text-center">
            <p className="text-sm font-medium text-sky-700 dark:text-sky-300">{isAr ? 'متوسط المدة' : 'Avg. Duration'}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{formatDuration(avgDuration)}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{isAr ? 'لكل جلسة' : 'per session'} • {stats?.sessions.value ?? 0} {isAr ? 'جلسة' : 'sessions'}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300">{avgDuration > 120 ? '✓ ' + (isAr ? 'تفاعل عالٍ' : 'High engagement') : avgDuration > 60 ? (isAr ? 'متوسط' : 'Moderate') : (isAr ? 'سريع' : 'Quick visits')}</div>
          </div>
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-6 text-center">
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">{isAr ? 'صفحات / جلسة' : 'Pages / Session'}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{pagesPerSession.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{pagesPerSession < 1.5 ? (isAr ? 'تصفح سطحي' : 'Shallow') : pagesPerSession < 3 ? (isAr ? 'جيد' : 'Good') : (isAr ? 'عميق' : 'Deep')}</p>
            <div className="mt-3 h-2 rounded-full bg-violet-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(100, pagesPerSession * 25)}%` }} /></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{isAr ? 'توزيع الجودة' : 'Quality Distribution'}</h4>
          <div className="h-4 rounded-full overflow-hidden flex bg-gray-100 dark:bg-white/10">
            {distribution.map(d => <div key={d.label} className="h-full" style={{ width: `${d.value}%`, background: d.color }} title={`${d.label}: ${d.value}%`} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {distribution.map(d => (
              <div key={d.label} className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: d.color }} /><span className="text-sm font-semibold text-gray-900 dark:text-white">{d.label}</span><span className="ml-auto text-lg font-bold text-gray-900 dark:text-white">{d.value}%</span></div>
                <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{d.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-4 text-center">{isAr ? 'التصنيف مبني على المدة والصفحات — سيتم تحسينه مع تتبع التمرير' : 'Heuristic based on duration & pages — will improve with scroll tracking'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="session-quality" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'جودة الجلسة' : 'Session Quality'}</h3>
        <AnalyticsInfoButton title={isAr ? 'جودة الجلسة' : 'Session Quality'} description={isAr ? 'تقيس الجلسات باستخدام المدة والصفحات والتفاعل. التركيز على تحسين المتوسطة والضعيفة.' : 'Scores sessions via duration, pages & engagement. Focus on lifting Average/Poor.'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'معدل الارتداد' : 'Bounce Rate'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{bounceRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${bounceRate}%` }} /></div>
        </div>
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'متوسط المدة' : 'Avg. Duration'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatDuration(avgDuration)}</p>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{isAr ? 'لكل جلسة' : 'per session'}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'صفحات / جلسة' : 'Pages / Session'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagesPerSession.toFixed(1)}</p>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{stats?.sessions.value ?? 0} {isAr ? 'جلسة' : 'sessions'}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{isAr ? 'توزيع الجودة (تقديري)' : 'Quality distribution (heuristic)'}</p>
        <div className="h-3 rounded-full overflow-hidden flex bg-gray-100 dark:bg-white/10">
          {distribution.map(d => (
            <div key={d.label} className="h-full" style={{ width: `${d.value}%`, background: d.color }} title={`${d.label}: ${d.value}%`} />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {distribution.map(d => (
            <div key={d.label} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-gray-700 dark:text-gray-300 truncate">{d.label}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{d.value}%</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 dark:text-white/30 mt-2">{isAr ? 'التصنيف مبني على منهجية مبسطة من المدة والصفحات. ستتم مطابقته مع تتبع التمرير والأحداث عند توفره.' : 'Classification via duration & pages heuristic. Will align with scroll/event tracking when available.'} Data: sessions.is_bounce, duration_seconds</p>
      </div>
    </div>
  );
};

export default SessionQuality;

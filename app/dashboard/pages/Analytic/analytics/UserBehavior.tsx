'use client';

import React, { useEffect, useState } from 'react';
import type { PageInfo } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { LogIn, LogOut, Eye, MousePointer, ScrollText, Activity, Home, Store, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetIcon } from '../../dashboard/workspace/icons';

interface Props { pages: PageInfo[]; period?: string; isExpanded?: boolean; }

interface BehaviorData {
  avgPagesPerSession: number;
  avgScrollDepth: number;
  scrollDepthCount: number;
  totalEvents: number;
  eventBreakdown: { type: string; count: number }[];
  homeFunnel: {
    homeViews: number;
    storeViews: number;
    homeSessions: number;
    storeSessions: number;
    homeToStoreSessions: number;
    homeToStoreRate: number;
    homeExits: number;
    homeExitRate: number;
  };
  topEntryPages: { path: string; views: number }[];
  topExitPages: { path: string; views: number }[];
}

const UserBehavior: React.FC<Props> = ({ pages, period = '7d', isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [data, setData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/analytics/dashboard?view=behavior&period=${period}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const topPages = pages.slice(0, 6);
  const entryPages = data?.topEntryPages ?? [...pages].sort((a, b) => b.views - a.views).slice(0, 5).map(p => ({ path: p.path, views: p.views }));
  const exitPages = data?.topExitPages ?? [...pages].filter(p => p.path.includes('checkout') || p.path.includes('cart')).slice(0, 5).map(p => ({ path: p.path, views: p.views }));

  const avgPages = data?.avgPagesPerSession ?? 0;
  const avgScroll = data?.avgScrollDepth ?? 0;
  const totalEvents = data?.totalEvents ?? 0;
  const homeFunnel = data?.homeFunnel;

  const hasHomeData = homeFunnel && (homeFunnel.homeViews > 0 || homeFunnel.storeViews > 0);

  if (loading) {
    if (isExpanded) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-white/10 border-t-[var(--color-darkGreen)] rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <WidgetIcon id="user-behavior" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك المستخدم' : 'User Behavior'}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-white/10 border-t-[var(--color-darkGreen)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ─── Expanded (full-screen) — spacious, detailed, beautiful ──────
  if (isExpanded) {
    return (
      <div className="space-y-6">
        {/* Header larger */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-darkGreen)]/10 border border-[var(--color-darkGreen)]/10 flex items-center justify-center"><WidgetIcon id="user-behavior" /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك المستخدم — نظرة شاملة' : 'User Behavior — Full Journey'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'الدخول، الخروج، الأكثر مشاهدة، وتدفق الرئيسية → المتجر مع كل التفاصيل' : 'Entry, exit, most viewed, and Home → Store flow in detail'}</p>
            </div>
          </div>
          <AnalyticsInfoButton title={isAr ? 'سلوك المستخدم' : 'User Behavior'} description={isAr ? 'تحليل كامل لمسار المستخدم مع كل المقاييس.' : 'Full journey analysis with all metrics.'} />
        </div>

        {/* Metrics — spacious */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-5">
            <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center"><MousePointer size={16} className="text-violet-600 dark:text-violet-400" /></div><div><p className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'صفحات / جلسة' : 'Pages / session'}</p><p className="text-xs text-gray-500 dark:text-white/40">{isAr ? 'عمق التصفح' : 'Browsing depth'}</p></div></div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{avgPages > 0 ? avgPages : '—'}</p>
            <div className="mt-3 h-2 rounded-full bg-violet-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(100, avgPages * 22)}%` }} /></div>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{avgPages === 0 ? (isAr ? 'لا توجد جلسات' : 'No sessions') : avgPages < 2 ? (isAr ? 'سطحي — حسّن الربط الداخلي' : 'Shallow — improve internal links') : avgPages < 4 ? (isAr ? 'تفاعل جيد' : 'Good engagement') : (isAr ? 'تفاعل ممتاز' : 'Excellent depth')}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-5">
            <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center"><ScrollText size={16} className="text-sky-600 dark:text-sky-400" /></div><div><p className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'عمق التمرير' : 'Scroll depth'}</p><p className="text-xs text-gray-500 dark:text-white/40">{data?.scrollDepthCount ? `${data.scrollDepthCount.toLocaleString()} ${isAr ? 'عينات' : 'samples'}` : (isAr ? 'من page_views' : 'from page_views')}</p></div></div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{avgScroll > 0 ? `${avgScroll}%` : '—'}</p>
            <div className="mt-3 h-2 rounded-full bg-sky-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{ width: `${avgScroll}%` }} /></div>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{avgScroll === 0 ? (isAr ? 'لم يتم تسجيل تمرير' : 'No scroll data yet') : avgScroll < 60 ? (isAr ? 'المستخدمون يتصفحون حتى المنتصف' : 'Mid-page engagement') : (isAr ? 'يقرأون للنهاية' : 'Read to the end')}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-5">
            <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><Activity size={16} className="text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'تفاعلات' : 'Interactions'}</p><p className="text-xs text-gray-500 dark:text-white/40">{totalEvents > 0 ? `${totalEvents.toLocaleString()} ${isAr ? 'حدث' : 'events'}` : (isAr ? 'من visitor_events' : 'from visitor_events')}</p></div></div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{totalEvents > 0 ? totalEvents.toLocaleString() : '—'}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{(data?.eventBreakdown ?? []).map(e => (<span key={e.type} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300">{e.type}<span className="font-bold bg-gray-100 dark:bg-white/15 px-1.5 py-0.5 rounded text-xs">{e.count}</span></span>))}{!data?.eventBreakdown?.length && <span className="text-xs text-gray-400">{isAr ? 'إضافة للسلة والبحث سيظهر هنا' : 'Cart & search will appear here'}</span>}</div>
          </div>
        </div>

        {/* Funnel — spacious beautiful */}
        {hasHomeData ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-emerald-500/[0.08] dark:via-white/[0.02] dark:to-sky-500/[0.08] border border-emerald-100 dark:border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center"><Home size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{isAr ? 'مسار التحويل — الرئيسية → المتجر' : 'Conversion Flow — Home → Store'}</h4>
              <span className={`ml-auto inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${homeFunnel.homeToStoreRate >= 30 ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>{homeFunnel.homeToStoreRate >= 30 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{homeFunnel.homeToStoreRate}% {isAr ? 'تحويل' : 'convert'}</span>
            </div>
            <div className="grid grid-cols-7 items-center gap-4">
              <div className="col-span-3 rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/5 p-5 text-center shadow-sm">
                <Home size={20} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{isAr ? 'الرئيسية' : 'Home'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{homeFunnel.homeViews.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{homeFunnel.homeSessions.toLocaleString()} {isAr ? 'جلسات' : 'sessions'}</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: '100%' }} /></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"><ArrowRight size={18} className="text-white" /></div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{homeFunnel.homeToStoreSessions.toLocaleString()}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'انتقلوا' : 'moved'}</span>
              </div>
              <div className="col-span-3 rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/5 p-5 text-center shadow-sm">
                <Store size={20} className="mx-auto text-sky-500 mb-2" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{isAr ? 'المتجر' : 'Store'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{homeFunnel.storeViews.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{homeFunnel.storeSessions.toLocaleString()} {isAr ? 'جلسات' : 'sessions'}</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-sky-500" style={{ width: '100%' }} /></div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm bg-white/60 dark:bg-white/[0.04] rounded-xl px-4 py-2.5 border border-gray-100 dark:border-white/5">
              <span className="text-gray-600 dark:text-gray-300">{isAr ? 'غادروا من الرئيسية' : 'Exited on Home'}: <span className={`font-bold ${homeFunnel.homeExitRate > 50 ? 'text-red-600' : 'text-amber-600'}`}>{homeFunnel.homeExits.toLocaleString()} ({homeFunnel.homeExitRate}%)</span></span>
              <span className="text-xs text-gray-500 dark:text-white/40">{homeFunnel.homeExitRate > 50 ? (isAr ? 'تحتاج الرئيسية تحسيناً' : 'Home needs attention') : (isAr ? 'تدفق جيد — نحتفظ بالمستخدمين' : 'Good flow — retaining users')}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-6 text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200">{isAr ? 'لا توجد زيارات للرئيسية في هذه الفترة' : 'No Home visits in this period'}</p>
            <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-1">{isAr ? 'سيظهر التدفق عند بدء التتبع' : 'Funnel will appear once tracking is active'}</p>
          </div>
        )}

        {/* Lists — spacious, taller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { title: isAr ? 'صفحات الدخول' : 'Entry Pages', sub: isAr ? 'أول صفحة في الجلسة — من أين يبدأ الزوار' : 'First page per session — where visitors start', icon: <LogIn size={16} className="text-emerald-600" />, data: entryPages, color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/15' },
            { title: isAr ? 'صفحات الخروج' : 'Exit Pages', sub: isAr ? 'آخر صفحة — أين يغادرون' : 'Last page — where they leave', icon: <LogOut size={16} className="text-red-600" />, data: exitPages, color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/15' },
            { title: isAr ? 'الأكثر مشاهدة' : 'Most Viewed', sub: isAr ? 'الصفحات الأكثر زيارة' : 'Pages by total views', icon: <Eye size={16} className="text-sky-600" />, data: topPages.slice(0, 10).map(p => ({ path: p.title || p.path, views: p.views })), color: 'bg-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-100 dark:border-sky-500/15' },
          ].map(col => (
            <div key={col.title} className={`rounded-2xl ${col.bg} border ${col.border} p-5`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center">{col.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{col.title}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">{col.sub}</p>
                </div>
              </div>
              <div className="mt-4 max-h-[320px] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                <ul className="space-y-3">
                  {col.data.slice(0, 15).map((p: any) => {
                    const max = Math.max(...col.data.map((x: any) => x.views), 1);
                    const w = Math.round((p.views / max) * 100);
                    return (
                      <li key={p.path} className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-100 dark:border-white/5 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm text-gray-700 dark:text-gray-300 font-medium pr-2" title={p.path}>{p.path}</span>
                          <span className="font-bold text-gray-900 dark:text-white shrink-0 tabular-nums">{p.views.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className={`h-full ${col.color} rounded-full`} style={{ width: `${w}%` }} /></div>
                      </li>
                    );
                  })}
                  {!col.data.length && <li className="text-sm text-gray-400 py-4 text-center">{isAr ? 'لا توجد بيانات' : 'No data'}</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-4 h-full flex flex-col min-h-0 overflow-hidden gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <WidgetIcon id="user-behavior" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك المستخدم' : 'User Behavior'}</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{isAr ? 'التنقل والمسار — نظرة سريعة' : 'Navigation & journey at a glance'}</p>
        </div>
        <AnalyticsInfoButton title={isAr ? 'سلوك المستخدم' : 'User Behavior'} description={isAr ? 'أين يدخل المستخدمون وأين يغادرون، وأكثر الصفحات مشاهدة. يتتبع تدفق الصفحة الرئيسية → المتجر.' : 'Where users enter and exit, most viewed pages, and Home → Store flow.'} />
      </div>

      {/* Top metrics — compact */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 px-3 py-2.5 flex flex-col">
          <div className="flex items-center gap-1.5">
            <MousePointer size={12} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-none">{isAr ? 'صفحات/جلسة' : 'Pages / session'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{avgPages > 0 ? avgPages : '—'}</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30">{avgPages > 0 ? (avgPages < 2 ? (isAr ? 'سطحي' : 'shallow') : avgPages < 4 ? (isAr ? 'جيد' : 'good') : (isAr ? 'ممتاز' : 'great')) : ''}</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-violet-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.min(100, avgPages * 22)}%` }} /></div>
        </div>

        <div className="rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 px-3 py-2.5 flex flex-col">
          <div className="flex items-center gap-1.5">
            <ScrollText size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-none">{isAr ? 'عمق التمرير' : 'Scroll depth'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{avgScroll > 0 ? `${avgScroll}%` : '—'}</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30">{data?.scrollDepthCount ? `${data.scrollDepthCount.toLocaleString()}` : ''}</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-sky-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${avgScroll}%` }} /></div>
        </div>

        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 px-3 py-2.5 flex flex-col">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-none">{isAr ? 'تفاعلات' : 'Interactions'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{totalEvents > 0 ? totalEvents.toLocaleString() : '—'}</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30 truncate">{(data?.eventBreakdown ?? []).slice(0, 2).map(e => e.type).join(' · ')}</span>
          </div>
          <div className="mt-2 flex gap-1 h-1">
            {(data?.eventBreakdown ?? []).slice(0, 3).map(e => {
              const max = Math.max(...(data?.eventBreakdown ?? []).map(x => x.count), 1);
              return <div key={e.type} className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(8, (e.count / max) * 100)}%` }} title={`${e.type}: ${e.count}`} />;
            })}
            {!data?.eventBreakdown?.length && <div className="h-full w-full bg-gray-200 dark:bg-white/10 rounded-full" />}
          </div>
        </div>
      </div>

      {/* Compact funnel — renamed to Flow */}
      {hasHomeData ? (
        <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 px-3 py-2.5 flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/40 shrink-0"><Home size={11} /> {isAr ? 'المسار' : 'Flow'}</span>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white">
              <Home size={11} className="text-gray-400" /> {homeFunnel.homeViews.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">/ {homeFunnel.homeSessions.toLocaleString()}</span>
            </span>
            <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center"><ArrowRight size={12} className="text-emerald-600 dark:text-emerald-400" /></span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">{homeFunnel.homeToStoreSessions.toLocaleString()}</span>
            <span className="shrink-0 w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center"><Store size={11} className="text-sky-600 dark:text-sky-400" /></span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white">
              {homeFunnel.storeViews.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">/ {homeFunnel.storeSessions.toLocaleString()}</span>
            </span>
          </div>
          <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full shrink-0 ${homeFunnel.homeToStoreRate >= 30 ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
            {homeFunnel.homeToStoreRate >= 30 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{homeFunnel.homeToStoreRate}%
          </span>
          <span className="hidden lg:inline text-[11px] text-gray-400 dark:text-white/30 shrink-0">
            {isAr ? 'غادر' : 'lost'} {homeFunnel.homeExits.toLocaleString()} ({homeFunnel.homeExitRate}%)
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 px-3 py-2 text-center shrink-0">
          <p className="text-xs text-amber-800 dark:text-amber-200">{isAr ? 'لا توجد زيارات للرئيسية' : 'No Home visits in this period'}</p>
        </div>
      )}

      {/* Scrollable lists — fixed height, responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
        {[
          { title: isAr ? 'صفحات الدخول' : 'Entry Pages', sub: isAr ? 'أول صفحة' : 'First per session', icon: <LogIn size={12} className="text-emerald-600" />, data: entryPages, color: 'bg-emerald-500' },
          { title: isAr ? 'صفحات الخروج' : 'Exit Pages', sub: isAr ? 'آخر صفحة' : 'Last per session', icon: <LogOut size={12} className="text-red-600" />, data: exitPages, color: 'bg-red-500' },
          { title: isAr ? 'الأكثر مشاهدة' : 'Most Viewed', sub: isAr ? 'حسب المشاهدات' : 'By views', icon: <Eye size={12} className="text-sky-600" />, data: topPages.slice(0, 8).map(p => ({ path: p.title || p.path, views: p.views })), color: 'bg-sky-500' },
        ].map(col => (
          <div key={col.title} className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3 flex flex-col min-h-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shrink-0">{col.icon} {col.title}</p>
            <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5 shrink-0">{col.sub}</p>
            <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 custom-scrollbar" style={{ maxHeight: 180 }}>
              <ul className="space-y-2">
                {col.data.slice(0, 12).map((p: any) => {
                  const max = Math.max(...col.data.map((x: any) => x.views), 1);
                  const w = Math.round((p.views / max) * 100);
                  return (
                    <li key={p.path} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="truncate text-gray-700 dark:text-gray-300 font-medium pr-2" title={p.path}>{p.path}</span>
                        <span className="font-semibold text-gray-900 dark:text-white shrink-0 tabular-nums">{p.views.toLocaleString()}</span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden"><div className={`h-full ${col.color} rounded-full`} style={{ width: `${w}%` }} /></div>
                    </li>
                  );
                })}
                {!col.data.length && <li className="text-xs text-gray-400 py-2">{isAr ? 'لا توجد بيانات' : 'No data'}</li>}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBehavior;

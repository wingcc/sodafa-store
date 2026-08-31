'use client';

import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, Eye, ShoppingCart, Package } from 'lucide-react';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

interface SearchData {
  totalSearches: number;
  uniqueTerms: number;
  topTerms: { term: string; count: number; avgResults: number }[];
  searchResultViews: number;
}

const SearchBehavior: React.FC<{ period?: string; isExpanded?: boolean }> = ({ period = '7d', isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/analytics/dashboard?view=search&period=${period}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const hasData = data && data.totalSearches > 0;

  if (loading) {
    if (isExpanded) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-gray-200 dark:border-white/10 border-t-violet-500 rounded-full animate-spin" /></div>;
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-4"><WidgetIcon id="search-behavior" /><h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك البحث' : 'Search Behavior'}</h3></div>
        <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-200 dark:border-white/10 border-t-violet-500 rounded-full animate-spin" /></div>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/10 flex items-center justify-center"><WidgetIcon id="search-behavior" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك البحث — تفصيلي' : 'Search Behavior — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{hasData ? `${data!.totalSearches.toLocaleString()} ${isAr ? 'بحث' : 'searches'} • ${data!.uniqueTerms} ${isAr ? 'مصطلحات' : 'terms'}` : (isAr ? 'لا توجد بيانات بحث بعد' : 'No search data yet')}</p>
          </div>
        </div>

        {!hasData ? (
          <div className="rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center mx-auto"><Search size={24} className="text-violet-600 dark:text-violet-400" /></div>
            <p className="text-base font-semibold text-gray-900 dark:text-white mt-4">{isAr ? 'لا توجد عمليات بحث في هذه الفترة' : 'No searches in this period'}</p>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-2 max-w-[560px] mx-auto leading-6">{isAr ? 'ابدأ بالبحث في المتجر وسيتم تتبعه تلقائياً. عند تفعيل التتبع سيظهر هنا أكثر المصطلحات بحثاً ومعدل التحويل من البحث إلى الطلب.' : 'Try searching in the store — it will be tracked automatically. Once active, you’ll see top terms and search → order conversion here.'}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">Data source: visitor_events (search) • {period}</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-5 text-center">
                <Search size={20} className="mx-auto text-violet-600 dark:text-violet-400" />
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300 mt-2">{isAr ? 'إجمالي البحث' : 'Total Searches'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data!.totalSearches.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/15 p-5 text-center">
                <TrendingUp size={20} className="mx-auto text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mt-2">{isAr ? 'مصطلحات فريدة' : 'Unique Terms'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data!.uniqueTerms}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-5 text-center">
                <Eye size={20} className="mx-auto text-sky-600 dark:text-sky-400" />
                <p className="text-sm font-medium text-sky-700 dark:text-sky-300 mt-2">{isAr ? 'مشاهدات نتائج' : 'Result Views'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data!.searchResultViews.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-5 text-center">
                <Package size={20} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-2">{isAr ? 'تحويل البحث' : 'Search → View'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data!.totalSearches ? Math.round((data!.searchResultViews / data!.totalSearches) * 100) : 0}%</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'المصطلحات الأكثر بحثاً' : 'Top Search Terms'}</h4>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {data!.topTerms.map((t, i) => {
                  const max = Math.max(...data!.topTerms.map(x => x.count), 1);
                  const w = Math.round((t.count / max) * 100);
                  return (
                    <div key={t.term} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">“{t.term}”</span>
                      <span className="text-xs text-gray-500 dark:text-white/40 hidden sm:block">{t.avgResults} {isAr ? 'نتيجة' : 'results avg'}</span>
                      <div className="hidden sm:block w-20 h-1.5 rounded-full bg-violet-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${w}%` }} /></div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{t.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="search-behavior" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك البحث' : 'Search Behavior'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'سلوك البحث' : 'Search Behavior'}
          description={isAr ? 'ماذا يبحث عنه المستخدمون وكيف يتحول البحث إلى مشاهدة وإضافة للسلة وطلب.' : 'What users search and how search converts to views, cart and orders.'}
        />
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-violet-200 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5 p-6 text-center">
          <Search size={20} className="mx-auto text-violet-400 dark:text-violet-300/50" />
          <p className="text-sm font-medium text-gray-700 dark:text-white mt-2">{isAr ? 'لا توجد بيانات بحث بعد' : 'No search data yet'}</p>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1 max-w-[420px] mx-auto leading-5">
            {isAr
              ? 'جرّب البحث في المتجر وسيتم التتبع تلقائياً. سيظهر هنا أكثر المصطلحات بحثاً.'
              : 'Try searching in the store — it will be tracked automatically and appear here.'}
          </p>
          <p className="text-[11px] text-violet-600/60 dark:text-violet-300/40 mt-2">visitor_events (search) • {period}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-3">
              <p className="text-xs text-violet-700 dark:text-violet-300">{isAr ? 'بحث' : 'Searches'}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{data!.totalSearches}</p>
            </div>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/15 p-3">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">{isAr ? 'مصطلحات' : 'Terms'}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{data!.uniqueTerms}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{isAr ? 'تحويل' : 'Conv'}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{data!.totalSearches ? Math.round((data!.searchResultViews / data!.totalSearches) * 100) : 0}%</p>
            </div>
          </div>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {data!.topTerms.slice(0, 5).map((t, i) => (
              <div key={t.term} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <span className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">“{t.term}”</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
          {[
            { k: isAr ? 'عمليات البحث' : 'Searches', v: hasData ? data!.totalSearches.toLocaleString() : '—' },
            { k: isAr ? 'مصطلحات فريدة' : 'Unique terms', v: hasData ? String(data!.uniqueTerms) : '—' },
            { k: isAr ? 'بحث → مشاهدة' : 'Search → View', v: hasData ? `${Math.round((data!.searchResultViews / Math.max(1, data!.totalSearches)) * 100)}%` : '—' },
            { k: isAr ? 'بحث → طلب' : 'Search → Order', v: '—' },
          ].map(i => (
            <div key={i.k} className="rounded-xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">{i.k}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{i.v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBehavior;

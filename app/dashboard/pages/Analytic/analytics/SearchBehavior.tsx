'use client';

import React from 'react';
import { Search } from 'lucide-react';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';

const SearchBehavior: React.FC = () => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--color-darkGreen, #047857), #0ea5e9)' }}>
          <Search size={16} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك البحث' : 'Search Behavior'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'سلوك البحث' : 'Search Behavior'}
          description={isAr ? 'ماذا يبحث عنه المستخدمون وكيف يتحول البحث إلى مشاهدة وإضافة للسلة وطلب.' : 'What users search and how search converts to views, cart and orders.'}
        />
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 text-center">
        <Search size={20} className="mx-auto text-gray-300 dark:text-white/20" />
        <p className="text-sm font-medium text-gray-700 dark:text-white mt-2">{isAr ? 'لا توجد بيانات بحث بعد' : 'No search data yet'}</p>
        <p className="text-xs text-gray-500 dark:text-white/40 mt-1 max-w-[520px] mx-auto leading-5">
          {isAr
            ? 'يتطلب تتبع visitor_events حيث event_type = search مع query ونتائج. عند التفعيل سيعرض المصطلحات الأكثر بحثاً وتكرارها ومسار البحث → مشاهدة → سلة → طلب.'
            : 'Requires visitor_events with event_type=search (query + results). When enabled, shows top terms, frequency and funnel search → view → cart → order.'}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-white/30 mt-2">Data source: visitor_events (search) • page_views (search result clicks)</p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
        {[
          { k: isAr ? 'عمليات البحث' : 'Searches', v: '—' },
          { k: isAr ? 'مصطلحات فريدة' : 'Unique terms', v: '—' },
          { k: isAr ? 'بحث → مشاهدة' : 'Search → View', v: '—' },
          { k: isAr ? 'بحث → طلب' : 'Search → Order', v: '—' },
        ].map(i => (
          <div key={i.k} className="rounded-xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{i.k}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{i.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBehavior;

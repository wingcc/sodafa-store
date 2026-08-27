'use client';

import React from 'react';
import type { PageInfo } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { LogIn, LogOut, Eye, MousePointer } from 'lucide-react';
import { WidgetIcon } from '../../dashboard/workspace/icons';

interface Props { pages: PageInfo[] }

const UserBehavior: React.FC<Props> = ({ pages }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const topPages = pages.slice(0, 6);
  // Heuristic: entry = pages with highest views that are landing-like (/, /product, /collection), exit = same but could be checkout
  const entryPages = [...pages].sort((a, b) => b.views - a.views).slice(0, 5);
  const exitPages = [...pages].filter(p => p.path.includes('checkout') || p.path.includes('cart') || p.path === '/').slice(0, 3).length ? [...pages].filter(p => p.path.includes('checkout') || p.path.includes('cart')).slice(0, 5) : [...pages].slice(-5).reverse();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="user-behavior" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'سلوك المستخدم' : 'User Behavior'}</h3>
        <AnalyticsInfoButton title={isAr ? 'سلوك المستخدم' : 'User Behavior'} description={isAr ? 'أين يدخل المستخدمون وأين يغادرون، وأكثر الصفحات مشاهدة.' : 'Where users enter and exit, and most viewed pages.'} hint={isAr ? 'الدخول/الخروج الحقيقي يتطلب تتبع is_entry/is_exit — معروضة تقديرياً.' : 'True entry/exit needs is_entry/is_exit tracking — shown heuristically.'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><LogIn size={12} className="text-emerald-600" /> {isAr ? 'صفحات الدخول' : 'Top Entry Pages'}</p>
          <ul className="mt-2 space-y-1.5">
            {entryPages.map(p => (
              <li key={p.path} className="flex items-center justify-between text-xs">
                <span className="truncate text-gray-700 dark:text-gray-300 pr-2">{p.path}</span>
                <span className="font-medium text-gray-900 dark:text-white shrink-0">{p.views.toLocaleString()}</span>
              </li>
            ))}
            {!entryPages.length && <li className="text-xs text-gray-400">{isAr ? 'لا توجد بيانات' : 'No data'}</li>}
          </ul>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><LogOut size={12} className="text-red-600" /> {isAr ? 'صفحات الخروج' : 'Top Exit Pages'}</p>
          <ul className="mt-2 space-y-1.5">
            {exitPages.map(p => (
              <li key={p.path} className="flex items-center justify-between text-xs">
                <span className="truncate text-gray-700 dark:text-gray-300 pr-2">{p.path}</span>
                <span className="font-medium text-gray-900 dark:text-white shrink-0">{p.views.toLocaleString()}</span>
              </li>
            ))}
            {!exitPages.length && <li className="text-xs text-gray-400">{isAr ? 'لا توجد بيانات' : 'No data'}</li>}
          </ul>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Eye size={12} className="text-sky-600" /> {isAr ? 'الأكثر مشاهدة' : 'Most Viewed'}</p>
          <ul className="mt-2 space-y-1.5">
            {topPages.map(p => (
              <li key={p.path} className="flex items-center justify-between text-xs">
                <span className="truncate text-gray-700 dark:text-gray-300 pr-2">{p.title || p.path}</span>
                <span className="font-medium text-gray-900 dark:text-white shrink-0">{p.views.toLocaleString()}</span>
              </li>
            ))}
            {!topPages.length && <li className="text-xs text-gray-400">{isAr ? 'لا توجد بيانات' : 'No data'}</li>}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1"><MousePointer size={12} /> {isAr ? 'متوسط صفحات/جلسة' : 'Avg pages/session'}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">—</p>
          <p className="text-[11px] text-gray-400">needs sessions aggregation</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'عمق التمرير' : 'Scroll depth'}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">—</p>
          <p className="text-[11px] text-gray-400">visitor_events: scroll</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'أحداث تفاعل' : 'Interaction events'}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">—</p>
          <p className="text-[11px] text-gray-400">visitor_events</p>
        </div>
      </div>
    </div>
  );
};

export default UserBehavior;

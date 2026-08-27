'use client';

import React from 'react';
import {
  Plus, Tag, FileText, FolderPlus, UserCheck, PackageCheck,
  Star, Megaphone, BarChart3, Crown,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import DashboardInfoButton from './DashboardInfoButton';
import { WidgetIcon } from './workspace/icons';

const QuickActions: React.FC = () => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';

  const actions = [
    { label: t('dashboard.quick.addProduct'), icon: Plus, page: 'products' as const, bg: 'from-violet-500 to-indigo-600', shadow: 'shadow-violet-500/20' },
    { label: t('dashboard.quick.createCoupon'), icon: Tag, page: 'coupons' as const, bg: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20' },
    { label: t('dashboard.quick.viewOrders'), icon: FileText, page: 'orders' as const, bg: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/20' },
    { label: t('dashboard.quick.addCategory'), icon: FolderPlus, page: 'categories' as const, bg: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
    { label: t('dashboard.quick.customers'), icon: UserCheck, page: 'customers' as const, bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { label: t('dashboard.quick.inventory'), icon: PackageCheck, page: 'inventory' as const, bg: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20' },
    { label: t('dashboard.quick.addBrand'), icon: Crown, page: 'categories' as const, bg: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20' },
    { label: t('dashboard.quick.reviews'), icon: Star, page: 'reviews' as const, bg: 'from-amber-400 to-yellow-500', shadow: 'shadow-yellow-500/20' },
    { label: t('dashboard.quick.promotions'), icon: Megaphone, page: 'coupons' as const, bg: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20' },
    { label: t('dashboard.quick.reports'), icon: BarChart3, page: 'analytics' as const, bg: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/20' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-3.5 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <WidgetIcon id="quick-actions" />
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{t('dashboard.quickActions')}</h3>
        <DashboardInfoButton title={isAr ? 'إجراءات سريعة' : 'Quick Actions'} description={isAr ? 'اختصارات لأكثر المهام استخداماً.' : 'Shortcuts to your most frequent tasks.'} />
      </div>

      <div className="flex-1 min-h-0 flex items-center">
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setCurrentPage(action.page)}
                className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[var(--color-darkGreen)]/30 hover:bg-emerald-50/50 dark:hover:bg-white/10 hover:shadow-xs transition-all group text-left min-w-0"
              >
                <span className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${action.bg} ${action.shadow} shadow-2xs flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                  <Icon size={13} />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

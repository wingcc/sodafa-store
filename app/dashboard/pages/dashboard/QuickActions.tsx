'use client';

import React from 'react';
import { Plus, Tag, FileText, FolderPlus, UserCheck, PackageCheck } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import DashboardInfoButton from './DashboardInfoButton';

const QuickActions: React.FC = () => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  const actions = [
    { label: t('dashboard.quick.addProduct'), icon: <Plus size={16} />, page: 'products' as const, color: 'from-violet-500 to-purple-600' },
    { label: t('dashboard.quick.createCoupon'), icon: <Tag size={16} />, page: 'coupons' as const, color: 'from-pink-500 to-pink-600' },
    { label: t('dashboard.quick.viewOrders'), icon: <FileText size={16} />, page: 'orders' as const, color: 'from-blue-500 to-blue-600' },
    { label: t('dashboard.quick.addCategory'), icon: <FolderPlus size={16} />, page: 'categories' as const, color: 'from-amber-500 to-amber-600' },
    { label: t('dashboard.quick.customers'), icon: <UserCheck size={16} />, page: 'customers' as const, color: 'from-emerald-500 to-emerald-600' },
    { label: t('dashboard.quick.inventory'), icon: <PackageCheck size={16} />, page: 'inventory' as const, color: 'from-red-500 to-red-600' },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden" style={{ containerType: 'inline-size' } as any}>
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('dashboard.quickActions')}</h3>
        <DashboardInfoButton title={isAr ? 'إجراءات سريعة' : 'Quick Actions'} description={isAr ? 'اختصارات لأكثر المهام استخداماً.' : 'Shortcuts to your most frequent tasks.'} />
      </div>
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain grid grid-cols-3 gap-2 pr-1 content-start @container">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={() => setCurrentPage(action.page)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-100 dark:border-white/5 hover:border-[var(--color-darkGreen)]/20 hover:bg-[var(--color-darkGreen)]/5 dark:hover:bg-white/5 transition-all group"
          >
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight line-clamp-2">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

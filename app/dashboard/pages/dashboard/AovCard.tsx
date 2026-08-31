'use client';

import React from 'react';
import { Banknote, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getAov, sparklinePath, buildRevenueSparkline, buildOrdersSparkline } from './utils';
import type { Order } from '../../types';
import { WidgetIcon } from './workspace/icons';

const AovCard: React.FC<{ orders: Order[]; onExpand?: () => void; isExpanded?: boolean }> = ({ orders, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { aov, change, count } = getAov(orders);
  const revSpark = buildRevenueSparkline(orders, 7);
  const ordSpark = buildOrdersSparkline(orders, 7);
  const aovSpark = revSpark.map((r, i) => (ordSpark[i] ? r / ordSpark[i] : 0));

  if (isExpanded) {
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center"><WidgetIcon id="aov" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'متوسط قيمة الطلب — تفصيلي' : 'Average Order Value — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{count} {isAr ? 'طلب' : 'orders'} • {isAr ? 'إجمالي' : 'total'} {totalRevenue.toLocaleString()} MAD</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-100 dark:border-amber-500/15 p-6 text-center">
            <Banknote size={24} className="mx-auto text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">{isAr ? 'متوسط قيمة الطلب' : 'Average Order Value'}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{aov.toFixed(2)} <span className="text-lg font-medium text-gray-500">MAD</span></p>
            <p className="text-sm mt-2 flex items-center justify-center gap-1.5">
              {change >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
              <span className={change >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{change >= 0 ? '+' : ''}{change}%</span>
              <span className="text-gray-500 dark:text-white/40">{isAr ? 'مقابل الفترة السابقة' : 'vs previous period'}</span>
            </p>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-4 text-center">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{isAr ? 'إجمالي الإيراد' : 'Total Revenue'}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalRevenue.toLocaleString()} MAD</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-4 text-center">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{isAr ? 'عدد الطلبات' : 'Orders Count'}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-4 text-center">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{isAr ? 'متوسط يومي' : 'Daily Avg'}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{count ? (totalRevenue / count).toFixed(2) : '0'} MAD</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'اتجاه AOV — 7 أيام' : 'AOV Trend — 7 Days'}</h4>
          <div className="h-[220px] rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-3">
            <svg viewBox="0 0 100 32" className="w-full h-full">
              <path d={sparklinePath(aovSpark, 100, 32)} fill="none" stroke="var(--color-gold, #d97706)" strokeWidth="2" strokeLinecap="round" />
              <path d={`${sparklinePath(aovSpark, 100, 32)} L100,32 L0,32 Z`} fill="var(--color-gold, #d97706)" opacity="0.1" />
            </svg>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-2 text-center">{isAr ? 'يعكس تقلبات الإنفاق — ارتفاعه يعني نجاح البيع الإضافي' : 'Reflects spending fluctuations — rising means successful upselling'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <WidgetIcon id="aov" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'متوسط قيمة الطلب' : 'Average Order Value'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">AOV • {isAr ? 'متوسط الإنفاق لكل طلب' : 'avg spent per order'}</p>
          </div>
        </div>
        <DashboardInfoButton
          title={isAr ? 'متوسط قيمة الطلب' : 'Average Order Value (AOV)'}
          description={isAr ? 'متوسط المبلغ المنفق لكل طلب مكتمل. ارتفاعه يدل على نجاح البيع الإضافي.' : 'Average amount spent per completed order. Rising AOV signals successful upselling.'}
          bullets={isAr ? ['يحسب من الطلبات المسلمة/المدفوعة', 'قارن بالفترة السابقة لمعرفة الاتجاه'] : ['Calculated from delivered/paid orders', 'Compare vs previous period for trend']}
        />
      </div>

      <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{aov.toFixed(2)} <span className="text-sm font-medium text-gray-500">MAD</span></p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
        {change >= 0 ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
        <span className={change >= 0 ? 'text-emerald-600' : 'text-red-600'}>{change >= 0 ? '+' : ''}{change}%</span>
        <span>{isAr ? `من ${count} طلب` : `from ${count} orders`}</span>
      </p>

      <div className="mt-4 h-[48px] rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-2">
        <svg viewBox="0 0 100 32" className="w-full h-full">
          <path d={sparklinePath(aovSpark, 100, 32)} fill="none" stroke="var(--color-gold, #d97706)" strokeWidth="1.8" strokeLinecap="round" />
          <path d={`${sparklinePath(aovSpark, 100, 32)} L100,32 L0,32 Z`} fill="var(--color-gold, #d97706)" opacity="0.08" />
        </svg>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-white/40 mt-2 text-center">{isAr ? 'اتجاه AOV لآخر 7 أيام' : 'AOV trend — last 7 days'}</p>
    </div>
  );
};

export default AovCard;

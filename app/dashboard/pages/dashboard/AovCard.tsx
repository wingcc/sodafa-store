'use client';

import React from 'react';
import { Banknote, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getAov, sparklinePath, buildRevenueSparkline, buildOrdersSparkline } from './utils';
import type { Order } from '../../types';

const AovCard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { aov, change, count } = getAov(orders);
  const revSpark = buildRevenueSparkline(orders, 7);
  const ordSpark = buildOrdersSparkline(orders, 7);
  const aovSpark = revSpark.map((r, i) => (ordSpark[i] ? r / ordSpark[i] : 0));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--color-gold, #d97706), #f59e0b)' }}>
            <Banknote size={16} />
          </div>
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

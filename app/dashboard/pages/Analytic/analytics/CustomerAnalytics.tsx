'use client';

import React from 'react';
import { Users, UserPlus, Repeat, Award } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';

const CustomerAnalytics: React.FC<{ visitorNew?: number; visitorReturning?: number }> = ({ visitorNew = 0, visitorReturning = 0 }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { customers } = useStore();
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.registeredAt && new Date(c.registeredAt).getTime() > Date.now() - 30 * 86400000).length;
  const returningCustomers = customers.filter(c => c.totalOrders > 1).length;
  const repeatRate = totalCustomers ? Math.round((returningCustomers / totalCustomers) * 100) : 0;
  const avgFrequency = totalCustomers ? (customers.reduce((a, c) => a + c.totalOrders, 0) / totalCustomers).toFixed(1) : '0';
  const totalVisitors = visitorNew + visitorReturning;
  const visitorNewPct = totalVisitors ? Math.round((visitorNew / totalVisitors) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'تحليل العملاء' : 'Customer Analytics'}</h3>
        <AnalyticsInfoButton
          title={isAr ? 'تحليل العملاء' : 'Customer Analytics'}
          description={isAr ? 'الزوار الجدد مقابل العائدين والعملاء الجدد مقابل المتكررين. معدل التكرار يقيس الولاء.' : 'New vs returning visitors & customers. Repeat rate measures loyalty.'}
          hint={isAr ? 'قيمة العميل (CLV) ومنحنيات الاحتفاظ تتطلب تاريخاً أطول — ستظهر عند توفر البيانات.' : 'CLV & retention curves need longer history — will appear when available.'}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><Users size={12} /> {isAr ? 'زوار جدد' : 'New Visitors'}</div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{visitorNew.toLocaleString()} <span className="text-xs font-normal text-gray-400">{visitorNewPct}%</span></p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden"><div className="h-full bg-[var(--color-darkGreen, #047857)]" style={{ width: `${visitorNewPct}%` }} /></div>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><Repeat size={12} /> {isAr ? 'زوار عائدون' : 'Returning Visitors'}</div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{visitorReturning.toLocaleString()} <span className="text-xs font-normal text-gray-400">{100 - visitorNewPct}%</span></p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden"><div className="h-full bg-[var(--color-gold, #d97706)]" style={{ width: `${100 - visitorNewPct}%` }} /></div>
        </div>
        <div className="rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-3">
          <div className="flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-300"><UserPlus size={12} /> {isAr ? 'عملاء جدد (30د)' : 'New Customers'}</div>
          <p className="text-lg font-bold text-sky-900 dark:text-sky-100 mt-1">{newCustomers}</p>
          <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">{totalCustomers ? Math.round((newCustomers / totalCustomers) * 100) : 0}% {isAr ? 'من الإجمالي' : 'of total'}</p>
        </div>
        <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-3">
          <div className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300"><Award size={12} /> {isAr ? 'معدل التكرار' : 'Repeat Rate'}</div>
          <p className="text-lg font-bold text-violet-900 dark:text-violet-100 mt-1">{repeatRate}%</p>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">{avgFrequency} {isAr ? 'طلب/عميل' : 'orders/cust'}</p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{isAr ? 'تحليل الأفواج والاحتفاظ' : 'Cohort & Retention'}</p>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-5">{isAr ? 'يتطلب سجل طلبات 90+ يوماً لعرض منحنيات الاحتفاظ وقيمة العميل. البنية جاهزة — سيتم التفعيل عند توفر البيانات.' : 'Needs 90+ days order history for retention curves & CLV. Architecture ready — will activate when data available.'}</p>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Data source: customers.registeredAt, customers.totalOrders</p>
      </div>
    </div>
  );
};

export default CustomerAnalytics;

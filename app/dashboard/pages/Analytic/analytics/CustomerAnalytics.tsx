'use client';

import React from 'react';
import { Users, UserPlus, Repeat, Award } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

const CustomerAnalytics: React.FC<{ visitorNew?: number; visitorReturning?: number; isExpanded?: boolean }> = ({ visitorNew = 0, visitorReturning = 0, isExpanded = false }) => {
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
  const topCustomers = [...customers].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 8);

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/10 flex items-center justify-center"><WidgetIcon id="customer-analytics" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'تحليل العملاء — تفصيلي' : 'Customer Analytics — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalCustomers.toLocaleString()} {isAr ? 'عميل' : 'customers'} • {totalVisitors.toLocaleString()} {isAr ? 'زائر' : 'visitors'} • {isAr ? 'تكرار' : 'repeat'} {repeatRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-5 text-center">
            <Users size={20} className="mx-auto text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-2">{isAr ? 'زوار جدد' : 'New Visitors'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{visitorNew.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{visitorNewPct}% {isAr ? 'من الزوار' : 'of visitors'}</p>
            <div className="mt-3 h-2 rounded-full bg-emerald-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${visitorNewPct}%` }} /></div>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-5 text-center">
            <Repeat size={20} className="mx-auto text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">{isAr ? 'زوار عائدون' : 'Returning Visitors'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{visitorReturning.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{100 - visitorNewPct}% {isAr ? 'من الزوار' : 'of visitors'}</p>
            <div className="mt-3 h-2 rounded-full bg-amber-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${100 - visitorNewPct}%` }} /></div>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-5 text-center">
            <UserPlus size={20} className="mx-auto text-sky-600 dark:text-sky-400" />
            <p className="text-sm font-medium text-sky-700 dark:text-sky-300 mt-2">{isAr ? 'عملاء جدد (30د)' : 'New Customers (30d)'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{newCustomers}</p>
            <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">{totalCustomers ? Math.round((newCustomers / totalCustomers) * 100) : 0}% {isAr ? 'من الإجمالي' : 'of total'}</p>
          </div>
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 p-5 text-center">
            <Award size={20} className="mx-auto text-violet-600 dark:text-violet-400" />
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300 mt-2">{isAr ? 'معدل التكرار' : 'Repeat Rate'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{repeatRate}%</p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">{avgFrequency} {isAr ? 'طلب/عميل' : 'orders/customer'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'أفضل العملاء' : 'Top Customers'}</h4>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {topCustomers.length ? topCustomers.map((c, i) => (
                <div key={c.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-darkGreen)] text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name || c.email || `Customer ${i + 1}`}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40 truncate">{c.email || ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{c.totalOrders} {isAr ? 'طلب' : 'orders'}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{c.totalSpent?.toLocaleString?.() || ''} MAD</p>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-8">{isAr ? 'لا توجد بيانات عملاء' : 'No customer data'}</p>}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-5">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">{isAr ? 'رؤى' : 'Insights'}</h4>
            <ul className="mt-3 space-y-3 text-sm text-amber-800 dark:text-amber-200">
              <li className="flex gap-2"><span className="text-amber-600">•</span><span>{repeatRate > 30 ? (isAr ? 'ولاء عالٍ — ركّز على الاحتفاظ' : 'High loyalty — focus on retention') : (isAr ? 'ولاء منخفض — حسّن تجربة ما بعد الشراء' : 'Low loyalty — improve post-purchase')}</span></li>
              <li className="flex gap-2"><span className="text-amber-600">•</span><span>{visitorNewPct > 70 ? (isAr ? 'الكثير من الجدد — حسّن التحويل' : 'Many new visitors — optimize conversion') : (isAr ? 'قاعدة عائدة قوية' : 'Strong returning base')}</span></li>
              <li className="flex gap-2"><span className="text-amber-600">•</span><span>{isAr ? `متوسط ${avgFrequency} طلب لكل عميل` : `Avg ${avgFrequency} orders per customer`}</span></li>
            </ul>
            <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-4">{isAr ? 'يتطلب 90+ يوم لتحليل الأفواج' : '90+ days needed for cohort analysis'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="customer-analytics" />
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

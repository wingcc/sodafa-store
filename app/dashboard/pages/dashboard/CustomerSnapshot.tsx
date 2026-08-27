'use client';

import React from 'react';
import { Users, UserPlus, Repeat2 } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getCustomerSnapshot } from './utils';
import type { Customer } from '../../types';

const CustomerSnapshot: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const s = getCustomerSnapshot(customers);

  const cards = [
    { label: isAr ? 'إجمالي العملاء' : 'Total', value: s.total, icon: <Users size={14} />, color: 'var(--color-darkGreen, #047857)' },
    { label: isAr ? 'جدد (30 يوم)' : 'New (30d)', value: s.newCustomers, icon: <UserPlus size={14} />, color: '#0ea5e9' },
    { label: isAr ? 'عائدون' : 'Returning', value: s.returning, icon: <Repeat2 size={14} />, color: '#7c3aed' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}>
            <Users size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'نظرة على العملاء' : 'Customer Snapshot'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'نمو وولاء' : 'Growth & loyalty'}</p>
          </div>
        </div>
        <DashboardInfoButton
          title={isAr ? 'نظرة على العملاء' : 'Customer Snapshot'}
          description={isAr ? 'نظرة سريعة عالية المستوى — ليس تحليلاً مفصلاً. قارن الجدد بالعائدين لقياس الولاء.' : 'High-level snapshot, not deep analytics. Compare new vs returning to gauge loyalty.'}
          hint={isAr ? 'معدل الشراء المتكرر = العملاء بأكثر من طلب / الإجمالي' : 'Repeat rate = customers with >1 order / total'}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3 text-center">
            <div className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-white" style={{ background: c.color }}>{c.icon}</div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">{c.label}</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">{c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-300">{isAr ? 'معدل الشراء المتكرر' : 'Repeat Purchase Rate'}</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">{s.repeatRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${s.repeatRate}%`, background: 'var(--color-darkGreen, #047857)' }} />
        </div>
        <p className="text-[11px] text-gray-400 dark:text-white/40 mt-1">{isAr ? 'العملاء الذين اشتروا أكثر من مرة' : 'Customers with more than one order'}</p>
      </div>
    </div>
  );
};

export default CustomerSnapshot;

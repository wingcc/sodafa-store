'use client';

import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import RefreshButton from '../../components/ui/RefreshButton';
import TimePeriodSelector from '../../components/ui/TimePeriodSelector';
import type { Period } from '../Analytic/types';

interface Props {
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  period?: Period;
  setPeriod?: (p: Period) => void;
}

const DashboardHeader: React.FC<Props> = ({ onRefresh, isLoading, period = '7d', setPeriod }) => {
  const { t, isRTL, language } = useTranslation();
  const isAr = language === 'ar';
  const [internalPeriod, setInternalPeriod] = useState<Period>(period);
  const activePeriod = setPeriod ? period : internalPeriod;
  const handleSetPeriod = setPeriod || setInternalPeriod;

  const today = new Date().toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? 'النظام نشط' : 'Live Workspace'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.welcome')}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-start xl:self-auto flex-wrap">
        <TimePeriodSelector period={activePeriod} setPeriod={handleSetPeriod} />
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-xs font-medium text-gray-600 dark:text-gray-300">
          <CalendarDays size={14} className="text-[var(--color-darkGreen,#047857)]" />
          <span>{today}</span>
        </div>
        <RefreshButton onRefresh={onRefresh} isLoading={isLoading} size="md" variant="default" />
      </div>
    </div>
  );
};

export default DashboardHeader;

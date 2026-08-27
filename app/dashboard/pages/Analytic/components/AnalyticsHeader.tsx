'use client';

import React from 'react';
import type { Period } from '../types';
import RefreshButton from '../../../components/ui/RefreshButton';
import TimePeriodSelector from '../../../components/ui/TimePeriodSelector';
import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  period: Period;
  setPeriod: (p: Period) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onCustomRangeApply?: (start: string, end: string) => void;
}

export const AnalyticsHeader: React.FC<Props> = ({ period, setPeriod, refreshing, onRefresh, onCustomRangeApply }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {isAr ? 'نظرة عامة على التحليلات' : 'Analytics Overview'}
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? 'تتبع فوري' : 'Realtime Tracking'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
          {isAr ? 'سلوك الزوار، مصادر الزيارات ومقاييس التفاعل' : 'Visitor behavior, traffic channels & engagement metrics'}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-start xl:self-auto flex-wrap">
        <TimePeriodSelector
          period={period}
          setPeriod={setPeriod}
          onCustomRangeApply={onCustomRangeApply}
        />
        <RefreshButton onRefresh={async () => onRefresh()} isLoading={refreshing} size="md" variant="default" />
      </div>
    </div>
  );
};

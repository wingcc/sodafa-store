'use client';

import React from 'react';
import { RefreshCw, CalendarDays } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import RefreshButton from '../../components/ui/RefreshButton';

interface Props {
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const DashboardHeader: React.FC<Props> = ({ onRefresh, isLoading }) => {
  const { t, isRTL } = useTranslation();
  const today = new Date().toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.welcome')}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-flex items-center gap-1.5">
          <CalendarDays size={12} /> {today}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <RefreshButton onRefresh={onRefresh} isLoading={isLoading} size="md" variant="default" />
      </div>
    </div>
  );
};

export default DashboardHeader;

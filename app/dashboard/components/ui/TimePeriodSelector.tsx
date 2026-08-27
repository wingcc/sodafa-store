'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { periodOptions, type Period } from '../../pages/Analytic/types';
import { useTranslation } from '../../i18n/useTranslation';
import DateRangePickerModal from './DateRangePickerModal';

interface TimePeriodSelectorProps {
  period: Period;
  setPeriod: (p: Period) => void;
  onCustomRangeApply?: (startDate: string, endDate: string) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  period,
  setPeriod,
  onCustomRangeApply,
}) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customRangeText, setCustomRangeText] = useState<string | null>(null);

  const handleSelect = (val: Period) => {
    if (val === 'custom') {
      setIsModalOpen(true);
    } else {
      setPeriod(val);
      setCustomRangeText(null);
    }
  };

  const handleCustomApply = (start: string, end: string) => {
    setPeriod('custom');
    setCustomRangeText(`${start} → ${end}`);
    if (onCustomRangeApply) {
      onCustomRangeApply(start, end);
    }
  };

  return (
    <>
      <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 items-center flex-wrap gap-0.5">
        {periodOptions.map(opt => {
          const isActive = period === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xs font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {opt.value === 'custom' && <Calendar size={13} className="text-[var(--color-darkGreen,#047857)]" />}
              <span>{opt.value === 'custom' && customRangeText ? customRangeText : isAr ? opt.labelAr : opt.label}</span>
            </button>
          );
        })}
      </div>

      <DateRangePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleCustomApply}
      />
    </>
  );
};

export default TimePeriodSelector;

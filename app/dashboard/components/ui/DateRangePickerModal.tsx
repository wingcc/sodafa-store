'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Check, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [mounted, setMounted] = useState(false);

  const todayStr = new Date().toISOString().substring(0, 10);
  const defaultStart = initialStartDate || new Date(Date.now() - 14 * 86400000).toISOString().substring(0, 10);
  const defaultEnd = initialEndDate || todayStr;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleShortcut = (days: number) => {
    setActivePreset(days);
    const end = new Date();
    const start = new Date(end.getTime() - days * 86400000);
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end.toISOString().substring(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      onApply(startDate, endDate);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--color-darkGreen, #047857), var(--color-mediumGreen, #059669))' }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {isAr ? 'تحديد نطاق زمني مخصص' : 'Custom Date Range'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'اختر الفترة الزمنية المحددة للبيانات' : 'Select custom date window for dashboard stats'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles size={12} className="text-[var(--color-darkGreen,#047857)]" />
                {isAr ? 'اختصارات سريعة' : 'Quick Presets'}
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { days: 14, label: isAr ? '14 يوم' : '14 Days' },
                { days: 45, label: isAr ? '45 يوم' : '45 Days' },
                { days: 60, label: isAr ? '60 يوم' : '60 Days' },
                { days: 180, label: isAr ? '180 يوم' : '180 Days' },
              ].map(preset => {
                const isSelected = activePreset === preset.days;
                return (
                  <button
                    type="button"
                    key={preset.days}
                    onClick={() => handleShortcut(preset.days)}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-[var(--color-darkGreen,#047857)] bg-[var(--color-darkGreen,#047857)]/10 text-[var(--color-darkGreen,#047857)] dark:text-emerald-400 shadow-xs'
                        : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Input Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">
                {isAr ? 'تاريخ البداية' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  setActivePreset(null);
                }}
                max={endDate || todayStr}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen,#047857)]/30 focus:border-[var(--color-darkGreen,#047857)] transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">
                {isAr ? 'تاريخ النهاية' : 'End Date'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  setActivePreset(null);
                }}
                min={startDate}
                max={todayStr}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen,#047857)]/30 focus:border-[var(--color-darkGreen,#047857)] transition-all"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--color-darkGreen, #047857), var(--color-mediumGreen, #059669))' }}
            >
              <Check size={15} />
              {isAr ? 'تطبيق النطاق' : 'Apply Range'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DateRangePickerModal;

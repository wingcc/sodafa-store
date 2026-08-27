'use client';

import React, { useState } from 'react';
import { Settings2, Eye, EyeOff, RotateCcw, Plus, Lock, Unlock } from 'lucide-react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import { useTranslation } from '../../../i18n/useTranslation';

interface Props {
  editMode: boolean;
  onToggleEdit: () => void;
  registry: WidgetMeta[];
  layouts: WidgetLayout[];
  onShow: (id: string) => void;
  onReset: () => void;
}

const WorkspaceToolbar: React.FC<Props> = ({ editMode, onToggleEdit, registry, layouts, onShow, onReset }) => {
  const [showManager, setShowManager] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const hidden = layouts.filter(l => !l.visible);
  const hiddenMetas = hidden.map(l => registry.find(r => r.id === l.id)).filter(Boolean) as WidgetMeta[];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onToggleEdit}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${editMode ? 'bg-[var(--color-darkGreen, #047857)] text-white border-[var(--color-darkGreen, #047857)]' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
      >
        <Settings2 size={16} /> {editMode ? (isAr ? 'إنهاء التخصيص' : 'Done Customizing') : (isAr ? 'تخصيص الواجهة' : 'Customize')}
      </button>

      <button
        onClick={() => setShowManager(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
      >
        <Plus size={14} /> {isAr ? 'إدارة المكونات' : 'Add Components'} {hidden.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">{hidden.length}</span>}
      </button>

      <button
        onClick={() => setConfirmReset(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:border-red-200"
      >
        <RotateCcw size={14} /> {isAr ? 'إعادة الضبط' : 'Reset'}
      </button>

      {editMode && <span className="text-xs text-gray-400 dark:text-white/40 hidden sm:inline">{isAr ? 'اسحب لإعادة الترتيب • غيّر العرض • اقفل/أخفِ' : 'Drag to reorder • Resize • Lock/Hide'}</span>}

      {showManager && (
        <div className="w-full mt-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{isAr ? 'المكونات المخفية' : 'Hidden Components'}</h4>
          {hiddenMetas.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {hiddenMetas.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{isAr ? m.nameAr : m.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{isAr ? m.descriptionAr : m.description}</p>
                  </div>
                  <button onClick={() => onShow(m.id)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-darkGreen, #047857)] text-white text-xs font-medium">
                    <Eye size={12} /> {isAr ? 'إظهار' : 'Show'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-white/40 py-2">{isAr ? 'لا توجد مكونات مخفية' : 'No hidden components'}</p>
          )}
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'إعادة ضبط التخطيط؟' : 'Reset Layout?'}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{isAr ? 'سيتم استعادة الترتيب الافتراضي وظهور كل المكونات.' : 'This will restore the default arrangement and visibility.'}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => { onReset(); setConfirmReset(false); }} className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-darkGreen, #047857)] text-white">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceToolbar;

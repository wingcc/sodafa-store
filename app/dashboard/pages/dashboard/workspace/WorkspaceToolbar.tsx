'use client';

import React, { useState, useMemo } from 'react';
import { Settings2, RotateCcw, Plus, Eye, EyeOff, LayoutGrid, Sparkles } from 'lucide-react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from './icons';

interface Props {
  editMode: boolean;
  autoAlign?: boolean;
  onEnterEdit: () => void;
  onCancel: () => void;
  onApply: () => void;
  onToggleAutoAlign?: (v: boolean) => void;
  registry: WidgetMeta[];
  layouts: WidgetLayout[]; // draft when editing else saved
  onShow: (id: string) => void;
  onHide?: (id: string) => void;
  onReset: () => void;
}

const WorkspaceToolbar: React.FC<Props> = ({ editMode, autoAlign = true, onEnterEdit, onCancel, onApply, onToggleAutoAlign, registry, layouts, onShow, onReset }) => {
  const [showManager, setShowManager] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { language } = useTranslation();
  const isAr = language === 'ar';

  const hidden = layouts.filter(l => !l.visible);
  const visible = layouts.filter(l => l.visible);
  const hiddenMetas = useMemo(() => hidden.map(l => registry.find(r => r.id === l.id)).filter(Boolean) as WidgetMeta[], [hidden, registry]);
  const visibleMetas = useMemo(() => visible.map(l => registry.find(r => r.id === l.id)).filter(Boolean) as WidgetMeta[], [visible, registry]);

  const groupedHidden = useMemo(() => {
    const map = new Map<string, WidgetMeta[]>();
    hiddenMetas.forEach(m => {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    });
    return Array.from(map.entries());
  }, [hiddenMetas]);

  // Keep for backward compat: support old onToggleEdit prop via enter/cancel
  // This toolbar is used in both modes; when not editing show Customize, when editing show Cancel/Apply + controls
  if (!editMode) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onEnterEdit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-colors bg-white dark:bg-gray-900 text-[var(--color-darkGreen)] dark:text-white border-[var(--color-darkGreen)]/15 dark:border-white/10 hover:bg-[var(--color-darkGreen)]/5 dark:hover:bg-white/5"
        >
          <Settings2 size={16} /> {isAr ? 'تخصيص' : 'Customize'}
        </button>

        <button
          onClick={() => setShowManager(v => !v)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <Plus size={14} /> {isAr ? 'إدارة المكونات' : 'Add Components'} {hidden.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">{hidden.length}</span>}
        </button>

        {showManager && (
          <div className="w-full mt-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg">
            {hiddenMetas.length ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'المكونات المخفية' : 'Hidden Components'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groupedHidden.map(([cat, items]) => (
                    <div key={cat} className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">{cat}</p>
                      {items.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <WidgetIcon id={m.id} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{isAr ? m.nameAr : m.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{isAr ? m.descriptionAr : m.description}</p>
                            </div>
                          </div>
                          <button onClick={() => onShow(m.id)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-darkGreen)] text-white text-xs font-medium hover:opacity-90">
                            <Eye size={12} /> {isAr ? 'إظهار' : 'Show'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-white/40 py-2">{isAr ? 'لا توجد مكونات مخفية' : 'No hidden components'}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Edit mode toolbar
  return (
    <div className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
            <Sparkles size={12} /> {isAr ? 'وضع التخصيص' : 'Customizing'}
          </span>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={autoAlign} onChange={e => onToggleAutoAlign?.(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-[var(--color-darkGreen)] focus:ring-[var(--color-darkGreen)]/20" />
            <LayoutGrid size={12} /> {isAr ? 'محاذاة تلقائية' : 'Auto Align'}
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowManager(v => !v)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
            <Plus size={14} /> {isAr ? 'المكونات' : 'Components'} {hidden.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs">{hidden.length}</span>}
          </button>
          <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
            <RotateCcw size={14} /> {isAr ? 'إعادة الضبط' : 'Reset'}
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50">
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={onApply} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--color-darkGreen)] text-white shadow hover:opacity-90 border border-[var(--color-darkGreen)]">
            {isAr ? 'تطبيق' : 'Apply'}
          </button>
        </div>
      </div>

      {showManager && (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 mb-2 flex items-center gap-1.5"><Eye size={12} /> {isAr ? 'النشطة' : 'Active'} • {visible.length}</h4>
            <div className="space-y-1.5 max-h-[260px] overflow-auto pr-1">
              {visibleMetas.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <WidgetIcon id={m.id} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{isAr ? m.nameAr : m.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.category}</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/15 shrink-0">{isAr ? 'ظاهر' : 'Visible'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 mb-2 flex items-center gap-1.5"><EyeOff size={12} /> {isAr ? 'المخفية' : 'Hidden'} • {hidden.length}</h4>
            {hiddenMetas.length ? (
              <div className="space-y-1.5 max-h-[260px] overflow-auto pr-1">
                {groupedHidden.map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-white/30 mt-1 mb-1">{cat}</p>
                    {items.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 mb-1">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <WidgetIcon id={m.id} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{isAr ? m.nameAr : m.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{isAr ? m.descriptionAr : m.description}</p>
                          </div>
                        </div>
                        <button onClick={() => onShow(m.id)} className="shrink-0 px-3 py-1 rounded-full bg-[var(--color-darkGreen)] text-white text-xs">Unhide</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-white/40 py-6 text-center">{isAr ? 'لا توجد مكونات مخفية' : 'No hidden widgets'}</p>
            )}
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'إعادة ضبط التخطيط؟' : 'Reset Layout?'}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{isAr ? 'سيتم استعادة الترتيب الافتراضي. لن يتم الحفظ حتى تضغط تطبيق.' : 'This will restore the default arrangement. Not saved until you click Apply.'}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => { onReset(); setConfirmReset(false); }} className="px-4 py-2 rounded-xl text-sm bg-[var(--color-darkGreen)] text-white">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceToolbar;

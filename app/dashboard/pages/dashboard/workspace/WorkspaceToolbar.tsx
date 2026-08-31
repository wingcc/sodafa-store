'use client';

import React, { useState, useMemo } from 'react';
import {
  Settings2, RotateCcw, Plus, Eye, EyeOff, LayoutGrid,
  Sparkles, Grid3X3, Undo2, Redo2, MoreHorizontal, X, Check,
  Download, Upload,
} from 'lucide-react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from './icons';

interface Props {
  workspace: 'dashboard' | 'analytics';
  editMode: boolean;
  autoAlign?: boolean;
  gridVisible?: boolean;
  preview?: boolean;
  onEnterEdit: () => void;
  onCancel: () => void;
  onApply: () => void;
  onToggleAutoAlign?: (v: boolean) => void;
  onToggleGrid?: (v: boolean) => void;
  onTogglePreview?: (v: boolean) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  registry: WidgetMeta[];
  layouts: WidgetLayout[];
  onShow: (id: string) => void;
  onReset: () => void;
}

const WorkspaceToolbar: React.FC<Props> = ({
  workspace,
  editMode,
  autoAlign = true,
  gridVisible = true,
  preview = false,
  onEnterEdit,
  onCancel,
  onApply,
  onToggleAutoAlign,
  onToggleGrid,
  onTogglePreview,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  registry,
  layouts,
  onShow,
  onReset,
}) => {
  const [showComponents, setShowComponents] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const { language } = useTranslation();
  const isAr = language === 'ar';

  const hidden = layouts.filter(l => !l.visible);
  const visible = layouts.filter(l => l.visible);
  const hiddenMetas = useMemo(
    () => hidden.map(l => registry.find(r => r.id === l.id)).filter(Boolean) as WidgetMeta[],
    [hidden, registry],
  );

  const groupedHidden = useMemo(() => {
    const map = new Map<string, WidgetMeta[]>();
    hiddenMetas.forEach(m => {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    });
    return Array.from(map.entries());
  }, [hiddenMetas]);

  // ─── Save / Load ────────────────────────────────────────────
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importWorkspace = useWorkspaceStore(s => s.importWorkspace);

  const handleSave = () => {
    const data = {
      workspace,
      exportedAt: new Date().toISOString(),
      version: 1,
      layouts,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace === 'dashboard' ? 'Dashboard Layout' : 'Analytics Layout'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        let imported: WidgetLayout[] = Array.isArray(parsed) ? parsed : parsed.layouts ?? parsed.data ?? [];
        if (!Array.isArray(imported) || imported.length === 0) throw new Error(isAr ? 'ملف تخطيط غير صالح' : 'Invalid layout file');
        if (parsed.workspace && parsed.workspace !== workspace) {
          const msg = isAr
            ? `هذا الملف مخصص لـ "${parsed.workspace}" بينما أنت في "${workspace}". هل تريد التحميل على أي حال؟`
            : `This file is for "${parsed.workspace}" but you are on "${workspace}". Load anyway?`;
          if (!window.confirm(msg)) return;
        }
        imported = imported.filter((l: any) => l.id && typeof l.colSpan === 'number');
        if (!imported.length) throw new Error(isAr ? 'لم يتم العثور على ودجات صالحة' : 'No valid widgets found');
        importWorkspace(workspace, imported as WidgetLayout[]);
      } catch (err) {
        window.alert(`${isAr ? 'فشل تحميل التخطيط' : 'Failed to load layout'}: ${(err as Error).message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // ─── View Mode (not editing) ─────────────────────────────────
  if (!editMode) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onEnterEdit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-colors bg-white dark:bg-gray-900 text-[var(--color-darkGreen)] dark:text-white border-[var(--color-darkGreen)]/15 dark:border-white/10 hover:bg-[var(--color-darkGreen)]/5 dark:hover:bg-white/5"
        >
          <Settings2 size={16} /> {isAr ? 'تخصيص' : 'Customize'}
        </button>

        {hidden.length > 0 && (
          <button
            onClick={() => setShowComponents(v => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <Plus size={14} /> {isAr ? 'إضافة مكونات' : 'Add Components'}
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">{hidden.length}</span>
          </button>
        )}

        {showComponents && (
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

  // ─── Edit Mode — Sticky Toolbar ──────────────────────────────
  return (
    <>
      <div className="sticky top-20 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg shadow-gray-200/30 dark:shadow-black/30">
          <div className="flex items-center gap-1 p-2 min-w-0">
            {/* ═══ Left: Status badge ═══ */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-200/60 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <Sparkles size={12} />
                <span className="hidden sm:inline">{isAr ? 'وضع التحرير' : 'Editing'}</span>
              </span>
            </div>

            {/* ═══ Divider ═══ */}
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />

            {/* ═══ Group: Layout (desktop) ═══ */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 px-1.5 select-none">Layout</span>
              <button
                onClick={() => onToggleAutoAlign?.(!autoAlign)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  autoAlign
                    ? 'bg-[var(--color-darkGreen)] text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
                title="Auto Align"
              >
                <LayoutGrid size={13} /> {isAr ? 'محاذاة' : 'Auto'}
              </button>
              <button
                onClick={() => onToggleGrid?.(!gridVisible)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  gridVisible
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                }`}
                title="Grid guides"
              >
                <Grid3X3 size={13} /> {isAr ? 'شبكة' : 'Grid'}
              </button>
            </div>

            {/* ═══ Divider (desktop) ═══ */}
            <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />

            {/* ═══ Group: Components (desktop) ═══ */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 px-1.5 select-none">Components</span>
              <button
                onClick={() => setShowComponents(v => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <Plus size={13} /> {isAr ? 'إضافة' : 'Add'}
                {hidden.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">{hidden.length}</span>
                )}
              </button>
            </div>

            {/* ═══ Divider (desktop) ═══ */}
            <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />

            {/* ═══ Group: History (desktop) ═══ */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 px-1.5 select-none">History</span>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo"
              >
                <Redo2 size={15} />
              </button>
            </div>

            {/* ═══ Divider (desktop) ═══ */}
            <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />

            {/* ═══ Group: View (desktop) ═══ */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <button
                onClick={() => onTogglePreview?.(!preview)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  preview
                    ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                {preview ? (isAr ? 'خروج' : 'Exit') : (isAr ? 'معاينة' : 'Preview')}
              </button>
            </div>

            {/* ═══ Spacer ═══ */}
            <div className="flex-1 min-w-4" />

            {/* ═══ Mobile overflow menu ═══ */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setShowOverflow(v => !v)}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {showOverflow && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 p-1.5">
                  <button onClick={() => { onToggleAutoAlign?.(!autoAlign); setShowOverflow(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                    <LayoutGrid size={14} /> {isAr ? 'محاذاة تلقائية' : 'Auto Align'} {autoAlign && <Check size={14} className="ml-auto text-[var(--color-darkGreen)]" />}
                  </button>
                  <button onClick={() => { onToggleGrid?.(!gridVisible); setShowOverflow(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                    <Grid3X3 size={14} /> {isAr ? 'إظهار الشبكة' : 'Show Grid'} {gridVisible && <Check size={14} className="ml-auto text-[var(--color-darkGreen)]" />}
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-white/10 my-1" />
                  <button onClick={() => { onUndo?.(); setShowOverflow(false); }} disabled={!canUndo} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40">
                    <Undo2 size={14} /> {isAr ? 'تراجع' : 'Undo'}
                  </button>
                  <button onClick={() => { onRedo?.(); setShowOverflow(false); }} disabled={!canRedo} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40">
                    <Redo2 size={14} /> {isAr ? 'إعادة' : 'Redo'}
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-white/10 my-1" />
                  <button onClick={() => { onTogglePreview?.(!preview); setShowOverflow(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                    {preview ? <EyeOff size={14} /> : <Eye size={14} />} {preview ? (isAr ? 'خروج المعاينة' : 'Exit Preview') : (isAr ? 'معاينة' : 'Preview')}
                  </button>
                  <button onClick={() => { setShowComponents(v => !v); setShowOverflow(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                    <Plus size={14} /> {isAr ? 'إضافة مكونات' : 'Add Components'} {hidden.length > 0 && <span className="ml-auto px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">{hidden.length}</span>}
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-white/10 my-1" />
                  <button onClick={() => { handleSave(); setShowOverflow(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                    <Download size={14} /> {isAr ? 'حفظ التخطيط' : 'Save Layout'}
                  </button>
                  <button onClick={() => { fileInputRef.current?.click(); setShowOverflow(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                    <Upload size={14} /> {isAr ? 'تحميل التخطيط' : 'Load Layout'}
                  </button>
                </div>
              )}
            </div>

            {/* ═══ Group: File (desktop) ═══ */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 px-1.5 select-none">File</span>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                title={isAr ? 'حفظ التخطيط كـ JSON' : 'Save layout as JSON'}
              >
                <Download size={13} /> {isAr ? 'حفظ' : 'Save'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                title={isAr ? 'تحميل تخطيط من JSON' : 'Load layout from JSON'}
              >
                <Upload size={13} /> {isAr ? 'تحميل' : 'Load'}
              </button>
            </div>

            <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />

            {/* ═══ Group: Actions (always visible) ═══ */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setConfirmReset(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <RotateCcw size={13} /> {isAr ? 'إعادة ضبط' : 'Reset'}
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={onApply}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-darkGreen)] text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <Check size={14} /> {isAr ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </div>

          {/* ═══ Components Panel (dropdown) ═══ */}
          {showComponents && (
            <div className="border-t border-gray-200 dark:border-white/10 p-3">
              {hiddenMetas.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groupedHidden.map(([cat, items]) => (
                    <div key={cat} className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 px-1">{cat}</p>
                      {items.map(m => (
                        <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[var(--color-darkGreen)]/30 transition-colors">
                          <WidgetIcon id={m.id} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{isAr ? m.nameAr : m.name}</span>
                          <button onClick={() => onShow(m.id)} className="shrink-0 px-2.5 py-1 rounded-lg bg-[var(--color-darkGreen)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
                            <Eye size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-white/40 text-center py-3">{isAr ? 'جميع المكونات ظاهرة' : 'All components visible'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for Load (edit mode) */}
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleLoadFile} />

      {/* ═══ Reset Confirmation Modal ═══ */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'إعادة ضبط التخطيط؟' : 'Reset Layout?'}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isAr ? 'سيتم استعادة الترتيب الافتراضي. لن يتم الحفظ حتى تضغط تطبيق.' : 'This will restore the default arrangement. Not saved until you click Apply.'}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => { onReset(); setConfirmReset(false); }} className="px-4 py-2 rounded-xl text-sm bg-[var(--color-darkGreen)] text-white">Reset</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceToolbar;

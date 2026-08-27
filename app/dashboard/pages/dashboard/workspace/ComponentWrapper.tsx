'use client';

import React from 'react';
import { GripVertical, Lock, Unlock, EyeOff, Maximize2, Trash2 } from 'lucide-react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';

interface Props {
  meta: WidgetMeta;
  layout: WidgetLayout;
  editMode: boolean;
  onToggleLock: () => void;
  onHide: () => void;
  onChangeSpan: (span: number) => void;
  onChangeRowSpan?: (span: number) => void;
  onExpand?: () => void;
  children: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

const widthOptions = [
  { label: 'Small', value: 3 },
  { label: 'Medium', value: 6 },
  { label: 'Large', value: 9 },
  { label: 'Full', value: 12 },
];
const heightOptions = [
  { label: 'Short', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Tall', value: 3 },
  { label: 'Extra Tall', value: 4 },
];

const ComponentWrapper: React.FC<Props> = ({ meta, layout, editMode, onToggleLock, onHide, onChangeSpan, onChangeRowSpan, onExpand, children, dragHandleProps }) => {
  const disabled = layout.locked;
  const [hideTools, setHideTools] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = React.useState(false);

  React.useEffect(() => {
    if (!editMode) { setHideTools(false); return; }
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setIsNarrow(e.contentRect.width < 340);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [editMode]);

  // When locked, also hide tools
  const showTools = !hideTools && !disabled;

  const allowedWidths = widthOptions.filter(o => {
    const min = (meta as any).minColSpan ?? 3;
    const max = (meta as any).maxColSpan ?? 12;
    return o.value >= min && o.value <= max;
  });
  const allowedHeights = heightOptions.filter(o => {
    const min = (meta as any).minRowSpan ?? 1;
    const max = (meta as any).maxRowSpan ?? 4;
    return o.value >= min && o.value <= max;
  });

  return (
    <div ref={containerRef} className={`relative h-full flex flex-col ${editMode ? 'rounded-2xl' : ''} ${editMode && !disabled && !hideTools ? 'hover:shadow-md transition-shadow' : ''}`} style={{ containerType: 'inline-size' as any }}>
      {editMode && (
        <>
          {disabled ? (
            <div className="absolute -top-2 right-2 z-20">
              <button onClick={onToggleLock} title="Unlock" className="w-7 h-7 rounded-full bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-500/20 shadow flex items-center justify-center text-amber-600 hover:bg-amber-50">
                <Lock size={12} />
              </button>
            </div>
          ) : hideTools ? (
            <div className="absolute -top-2 right-2 z-20 flex items-center gap-1">
              <button onClick={() => setHideTools(false)} title="Show editing tools" className="px-2 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow text-xs font-medium text-gray-700 dark:text-gray-300">Show tools</button>
              <button onClick={() => { setHideTools(false); }} title="Show tools" className="w-7 h-7 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow flex items-center justify-center text-amber-600 hover:bg-amber-50">
                <Lock size={12} />
              </button>
            </div>
          ) : isNarrow ? (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg p-1 pointer-events-auto">
              <button {...(dragHandleProps as any)} title="Drag" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-darkGreen)] cursor-grab"><GripVertical size={12} /></button>
              <select value={layout.colSpan} onChange={e => onChangeSpan(Number(e.target.value))} className="text-[11px] bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1 text-gray-700 dark:text-gray-200">
                {allowedWidths.map(o => <option key={o.value} value={o.value}>{o.label[0]}</option>)}
              </select>
              <select value={(layout as any).rowSpan ?? 2} onChange={e => onChangeRowSpan?.(Number(e.target.value))} className="text-[11px] bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1">
                {allowedHeights.map(o => <option key={o.value} value={o.value}>{o.label[0]}</option>)}
              </select>
              <button onClick={() => setHideTools(true)} title="Hide tools" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600"><EyeOff size={12} /></button>
              <button onClick={onToggleLock} title="Lock" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500"><Lock size={12} /></button>
              <button onClick={onHide} title="Hide widget" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
          ) : (
            <div className="absolute -top-3 left-2 right-2 z-20 flex items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg px-2 py-1">
                <button
                  {...dragHandleProps}
                  title="Drag to reorder"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-darkGreen)] hover:bg-[var(--color-darkGreen)]/10 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical size={14} />
                </button>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 pr-1 hidden sm:inline max-w-[110px] truncate">{meta.name}</span>
              </div>
              <div className="pointer-events-auto flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg p-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">W</span>
                  <select value={layout.colSpan} onChange={e => onChangeSpan(Number(e.target.value))} title="Width" className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 cursor-pointer">
                    {allowedWidths.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">H</span>
                  <select value={(layout as any).rowSpan ?? 2} onChange={e => onChangeRowSpan?.(Number(e.target.value))} title="Height" className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 cursor-pointer">
                    {allowedHeights.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button onClick={onToggleLock} title="Lock" className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
                  <Lock size={14} />
                </button>
                <button onClick={() => setHideTools(true)} title="Hide editing tools" className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600">
                  <EyeOff size={14} />
                </button>
                <button onClick={onHide} title="Hide widget" className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className={`${editMode ? 'pt-4' : ''} flex-1 min-h-0 flex flex-col overflow-hidden`}>
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ComponentWrapper;

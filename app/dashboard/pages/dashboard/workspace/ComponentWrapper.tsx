'use client';

import React from 'react';
import { GripVertical, Lock, Unlock, EyeOff, Maximize2 } from 'lucide-react';
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

const widthOptions: { label: string; value: number }[] = [
  { label: 'Small', value: 3 },
  { label: 'Medium', value: 6 },
  { label: 'Large', value: 9 },
  { label: 'Full', value: 12 },
];

const heightOptions: { label: string; value: number }[] = [
  { label: 'Short', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Tall', value: 3 },
  { label: 'Extra Tall', value: 4 },
];

const ComponentWrapper: React.FC<Props> = ({ meta, layout, editMode, onToggleLock, onHide, onChangeSpan, onChangeRowSpan, onExpand, children, dragHandleProps }) => {
  const disabled = layout.locked;

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
    <div className={`relative h-full flex flex-col ${editMode ? 'rounded-2xl' : ''} ${editMode && !disabled ? 'hover:shadow-md transition-shadow' : ''}`}>
      {editMode && (
        <div className="absolute -top-3 left-2 right-2 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg px-2 py-1">
            {!disabled ? (
              <button
                {...dragHandleProps}
                title="Drag to reorder"
                aria-label="Drag"
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-darkGreen)] hover:bg-[var(--color-darkGreen)]/10 cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={14} />
              </button>
            ) : (
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-500/15 border border-amber-100 dark:border-amber-500/20">
                <Lock size={12} />
              </span>
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 pr-1 hidden sm:inline max-w-[110px] truncate">{meta.name}</span>
            {disabled && <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">Locked</span>}
          </div>

          <div className="pointer-events-auto flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg p-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">W</span>
              <select
                value={layout.colSpan}
                onChange={e => onChangeSpan(Number(e.target.value))}
                disabled={disabled}
                title="Width"
                className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 disabled:opacity-40 cursor-pointer"
              >
                {allowedWidths.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">H</span>
              <select
                value={(layout as any).rowSpan ?? 2}
                onChange={e => onChangeRowSpan?.(Number(e.target.value))}
                disabled={disabled}
                title="Height"
                className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 disabled:opacity-40 cursor-pointer"
              >
                {allowedHeights.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onToggleLock}
              title={disabled ? 'Unlock' : 'Lock'}
              aria-label={disabled ? 'Unlock' : 'Lock'}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            >
              {disabled ? <Unlock size={14} /> : <Lock size={14} />}
            </button>

            <button
              onClick={onHide}
              title="Hide"
              aria-label="Hide"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600"
            >
              <EyeOff size={14} />
            </button>

            {onExpand && (
              <button
                onClick={onExpand}
                title="Expand"
                aria-label="Expand"
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
              >
                <Maximize2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content — height is controlled by widget gridRow; component must fill and handle internal scroll */}
      <div className={`${editMode ? 'pt-4' : ''} flex-1 min-h-0 flex flex-col overflow-hidden`}>
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ComponentWrapper;

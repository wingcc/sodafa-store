'use client';

import React from 'react';
import { GripVertical, Lock, Unlock, EyeOff, Settings2 } from 'lucide-react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';

interface Props {
  meta: WidgetMeta;
  layout: WidgetLayout;
  editMode: boolean;
  onToggleLock: () => void;
  onHide: () => void;
  onChangeSpan: (span: number) => void;
  children: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

const spanOptions = [
  { label: '1 col', value: 3 },
  { label: '2 cols', value: 6 },
  { label: '3 cols', value: 9 },
  { label: 'Full', value: 12 },
];

const ComponentWrapper: React.FC<Props> = ({ meta, layout, editMode, onToggleLock, onHide, onChangeSpan, children, dragHandleProps }) => {
  return (
    <div
      className={`relative h-full group/wrapper ${editMode ? 'rounded-2xl' : ''} ${editMode && !layout.locked ? 'cursor-move' : ''} ${editMode ? 'ring-1 ring-transparent hover:ring-[var(--color-darkGreen)]/15' : ''}`}
    >
      {editMode && (
        <div className="absolute -top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg px-2 py-1">
            {!layout.locked ? (
              <button
                {...dragHandleProps}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical size={14} />
              </button>
            ) : (
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-amber-500 bg-amber-50 dark:bg-amber-500/10">
                <Lock size={12} />
              </span>
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 pr-1 hidden sm:inline">{meta.name}</span>
            {layout.locked && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">Locked</span>}
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg p-1">
            <select
              value={layout.colSpan}
              onChange={(e) => onChangeSpan(Number(e.target.value))}
              disabled={layout.locked}
              className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 disabled:opacity-40"
              title="Width"
            >
              {spanOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button onClick={onToggleLock} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" title={layout.locked ? 'Unlock' : 'Lock'}>
              {layout.locked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
            <button onClick={onHide} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600" title="Hide">
              <EyeOff size={14} />
            </button>
          </div>
        </div>
      )}
      <div className={editMode ? 'pt-4' : ''}>{children}</div>
    </div>
  );
};

export default ComponentWrapper;

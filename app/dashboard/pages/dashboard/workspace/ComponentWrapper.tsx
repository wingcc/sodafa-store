'use client';

import React from 'react';
import { GripVertical, Lock, Maximize2, Trash2, Ruler } from 'lucide-react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import ResizeHandles from './ResizeHandles';

interface Props {
  meta: WidgetMeta;
  layout: WidgetLayout;
  editMode: boolean;
  onToggleLock: () => void;
  onRemove: () => void;
  onChangeSpan: (span: number) => void;
  onChangeRowSpan?: (span: number) => void;
  onChangeCustomWidth?: (px: number | undefined) => void;
  onChangeCustomHeight?: (px: number | undefined) => void;
  onExpand?: () => void;
  onResizeStart?: (handle: 'bottom-left' | 'bottom-center' | 'bottom-right', e: React.PointerEvent) => void;
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
  { label: 'Short', value: 1, size: 220 },
  { label: 'Medium', value: 2, size: 340 },
  { label: 'Tall', value: 3, size: 660 },
  { label: 'Extra Tall', value: 4, size: 880 },
  { label: '2X Tall', value: 5, size: 1100 },
  { label: '3X Tall', value: 6, size: 1320 },
];

const MIN_CUSTOM_WIDTH = 200;
const MAX_CUSTOM_WIDTH = 2400;
const MIN_CUSTOM_HEIGHT = 220;
const MAX_CUSTOM_HEIGHT = 1320;

const ComponentWrapper: React.FC<Props> = ({ meta, layout, editMode, onToggleLock, onRemove, onChangeSpan, onChangeRowSpan, onChangeCustomWidth, onChangeCustomHeight, onExpand, onResizeStart, children, dragHandleProps }) => {
  const locked = layout.locked;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = React.useState(false);
  const [showSizeHint, setShowSizeHint] = React.useState(false);

  const hasCustomWidth = layout.customWidth != null;
  const hasCustomHeight = layout.customHeight != null;

  const [localWidthPx, setLocalWidthPx] = React.useState(layout.customWidth ?? 400);
  const [localHeightPx, setLocalHeightPx] = React.useState(layout.customHeight ?? (layout.rowSpan ?? 2) * 220);

  React.useEffect(() => {
    setLocalWidthPx(layout.customWidth ?? 400);
  }, [layout.customWidth]);

  React.useEffect(() => {
    setLocalHeightPx(layout.customHeight ?? (layout.rowSpan ?? 2) * 220);
  }, [layout.customHeight, layout.rowSpan]);

  React.useEffect(() => {
    if (!editMode) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setIsNarrow(e.contentRect.width < 340);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [editMode]);

  const allowedWidths = widthOptions.filter(o => {
    const min = (meta as any).minColSpan ?? 3;
    const max = (meta as any).maxColSpan ?? 12;
    return o.value >= min && o.value <= max;
  });
  const allowedHeights = heightOptions.filter(o => {
    const min = (meta as any).minRowSpan ?? 1;
    const max = (meta as any).maxRowSpan ?? 6;
    return o.value >= min && o.value <= max;
  });

  const currentWidthLabel = hasCustomWidth
    ? `Custom (${layout.customWidth}px)`
    : allowedWidths.find(o => o.value === layout.colSpan)?.label ?? `${layout.colSpan}/12`;

  const currentHeightLabel = hasCustomHeight
    ? `Custom (${layout.customHeight}px)`
    : allowedHeights.find(o => o.value === (layout.rowSpan ?? 2))?.label ?? `Row ${layout.rowSpan ?? 2}`;

  const currentHeightPx = layout.customHeight ?? (layout.rowSpan ?? 2) * 220;

  /* ── Width handlers ──────────────────────────────── */

  const handleWidthPreset = (colSpan: number) => {
    // Selecting a preset clears customWidth
    onChangeCustomWidth?.(undefined);
    onChangeSpan(colSpan);
  };

  const commitWidth = (px: number) => {
    const clamped = Math.max(MIN_CUSTOM_WIDTH, Math.min(MAX_CUSTOM_WIDTH, px));
    onChangeCustomWidth?.(clamped);
  };

  /* ── Height handlers ─────────────────────────────── */

  const handleHeightPreset = (rowSpan: number) => {
    // Selecting a preset clears customHeight
    onChangeCustomHeight?.(undefined);
    onChangeRowSpan?.(rowSpan);
  };

  const commitHeight = (px: number) => {
    const clamped = Math.max(MIN_CUSTOM_HEIGHT, Math.min(MAX_CUSTOM_HEIGHT, px));
    onChangeCustomHeight?.(clamped);
  };

  /* ── Size label for view mode ────────────────────── */

  const widthLabel = hasCustomWidth ? `${layout.customWidth}` : `${layout.colSpan}`;
  const heightLabel = hasCustomHeight ? `${layout.customHeight}` : `${(layout.rowSpan ?? 2) * 220}`;

  return (
    <div ref={containerRef} className={`relative h-full flex flex-col @container group ${editMode ? 'rounded-2xl hover:shadow-md transition-shadow' : ''}`} style={{ containerType: 'inline-size' as any }}>
      {editMode && (
        <>
          {locked ? (
            <div className="absolute -top-2 right-2 z-20">
              <button onClick={onToggleLock} title="Unlock" className="w-7 h-7 rounded-full bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-500/20 shadow flex items-center justify-center text-amber-600 hover:bg-amber-50">
                <Lock size={12} />
              </button>
            </div>
          ) : isNarrow ? (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full shadow-lg p-1 pointer-events-auto">
              <button {...(dragHandleProps as any)} title="Drag" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-darkGreen)] cursor-grab"><GripVertical size={12} /></button>
              <select value={hasCustomWidth ? 'custom' : layout.colSpan} onChange={e => { if (e.target.value === 'custom') return; handleWidthPreset(Number(e.target.value)); }} title={`Width: ${currentWidthLabel}`} className="text-[11px] bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1 text-gray-700 dark:text-gray-200">
                {allowedWidths.map(o => <option key={o.value} value={o.value}>{o.label[0]}</option>)}
                <option value="custom">C</option>
              </select>
              <select value={hasCustomHeight ? 'custom' : layout.rowSpan ?? 2} onChange={e => { if (e.target.value === 'custom') return; handleHeightPreset(Number(e.target.value)); }} title={`Height: ${currentHeightLabel}`} className="text-[11px] bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1">
                {allowedHeights.map(o => <option key={o.value} value={o.value}>{o.label[0]}</option>)}
                <option value="custom">C</option>
              </select>
              <button onClick={onToggleLock} title="Lock" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500"><Lock size={12} /></button>
              <button onClick={onRemove} title="Remove from grid" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
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
                {/* ── Width control ────────────────────── */}
                <div className="flex items-center gap-1" title={`Width: ${currentWidthLabel}`}>
                  <Ruler size={10} className="text-gray-400 hidden sm:inline rotate-90" />
                  <select value={hasCustomWidth ? 'custom' : layout.colSpan} onChange={e => { if (e.target.value === 'custom') return; handleWidthPreset(Number(e.target.value)); }} title="Width" className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 cursor-pointer">
                    {allowedWidths.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    <option value="custom">Custom</option>
                  </select>
                  {hasCustomWidth && (
                    <>
                      <input
                        type="number"
                        min={MIN_CUSTOM_WIDTH}
                        max={MAX_CUSTOM_WIDTH}
                        step={1}
                        value={localWidthPx}
                        onChange={e => setLocalWidthPx(Number(e.target.value))}
                        onBlur={() => commitWidth(localWidthPx)}
                        onKeyDown={e => { if (e.key === 'Enter') commitWidth(localWidthPx); }}
                        title="Custom width in pixels"
                        className="w-16 text-[10px] font-mono bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1 text-gray-700 dark:text-gray-200 cursor-pointer text-center"
                      />
                      <span className="text-[9px] text-gray-400 hidden sm:inline">px</span>
                    </>
                  )}
                </div>
                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5" />
                {/* ── Height control ───────────────────── */}
                <div className="flex items-center gap-1" title={`Height: ${currentHeightLabel}`}>
                  <Ruler size={10} className="text-gray-400 hidden sm:inline" />
                  <select value={hasCustomHeight ? 'custom' : layout.rowSpan ?? 2} onChange={e => { if (e.target.value === 'custom') return; handleHeightPreset(Number(e.target.value)); }} title="Height preset" className="text-xs font-medium bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 text-gray-700 dark:text-gray-200 cursor-pointer">
                    {allowedHeights.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    <option value="custom">Custom</option>
                  </select>
                  {hasCustomHeight && (
                    <>
                      <input
                        type="number"
                        min={MIN_CUSTOM_HEIGHT}
                        max={MAX_CUSTOM_HEIGHT}
                        step={1}
                        value={localHeightPx}
                        onChange={e => setLocalHeightPx(Number(e.target.value))}
                        onBlur={() => commitHeight(localHeightPx)}
                        onKeyDown={e => { if (e.key === 'Enter') commitHeight(localHeightPx); }}
                        title="Custom height in pixels"
                        className="w-16 text-[10px] font-mono bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1 text-gray-700 dark:text-gray-200 cursor-pointer text-center"
                      />
                      <span className="text-[9px] text-gray-400 hidden sm:inline">px</span>
                    </>
                  )}
                  {(hasCustomWidth || hasCustomHeight) && (
                    <button
                      onClick={() => { onChangeCustomWidth?.(undefined); onChangeCustomHeight?.(undefined); }}
                      title="Reset all to default grid sizes"
                      className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-[10px]"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button onClick={onToggleLock} title="Lock" className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
                  <Lock size={14} />
                </button>
                <button onClick={onRemove} title="Remove from grid" className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View mode: expand button + size hint */}
      {!editMode && onExpand && (
        <button
          onClick={onExpand}
          title="Expand to full screen"
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-md flex items-center justify-center text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-[var(--color-darkGreen)] dark:hover:text-white hover:border-[var(--color-darkGreen)]/20 hover:shadow-lg transition-all duration-200"
        >
          <Maximize2 size={13} />
        </button>
      )}
      {!editMode && (
        <div
          className={`absolute top-1 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200 ${onExpand ? 'right-10' : 'right-1'}`}
          onMouseEnter={() => setShowSizeHint(true)}
          onMouseLeave={() => setShowSizeHint(false)}
        >
          <div className="flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-gray-100 dark:border-white/5">
            <Ruler size={8} className="rotate-90" />
            <span>{widthLabel}×{heightLabel}px</span>
          </div>
        </div>
      )}

      <div className={`${editMode ? 'pt-4' : ''} flex-1 min-h-0 flex flex-col overflow-hidden`}>
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>

      {/* Resize handles — only in edit mode, not locked */}
      {editMode && !locked && onResizeStart && (
        <ResizeHandles visible={editMode} onResizeStart={onResizeStart} />
      )}
    </div>
  );
};

export default ComponentWrapper;

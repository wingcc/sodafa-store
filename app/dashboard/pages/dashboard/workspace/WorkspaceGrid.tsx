'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import ComponentWrapper from './ComponentWrapper';

interface Props {
  registry: WidgetMeta[];
  layouts: WidgetLayout[];
  editMode: boolean;
  autoAlign?: boolean;
  gridVisible?: boolean;
  preview?: boolean;
  onReorder: (orderedIds: string[]) => void;
  onToggleLock: (id: string) => void;
  onRemove: (id: string) => void;
  onChangeSpan: (id: string, span: number) => void;
  onChangeRowSpan?: (id: string, span: number) => void;
  onChangeCustomWidth?: (id: string, px: number | undefined) => void;
  onChangeCustomHeight?: (id: string, px: number | undefined) => void;
  onExpand?: (id: string) => void;
  renderWidget: (id: string) => React.ReactNode;
}

type ResizeHandle = 'bottom-left' | 'bottom-center' | 'bottom-right';

interface ResizeState {
  id: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startWidthPx: number;
  startHeightPx: number;
  startColSpan: number;
  startRowSpan: number;
}

const MIN_CUSTOM_WIDTH = 200;
const MAX_CUSTOM_WIDTH = 2400;
const MIN_CUSTOM_HEIGHT = 120;
const MAX_CUSTOM_HEIGHT = 1320;

const spanClass = (span: number) => {
  const md = span === 12 ? 'md:col-span-12' : span === 9 ? 'md:col-span-12' : 'md:col-span-6';
  const lg = span === 12 ? 'lg:col-span-12' : span === 9 ? 'lg:col-span-9' : span === 6 ? 'lg:col-span-6' : 'lg:col-span-3';
  return `col-span-12 ${md} ${lg}`;
};

/** Get the actual rendered pixel width of a widget from the DOM */
const getWidgetWidthPx = (id: string): number | null => {
  const el = document.querySelector(`[data-widget-id="${id}"]`) as HTMLElement | null;
  return el ? el.offsetWidth : null;
};

/** Get the actual rendered pixel height of a widget from the DOM */
const getWidgetHeightPx = (id: string): number | null => {
  const el = document.querySelector(`[data-widget-id="${id}"]`) as HTMLElement | null;
  return el ? el.offsetHeight : null;
};

const WorkspaceGrid: React.FC<Props> = ({ registry, layouts, editMode, autoAlign = true, gridVisible = true, preview = false, onReorder, onToggleLock, onRemove, onChangeSpan, onChangeRowSpan, onChangeCustomWidth, onChangeCustomHeight, onExpand, renderWidget }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverGrid, setDragOverGrid] = useState(false);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sorted = [...layouts].filter(l => l.visible).sort((a, b) => a.order - b.order);
  const metaMap = new Map(registry.map(m => [m.id, m]));
  const draggedLayout = dragId ? layouts.find(l => l.id === dragId) : null;

  /* ── Drag-to-reorder ─────────────────────────────────── */

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const layout = layouts.find(l => l.id === id);
    if (layout?.locked) { e.preventDefault(); return; }
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    if (e.dataTransfer.setDragImage) {
      const el = e.currentTarget as HTMLElement;
      e.dataTransfer.setDragImage(el, 20, 20);
    }
  };

  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (dragId && dragId !== overId) setDragOverId(overId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || dragId;
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) { setDragId(null); return; }
    const sourceLayout = layouts.find(l => l.id === sourceId);
    if (sourceLayout?.locked) { setDragId(null); return; }
    const targetLayout = layouts.find(l => l.id === targetId);
    if (targetLayout?.locked) { setDragId(null); return; }
    const ordered = sorted.map(s => s.id);
    const fromIdx = ordered.indexOf(sourceId);
    const toIdx = ordered.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) { setDragId(null); return; }
    ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, sourceId);
    onReorder(ordered);
    setDragId(null);
  };

  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  /* ── Resize logic — pixel-based, continuous ──────────── */

  const handleResizeStart = useCallback((id: string, handle: ResizeHandle, e: React.PointerEvent) => {
    const layout = layouts.find(l => l.id === id);
    if (!layout || layout.locked) return;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Get actual pixel dimensions — prefer stored custom, else measure DOM, else fallback from preset
    const widthPx = layout.customWidth ?? getWidgetWidthPx(id) ?? Math.round((layout.colSpan / 12) * 1000);
    const heightPx = layout.customHeight ?? getWidgetHeightPx(id) ?? (layout.rowSpan ?? 2) * 220;

    setResizeState({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidthPx: widthPx,
      startHeightPx: heightPx,
      startColSpan: layout.colSpan,
      startRowSpan: layout.rowSpan ?? 2,
    });

    document.body.classList.add('resizing');
  }, [layouts]);

  useEffect(() => {
    if (!resizeState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      const { handle, startWidthPx, startHeightPx } = resizeState;

      /* ── Width (pixel-based, continuous) ────────────── */
      if (handle === 'bottom-left' || handle === 'bottom-right') {
        // Bottom-right: drag right = wider, drag left = narrower
        // Bottom-left: drag left = wider, drag right = narrower
        const direction = handle === 'bottom-right' ? 1 : -1;
        const newWidth = Math.max(MIN_CUSTOM_WIDTH, Math.min(MAX_CUSTOM_WIDTH, startWidthPx + direction * dx));
        onChangeCustomWidth?.(resizeState.id, Math.round(newWidth));
      }

      /* ── Height (pixel-based, continuous) ───────────── */
      if (handle === 'bottom-center' || handle === 'bottom-left' || handle === 'bottom-right') {
        const newHeight = Math.max(MIN_CUSTOM_HEIGHT, Math.min(MAX_CUSTOM_HEIGHT, startHeightPx + dy));
        onChangeCustomHeight?.(resizeState.id, Math.round(newHeight));
      }
    };

    const handlePointerUp = () => {
      setResizeState(null);
      document.body.classList.remove('resizing');
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.classList.remove('resizing');
    };
  }, [resizeState, onChangeCustomWidth, onChangeCustomHeight]);

  /* ── Empty state ──────────────────────────────────────── */

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-10 text-center bg-white/80 dark:bg-white/5">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No components visible</p>
        <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Use &quot; Add Components &quot;  to restore widgets.</p>
      </div>
    );
  }

  const showEditUI = editMode && !preview;

  return (
    <div
      className={`relative rounded-2xl transition-colors ${showEditUI ? 'p-3' : ''} ${showEditUI && gridVisible ? 'bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-white/10' : ''}`}
      style={
        showEditUI && gridVisible
          ? {
              backgroundImage: `radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '18px 18px, 18px 18px',
              backgroundPosition: '0 0, 9px 9px',
            }
          : undefined
      }
    >
      {showEditUI && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {autoAlign ? 'Auto Align: snap & fill gaps • Drag to reorder' : 'Free arrange • Drag to reorder'}
          </p>
          <span className="text-[11px] px-2 py-1 rounded-full bg-[var(--color-darkGreen)]/10 dark:bg-white/10 text-[var(--color-darkGreen)] dark:text-white/70 border border-[var(--color-darkGreen)]/10">
            {sorted.length} widgets
          </span>
        </div>
      )}

      <div
        ref={gridRef}
        className={`grid grid-cols-12 gap-3 md:gap-3 lg:gap-4 ${showEditUI && autoAlign ? 'grid-auto-flow-dense' : ''}`}
        style={{ gridAutoRows: '220px' }}
        onDragOver={e => {
          if (!showEditUI || !dragId) return;
          e.preventDefault();
          setDragOverGrid(true);
          e.dataTransfer.dropEffect = 'move';
        }}
        onDragLeave={e => {
          if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setDragOverGrid(false);
        }}
        onDrop={e => {
          if (!showEditUI || !dragId) return;
          e.preventDefault();
          setDragOverGrid(false);
          const target = e.target as HTMLElement;
          const isWidget = target.closest('[draggable]');
          if (!isWidget) {
            const ordered = sorted.map(s => s.id).filter(id => id !== dragId);
            ordered.push(dragId);
            onReorder(ordered);
            setDragId(null);
          }
        }}
      >
        {sorted.map(layout => {
          const meta = metaMap.get(layout.id);
          if (!meta) return null;
          const content = renderWidget(layout.id);
          if (!content) return null;
          const isDragged = dragId === layout.id;
          const isOver = dragOverId === layout.id && dragId !== layout.id;
          const isResizing = resizeState?.id === layout.id;
          const rowSpan = layout.rowSpan ?? 2;

          /* ── Compute style: customWidth/customHeight or grid preset ── */
          const hasCustomWidth = layout.customWidth != null;
          const hasCustomHeight = layout.customHeight != null;

          const gridRowStyle = hasCustomHeight
            ? { gridRow: `span ${Math.ceil(layout.customHeight! / 220)} / span ${Math.ceil(layout.customHeight! / 220)}` }
            : { gridRow: `span ${rowSpan} / span ${rowSpan}` };

          // For customWidth: grid span is derived from pixel width so the cell reserves correct space
          // Visual width is the exact pixel value — no gap/overflow
          let colSpanClass: string;
          let widthStyle: React.CSSProperties = {};
          if (hasCustomWidth) {
            const gridW = gridRef.current?.offsetWidth ?? 1200;
            const gap = 16;
            const colW = (gridW - gap * 11) / 12;
            // How many columns are needed to contain customWidth
            const neededSpan = Math.max(1, Math.min(12, Math.ceil((layout.customWidth! + gap) / (colW + gap))));
            // Snap to allowed spans (3/6/9/12) for consistent responsive behavior, but keep visual width exact
            const snappedSpan = [3, 6, 9, 12].reduce((best, cur) =>
              Math.abs(cur - neededSpan) < Math.abs(best - neededSpan) ? cur : best, 12);
            colSpanClass = spanClass(snappedSpan);
            widthStyle = { width: layout.customWidth, maxWidth: '100%' };
          } else {
            colSpanClass = spanClass(layout.colSpan);
          }

          const heightStyle: React.CSSProperties = hasCustomHeight
            ? { minHeight: layout.customHeight }
            : {};

          const combinedStyle: React.CSSProperties = { ...gridRowStyle, ...widthStyle, ...heightStyle } as React.CSSProperties;

          return (
            <div
              key={layout.id}
              data-widget-id={layout.id}
              draggable={showEditUI && !layout.locked && !resizeState}
              onDragStart={e => handleDragStart(e, layout.id)}
              onDragOver={e => handleDragOver(e, layout.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={e => handleDrop(e, layout.id)}
              onDragEnd={handleDragEnd}
              className={`${colSpanClass} relative transition-all duration-200 ${isDragged ? 'opacity-40 scale-[0.98]' : ''} ${isOver ? 'ring-2 ring-[var(--color-darkGreen)]/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''} ${showEditUI ? 'pt-3 overflow-visible' : 'overflow-hidden'} flex flex-col min-h-0 ${isResizing ? 'resize-active' : ''}`}
              style={combinedStyle}
            >
              {isOver && showEditUI && (
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--color-darkGreen)] bg-[var(--color-darkGreen)]/5 pointer-events-none z-10 flex items-center justify-center">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--color-darkGreen)] text-white shadow">Drop here</span>
                </div>
              )}

              <ComponentWrapper
                meta={meta}
                layout={layout}
                editMode={showEditUI}
                onToggleLock={() => onToggleLock(layout.id)}
                onRemove={() => onRemove(layout.id)}
                onChangeSpan={span => onChangeSpan(layout.id, span)}
                onChangeRowSpan={onChangeRowSpan ? span => onChangeRowSpan(layout.id, span) : undefined}
                onChangeCustomWidth={onChangeCustomWidth ? px => onChangeCustomWidth(layout.id, px) : undefined}
                onChangeCustomHeight={onChangeCustomHeight ? px => onChangeCustomHeight(layout.id, px) : undefined}
                onExpand={onExpand ? () => onExpand(layout.id) : undefined}
                onResizeStart={(handle, e) => handleResizeStart(layout.id, handle, e)}
                dragHandleProps={{
                  draggable: showEditUI && !layout.locked,
                  onDragStart: (e: any) => handleDragStart(e, layout.id),
                } as any}
              >
                {content}
              </ComponentWrapper>
            </div>
          );
        })}
        {showEditUI && dragId && draggedLayout && dragOverGrid && (
          <div
            className={`${spanClass(draggedLayout.colSpan)} rounded-2xl border-2 border-dashed flex items-center justify-center p-4`}
            style={{
              gridRow: `span ${(draggedLayout as any).rowSpan ?? 2} / span ${(draggedLayout as any).rowSpan ?? 2}`,
              borderColor: 'var(--color-darkGreen, #047857)',
              background: 'color-mix(in srgb, var(--color-darkGreen, #047857) 6%, transparent)',
              minHeight: `${((draggedLayout as any).rowSpan ?? 2) * 220 + (((draggedLayout as any).rowSpan ?? 2) - 1) * 16}px`,
            }}
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => {
              e.preventDefault();
              setDragOverGrid(false);
              const ordered = sorted.map(s => s.id).filter(id => id !== dragId);
              ordered.push(dragId);
              onReorder(ordered);
              setDragId(null);
            }}
          >
            <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-darkGreen)] text-white shadow">Drop component here</span>
          </div>
        )}
      </div>

      {showEditUI && (
        <div className="mt-3 text-[11px] text-gray-400 dark:text-white/30 text-center">
          Tip: <span className="font-medium text-gray-600 dark:text-gray-300">W: Small/Medium/Large/Full</span> • <span className="font-medium text-gray-600 dark:text-gray-300">H: Short/Medium/Tall/Extra Tall</span> • Drag handles for pixel-perfect resize
        </div>
      )}
    </div>
  );
};

export default WorkspaceGrid;

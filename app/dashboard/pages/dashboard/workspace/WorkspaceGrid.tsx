'use client';

import React, { useState } from 'react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import ComponentWrapper from './ComponentWrapper';

interface Props {
  registry: WidgetMeta[];
  layouts: WidgetLayout[];
  editMode: boolean;
  autoAlign?: boolean;
  onReorder: (orderedIds: string[]) => void;
  onToggleLock: (id: string) => void;
  onHide: (id: string) => void;
  onChangeSpan: (id: string, span: number) => void;
  onChangeRowSpan?: (id: string, span: number) => void;
  onExpand?: (id: string) => void;
  renderWidget: (id: string) => React.ReactNode;
}

const spanClass = (span: number) => {
  const md = span === 12 ? 'md:col-span-12' : span === 9 ? 'md:col-span-12' : 'md:col-span-6';
  const lg = span === 12 ? 'lg:col-span-12' : span === 9 ? 'lg:col-span-9' : span === 6 ? 'lg:col-span-6' : 'lg:col-span-3';
  return `col-span-12 ${md} ${lg}`;
};

const WorkspaceGrid: React.FC<Props> = ({ registry, layouts, editMode, autoAlign = true, onReorder, onToggleLock, onHide, onChangeSpan, onChangeRowSpan, onExpand, renderWidget }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const sorted = [...layouts].filter(l => l.visible).sort((a, b) => a.order - b.order);
  const metaMap = new Map(registry.map(m => [m.id, m]));

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const layout = layouts.find(l => l.id === id);
    if (layout?.locked) { e.preventDefault(); return; }
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // ghost image offset
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

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-10 text-center bg-white/80 dark:bg-white/5">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No components visible</p>
        <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Use “Add Components” to restore widgets. Layout will auto-align to fill gaps.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl transition-colors ${editMode ? 'p-3' : ''} ${editMode ? 'bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-white/10' : ''}`}
      style={
        editMode
          ? {
              backgroundImage: `radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '18px 18px, 18px 18px',
              backgroundPosition: '0 0, 9px 9px',
            }
          : undefined
      }
    >
      {editMode && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {autoAlign ? 'Auto Align: snap & fill gaps • Drag to reorder' : 'Free arrange • Drag to reorder'}
          </p>
          <span className="text-[11px] px-2 py-1 rounded-full bg-[var(--color-darkGreen)]/10 dark:bg-white/10 text-[var(--color-darkGreen)] dark:text-white/70 border border-[var(--color-darkGreen)]/10">
            Studio grid • {sorted.length} widgets
          </span>
        </div>
      )}

      <div
        className={`grid grid-cols-12 gap-3 md:gap-3 lg:gap-4 ${editMode && autoAlign ? 'grid-auto-flow-dense' : ''}`}
        style={{ gridAutoRows: 'minmax(140px, auto)' }}
      >
        {sorted.map(layout => {
          const meta = metaMap.get(layout.id);
          if (!meta) return null;
          const content = renderWidget(layout.id);
          if (!content) return null;
          const isDragged = dragId === layout.id;
          const isOver = dragOverId === layout.id && dragId !== layout.id;
          const rowSpan = (layout as any).rowSpan ?? 2;
          return (
            <div
              key={layout.id}
              draggable={editMode && !layout.locked}
              onDragStart={e => handleDragStart(e, layout.id)}
              onDragOver={e => handleDragOver(e, layout.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={e => handleDrop(e, layout.id)}
              onDragEnd={handleDragEnd}
              className={`${spanClass(layout.colSpan)} relative transition-all duration-200 ${isDragged ? 'opacity-40 scale-[0.98]' : ''} ${isOver ? 'ring-2 ring-[var(--color-darkGreen)]/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''} ${editMode ? 'pt-3' : ''} flex flex-col`}
              style={{ gridRow: `span ${rowSpan} / span ${rowSpan}` }}
            >
              {/* Drop indicator */}
              {isOver && editMode && (
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--color-darkGreen)] bg-[var(--color-darkGreen)]/5 pointer-events-none z-10 flex items-center justify-center">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--color-darkGreen)] text-white shadow">Drop here</span>
                </div>
              )}

              <ComponentWrapper
                meta={meta}
                layout={layout}
                editMode={editMode}
                onToggleLock={() => onToggleLock(layout.id)}
                onHide={() => onHide(layout.id)}
                onChangeSpan={span => onChangeSpan(layout.id, span)}
                onChangeRowSpan={onChangeRowSpan ? span => onChangeRowSpan(layout.id, span) : undefined}
                onExpand={onExpand ? () => onExpand(layout.id) : undefined}
                dragHandleProps={{
                  draggable: editMode && !layout.locked,
                  onDragStart: (e: any) => handleDragStart(e, layout.id),
                } as any}
              >
                {/* Internal scroll: content respects widget height, scrolls if overflow; row height follows tallest widget in row */}
                <div className="h-full flex flex-col min-h-0">
                  <div className="flex-1 min-h-0 overflow-auto overscroll-contain pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {content}
                  </div>
                </div>
              </ComponentWrapper>
            </div>
          );
        })}
      </div>

      {editMode && (
        <div className="mt-3 text-[11px] text-gray-400 dark:text-white/30 text-center">
          Tip: <span className="font-medium text-gray-600 dark:text-gray-300">W: Small/Medium/Large/Full</span> • <span className="font-medium text-gray-600 dark:text-gray-300">H: Short/Medium/Tall/Extra Tall</span> • Tallest widget sets row height • Auto Align fills gaps
        </div>
      )}
    </div>
  );
};

export default WorkspaceGrid;

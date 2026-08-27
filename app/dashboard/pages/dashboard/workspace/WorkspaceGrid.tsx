'use client';

import React, { useState } from 'react';
import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';
import ComponentWrapper from './ComponentWrapper';

interface Props {
  registry: WidgetMeta[];
  layouts: WidgetLayout[];
  editMode: boolean;
  onReorder: (orderedIds: string[]) => void;
  onToggleLock: (id: string) => void;
  onHide: (id: string) => void;
  onChangeSpan: (id: string, span: number) => void;
  renderWidget: (id: string) => React.ReactNode;
}

const spanClass = (span: number) => {
  // mobile 1 col, tablet 2 cols (6), desktop 12 cols
  const md = span === 12 ? 'md:col-span-12' : span === 9 ? 'md:col-span-12' : 'md:col-span-6';
  const lg = span === 12 ? 'lg:col-span-12' : span === 9 ? 'lg:col-span-9' : span === 6 ? 'lg:col-span-6' : 'lg:col-span-3';
  return `col-span-12 ${md} ${lg}`;
};

const WorkspaceGrid: React.FC<Props> = ({ registry, layouts, editMode, onReorder, onToggleLock, onHide, onChangeSpan, renderWidget }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const sorted = [...layouts].filter(l => l.visible).sort((a, b) => a.order - b.order);
  const metaMap = new Map(registry.map(m => [m.id, m]));

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const layout = layouts.find(l => l.id === id);
    if (layout?.locked) { e.preventDefault(); return; }
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || dragId;
    if (!sourceId || sourceId === targetId) return;
    const sourceLayout = layouts.find(l => l.id === sourceId);
    if (sourceLayout?.locked) return;
    const targetLayout = layouts.find(l => l.id === targetId);
    if (targetLayout?.locked) return;
    const ordered = sorted.map(s => s.id);
    const fromIdx = ordered.indexOf(sourceId);
    const toIdx = ordered.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, sourceId);
    onReorder(ordered);
    setDragId(null);
  };

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-10 text-center bg-white/50 dark:bg-white/5">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No components visible</p>
        <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Use “Add Components” to restore widgets.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-fr">
      {sorted.map(layout => {
        const meta = metaMap.get(layout.id);
        if (!meta) return null;
        const content = renderWidget(layout.id);
        if (!content) return null;
        return (
          <div
            key={layout.id}
            draggable={editMode && !layout.locked}
            onDragStart={e => handleDragStart(e, layout.id)}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, layout.id)}
            onDragEnd={() => setDragId(null)}
            className={`${spanClass(layout.colSpan)} ${editMode && dragId === layout.id ? 'opacity-50' : ''} ${editMode ? 'pt-3' : ''}`}
          >
            <ComponentWrapper
              meta={meta}
              layout={layout}
              editMode={editMode}
              onToggleLock={() => onToggleLock(layout.id)}
              onHide={() => onHide(layout.id)}
              onChangeSpan={span => onChangeSpan(layout.id, span)}
              dragHandleProps={{
                draggable: editMode && !layout.locked,
                onDragStart: (e: any) => handleDragStart(e, layout.id),
              } as any}
            >
              {content}
            </ComponentWrapper>
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceGrid;

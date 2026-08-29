import React from 'react';
import { TimelineNode } from '../timelineController';
import { STATUS_STYLE, ICON_MAP } from './constants';

export interface TimelineGroupProps {
  nodes: TimelineNode[];
  pctStart: number;
  pctEnd: number;
  top: number;
  height: number;
  iconSize: number;
  orderId: string;
  isAr: boolean;
  onNodeHover: (node: TimelineNode, element: HTMLElement) => void;
  onNodeLeave: () => void;
  formatDuration: (startMs: number, endMs: number) => string;
  formatDate: (ts: number) => string;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  nodes,
  pctStart,
  pctEnd,
  top,
  height,
  iconSize,
  orderId,
  isAr,
  onNodeHover,
  onNodeLeave,
  formatDuration,
  formatDate,
}) => {
  const width = Math.max(pctEnd - pctStart, 0.5);
  const firstNode = nodes[0];
  const firstStatus = firstNode.status;
  const style = STATUS_STYLE[firstStatus] || STATUS_STYLE.pending;

  // Calculate total duration for relative positioning
  const totalDuration = nodes[nodes.length - 1].timestampMs - nodes[0].timestampMs;

  return (
    <div
      className={`absolute z-10 rounded-full border p-0.5 flex items-center shadow-md transition-all hover:shadow-lg hover:z-[60] ${style.pill}`}
      style={{
        left: `${pctStart}%`,
        width: `${width}%`,
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      {nodes.map((node, idx) => {
        const Ic = ICON_MAP[node.status] || ICON_MAP.pending;
        const nodeStyle = STATUS_STYLE[node.status] || STATUS_STYLE.pending;
        const nextNode = nodes[idx + 1];
        const durStr = nextNode ? formatDuration(node.timestampMs, nextNode.timestampMs) : '';

        // Calculate relative position within group
        const relativePct = totalDuration > 0
          ? ((node.timestampMs - nodes[0].timestampMs) / totalDuration) * 100
          : 0;
        const posPct = Math.max(0, Math.min(100, relativePct));

        return (
          <div
            key={`gn-${idx}`}
            className="relative group/lc cursor-pointer"
            style={{
              position: 'absolute',
              left: `${posPct}%`,
              transform: 'translateX(-50%)',
              top: '50%',
              marginTop: `-${height / 2}px`,
            }}
            onMouseEnter={(e) => onNodeHover(node, e.currentTarget as HTMLElement)}
            onMouseLeave={onNodeLeave}
          >
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition-all hover:scale-125 ${nodeStyle.pill}`}
            >
              <Ic size={iconSize - 1} className={`${nodeStyle.iconColor} ${nodeStyle.anim || ''} shrink-0`} />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/lc:block z-[9999] pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-800 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl border border-gray-700 whitespace-nowrap">
                <div className="font-bold capitalize">{node.status}</div>
                <div className="opacity-70">#{orderId}</div>
                <div className="opacity-70">{formatDate(node.timestampMs)}</div>
                {durStr && <div className="text-emerald-400 mt-0.5">{isAr ? 'المدة:' : 'Duration:'} {durStr}</div>}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
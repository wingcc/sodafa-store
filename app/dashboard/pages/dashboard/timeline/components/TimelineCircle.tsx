import React from 'react';
import { TimelineNode } from '../timelineController';
import { STATUS_STYLE, ICON_MAP } from './constants';

export interface TimelineCircleProps {
  node: TimelineNode;
  pct: number;
  top: number;
  height: number;
  iconSize: number;
  orderId: string;
  isAr: boolean;
  onNodeHover: (node: TimelineNode, element: HTMLElement) => void;
  onNodeLeave: () => void;
  formatDuration: (startMs: number, endMs: number) => string;
  formatDate: (ts: number) => string;
  nextTimestamp?: number;
}

export const TimelineCircle: React.FC<TimelineCircleProps> = ({
  node,
  pct,
  top,
  height,
  iconSize,
  orderId,
  isAr,
  onNodeHover,
  onNodeLeave,
  formatDuration,
  formatDate,
  nextTimestamp,
}) => {
  const style = STATUS_STYLE[node.status] || STATUS_STYLE.pending;
  const Ic = ICON_MAP[node.status] || ICON_MAP.pending;
  const durStr = nextTimestamp ? formatDuration(node.timestampMs, nextTimestamp) : '';
  
  return (
    <React.Fragment key={`lc-${node.status}`}>
      <div
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onNodeHover(node, e.currentTarget as HTMLElement);
        }}
        onMouseLeave={onNodeLeave}
        style={{ 
          left: `${pct}%`, 
          transform: 'translateX(-50%)', 
          top: `${top}px` 
        }}
        className={`absolute z-10 h-8 w-8 rounded-full border flex items-center justify-center shadow-md cursor-pointer group/lc transition-all hover:scale-125 hover:shadow-lg hover:z-[60] whitespace-nowrap ${style.pill}`}
      >
        <Ic size={iconSize} className={`${style.iconColor} ${style.anim} shrink-0`} />
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
    </React.Fragment>
  );
};
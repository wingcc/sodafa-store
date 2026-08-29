import React from 'react';
import { TimelineNode } from '../timelineController';
import { STATUS_STYLE, ICON_MAP } from './constants';

export interface TimelineMergedProps {
  nodes: TimelineNode[];
  currentStatus: string;
  pct: number;
  top: number;
  iconSize: number;
  orderId: string;
  isAr: boolean;
  onNodeHover: (node: TimelineNode, element: HTMLElement) => void;
  onNodeLeave: () => void;
  formatDuration: (startMs: number, endMs: number) => string;
  formatDate: (ts: number) => string;
  eventTimestamp: number;
  onClick: () => void;
}

export const TimelineMerged: React.FC<TimelineMergedProps> = ({
  nodes,
  currentStatus,
  pct,
  top,
  iconSize,
  orderId,
  isAr,
  onNodeHover,
  onNodeLeave,
  formatDuration,
  formatDate,
  eventTimestamp,
  onClick,
}) => {
  const currentStyle = STATUS_STYLE[currentStatus] || STATUS_STYLE.pending;
  const currentIc = ICON_MAP[currentStatus] || ICON_MAP.pending;

  // Filter historical nodes (exclude current status)
  const historicalNodes = nodes.filter(n => n.status !== currentStatus);

  return (
    <React.Fragment key={`merged`}>
      {/* Historical nodes in same column */}
      <div
        style={{ 
          left: `${pct}%`, 
          transform: 'translateX(-50%)', 
          top: `${top}px` 
        }}
        className="absolute z-10 flex items-center gap-1"
      >
        {historicalNodes.map((node, ni) => {
          const Ic = ICON_MAP[node.status] || ICON_MAP.pending;
          const sc = STATUS_STYLE[node.status] || STATUS_STYLE.pending;
          return (
            <div key={`m-${ni}`} className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-md ${sc.pill}`}>
              <Ic size={iconSize} className={`${sc.iconColor} ${sc.anim} shrink-0`} />
            </div>
          );
        })}
      </div>

      {/* Current status pill - clickable */}
      <div
        onClick={onClick}
        onMouseEnter={(e) => {
          const ts = eventTimestamp;
          const timeStr = new Date(ts).toLocaleTimeString(isAr ? 'ar-MA' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
          onNodeHover({ status: currentStatus as any, timestampMs: ts, timeStr }, e.currentTarget as HTMLElement);
        }}
        onMouseLeave={onNodeLeave}
        style={{ 
          left: `${pct}%`, 
          transform: 'translateX(-50%)', 
          top: '4px' 
        }}
        className={`absolute z-10 h-6 rounded-full border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1 pl-1 pr-2 whitespace-nowrap ${currentStyle.pill} backdrop-blur-sm`}
      >
        <span className="flex items-center -space-x-1">
          {historicalNodes.slice(0, 2).map((node, idx) => {
            const Ic = ICON_MAP[node.status] || ICON_MAP.pending;
            const sc = STATUS_STYLE[node.status] || STATUS_STYLE.pending;
            return (
              <span key={idx} className={`w-4 h-4 rounded-full border flex items-center justify-center ${sc.pill}`}>
                <Ic size={8} className={sc.iconColor} />
              </span>
            );
          })}
        </span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${currentStatus==='pending'?'bg-amber-100 dark:bg-amber-900/40 text-amber-600':currentStatus==='confirmed'?'bg-blue-100 dark:bg-blue-900/40 text-blue-600':currentStatus==='processing'?'bg-violet-100 dark:bg-violet-900/40 text-violet-600':'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>
          {currentStatus === 'pending' && <Clock size={10} className="animate-pulse" />}
          {currentStatus === 'confirmed' && <CheckCircle2 size={10} />}
          {currentStatus === 'processing' && <RefreshCw size={10} className="animate-spin" />}
          {currentStatus === 'cancelled' && <XCircle size={10} />}
        </span>
        <span className="font-bold text-[10px] tracking-wide text-gray-900 dark:text-white">#{orderId}</span>
      </div>
    </React.Fragment>
  );
};

// Need to import Clock, CheckCircle2, RefreshCw, XCircle for the icons
import { Clock, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
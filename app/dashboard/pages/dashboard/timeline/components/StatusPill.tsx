import React from 'react';
import { Clock, CheckCircle2, RefreshCw, XCircle, Truck } from 'lucide-react';
import { STATUS_STYLE } from './constants';

export interface StatusPillProps {
  status: string;
  orderId: string;
  leftPercent: number;
  top: number;
  height: string; // CSS height class like 'h-8', 'h-7', 'h-6'
  isAr: boolean;
  eventTimeStr: string;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  className?: string;
  showEventTime?: boolean;
}

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: XCircle,
};

const STATUS_ICON_CLASSES: Record<string, string> = {
  pending: 'text-amber-500 animate-pulse',
  confirmed: 'text-blue-500',
  processing: 'text-violet-500 animate-spin',
  shipped: 'text-emerald-500',
  delivered: 'text-gray-400',
  cancelled: 'text-red-500',
  refunded: 'text-gray-400',
};

const STATUS_DOT_CLASSES: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-violet-500',
  shipped: 'bg-emerald-500',
  delivered: 'bg-gray-400',
  cancelled: 'bg-red-500',
  refunded: 'bg-gray-400',
};

const STATUS_BG_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600',
  confirmed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',
  processing: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600',
  shipped: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600',
  delivered: 'bg-gray-100 dark:bg-gray-900/40 text-gray-600',
  cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-600',
  refunded: 'bg-gray-100 dark:bg-gray-900/40 text-gray-600',
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  orderId,
  leftPercent,
  top,
  height,
  isAr,
  eventTimeStr,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  showEventTime = true,
}) => {
  const style = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const Icon = STATUS_ICONS[status] || Clock;
  const iconClass = STATUS_ICON_CLASSES[status] || STATUS_ICON_CLASSES.pending;
  const dotClass = STATUS_DOT_CLASSES[status] || STATUS_DOT_CLASSES.pending;
  const bgClass = STATUS_BG_CLASSES[status] || STATUS_BG_CLASSES.pending;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)', top: `${top}px` }}
      className={`absolute z-10 ${height} rounded-full border px-3 flex items-center gap-1.5 text-xs font-extrabold shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap ${style.pill} ${className}`}
    >
      <Icon size={13} className={`${iconClass} shrink-0`} />
      <span className="font-bold text-[11px]">#{orderId}</span>
      {showEventTime && (
        <span className="text-[10px] opacity-60 font-semibold">({eventTimeStr})</span>
      )}
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse shadow-sm`} />
    </div>
  );
};
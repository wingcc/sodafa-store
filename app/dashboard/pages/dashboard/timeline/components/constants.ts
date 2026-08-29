import { Clock, CheckCircle2, RefreshCw, Truck, XCircle } from 'lucide-react';

/**
 * Status styling configuration
 * Centralized to ensure consistent appearance across all timeline components
 */
export const STATUS_STYLE: Record<string, {
  bg: string;
  border: string;
  iconColor: string;
  pill: string;
  anim: string;
}> = {
  pending:    { bg: 'bg-amber-50 dark:bg-amber-950/80',  border: 'border-amber-300 dark:border-amber-600',  iconColor: 'text-amber-500',  pill: 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500 text-amber-700 dark:text-amber-200', anim: 'animate-pulse' },
  confirmed:  { bg: 'bg-blue-50 dark:bg-blue-950/80',    border: 'border-blue-300 dark:border-blue-600',    iconColor: 'text-blue-500',    pill: 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-200', anim: '' },
  processing: { bg: 'bg-violet-50 dark:bg-violet-950/80', border: 'border-violet-300 dark:border-violet-600', iconColor: 'text-violet-500', pill: 'bg-violet-50 dark:bg-violet-950/80 border-violet-300 dark:border-violet-500 text-violet-700 dark:text-violet-200', anim: 'animate-spin' },
  shipped:    { bg: 'bg-emerald-50 dark:bg-emerald-950/80', border: 'border-emerald-300 dark:border-emerald-600', iconColor: 'text-emerald-500', pill: '', anim: '' },
  delivered:  { bg: 'bg-gray-100 dark:bg-gray-800/60',   border: 'border-gray-300 dark:border-gray-600',    iconColor: 'text-gray-400',    pill: 'bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 grayscale-[30%]', anim: '' },
  cancelled:  { bg: 'bg-red-50 dark:bg-red-950/80',      border: 'border-red-300 dark:border-red-600',      iconColor: 'text-red-500',     pill: 'bg-gray-100 dark:bg-red-950/60 border-gray-300 dark:border-red-700 text-gray-500 dark:text-red-300 line-through opacity-60', anim: '' },
  refunded:   { bg: 'bg-gray-100 dark:bg-gray-800/60',   border: 'border-gray-300 dark:border-gray-600',    iconColor: 'text-gray-400',    pill: 'bg-gray-100 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400', anim: '' },
};

/**
 * Icon mapping for each status
 */
export const ICON_MAP: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: XCircle,
};

/**
 * Density configuration for responsive row sizing
 */
export const DENSITY_CONFIG = {
  comfortable: {
    nodeH: 32,
    nodeIconSize: 14,
    rowHNonShipped: 'h-[46px]',
    rowHShipped: 'h-[50px]',
    slaBarH: 'h-8',
  },
  compact: {
    nodeH: 28,
    nodeIconSize: 12,
    rowHNonShipped: 'h-[38px]',
    rowHShipped: 'h-[42px]',
    slaBarH: 'h-7',
  },
  dense: {
    nodeH: 24,
    nodeIconSize: 10,
    rowHNonShipped: 'h-[32px]',
    rowHShipped: 'h-[32px]',
    slaBarH: 'h-6',
  },
} as const;

export type DensityKey = keyof typeof DENSITY_CONFIG;
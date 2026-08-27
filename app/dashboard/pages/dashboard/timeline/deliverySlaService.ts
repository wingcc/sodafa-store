import type { Order, OrderStatus } from '../../../types';

export interface SlaInfo {
  status: OrderStatus;
  deliveryMethod: string;
  shippedAt: number | null;
  deadline: number | null;
  remainingMs: number;
  remainingFormatted: string;
  slaPercent: number; // 0 to 100% remaining
  state: 'normal' | 'warning' | 'critical' | 'overdue' | 'delivered' | 'none';
  deliveredDurationFormatted?: string;
  deliveredEarlyFormatted?: string;
  deliveredLateFormatted?: string;
}

export const SLA_DURATIONS_MS: Record<string, number> = {
  'express': 24 * 3600 * 1000, // 24 hours
  'express (24h)': 24 * 3600 * 1000,
  'speed': 24 * 3600 * 1000, // 24 hours
  'speed (1 day)': 24 * 3600 * 1000,
  'standard': 48 * 3600 * 1000, // 48 hours
  'standard (2 days)': 48 * 3600 * 1000,
  'regional': 72 * 3600 * 1000, // 72 hours
  'regional (3 days)': 72 * 3600 * 1000,
};

export function getSlaDurationMs(deliveryMethod?: string): number {
  if (!deliveryMethod) return 24 * 3600 * 1000;
  const key = deliveryMethod.toLowerCase().trim();
  for (const [k, duration] of Object.entries(SLA_DURATIONS_MS)) {
    if (key.includes(k)) return duration;
  }
  return 24 * 3600 * 1000;
}

export function getShippedTimestamp(order: any): number {
  if (order.shippedAt) return new Date(order.shippedAt).getTime();
  if (order.updatedAt && order.orderStatus === 'shipped') return new Date(order.updatedAt).getTime();
  const created = new Date(order.createdAt || Date.now()).getTime();
  return created;
}

export function getOrderTimestampForStatus(order: any): number {
  const st = order.orderStatus;
  if (st === 'shipped' && order.shippedAt) return new Date(order.shippedAt).getTime();
  if (st === 'delivered' && order.deliveredAt) return new Date(order.deliveredAt).getTime();
  if (st === 'confirmed' && order.confirmedAt) return new Date(order.confirmedAt).getTime();
  if (st === 'processing' && order.processingStartedAt) return new Date(order.processingStartedAt).getTime();
  if (st === 'cancelled' && order.cancelledAt) return new Date(order.cancelledAt).getTime();

  return new Date(order.createdAt || Date.now()).getTime();
}

export function calcPercentFromTimestamp(ts: number, viewportStart: number, viewportDuration: number): number {
  if (viewportDuration <= 0) return 0;
  return Math.max(0, Math.min(100, ((ts - viewportStart) / viewportDuration) * 100));
}

export function formatDurationMs(ms: number, isAr: boolean = false): string {
  const isNegative = ms < 0;
  const absMs = Math.abs(ms);
  const totalMinutes = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  let str = '';
  if (days > 0) {
    str = isAr ? `${days} يوم ${remHours} س` : `${days}d ${remHours}h`;
  } else if (hours > 0) {
    str = isAr ? `${hours} س ${mins} د` : `${hours}h ${mins}m`;
  } else {
    str = isAr ? `${mins} دقيقة` : `${mins}m`;
  }

  return isNegative ? (isAr ? `تأخير -${str}` : `-${str}`) : str;
}

export function calculateOrderSla(order: Order, now: Date = new Date(), isAr: boolean = false): SlaInfo {
  const status = order.orderStatus;
  const deliveryMethod = (order as any).shippingProvider || (order as any).deliveryMethod || 'Standard (2 Days)';
  const slaDurationMs = getSlaDurationMs(deliveryMethod);

  if (status !== 'shipped' && status !== 'delivered') {
    return {
      status,
      deliveryMethod,
      shippedAt: null,
      deadline: null,
      remainingMs: 0,
      remainingFormatted: '--',
      slaPercent: 100,
      state: status === 'delivered' ? 'delivered' : 'none',
    };
  }

  const shippedAt = getShippedTimestamp(order);
  const deadline = shippedAt + slaDurationMs;

  if (status === 'delivered') {
    const deliveredAt = (order as any).deliveredAt ? new Date((order as any).deliveredAt).getTime() : deadline - 2 * 3600 * 1000;
    const actualDuration = deliveredAt - shippedAt;
    const diff = slaDurationMs - actualDuration;
    const isEarly = diff >= 0;

    return {
      status,
      deliveryMethod,
      shippedAt,
      deadline,
      remainingMs: 0,
      remainingFormatted: isAr ? 'تم التسليم' : 'Delivered',
      slaPercent: 0,
      state: 'delivered',
      deliveredDurationFormatted: formatDurationMs(actualDuration, isAr),
      deliveredEarlyFormatted: isEarly ? formatDurationMs(diff, isAr) : undefined,
      deliveredLateFormatted: !isEarly ? formatDurationMs(Math.abs(diff), isAr) : undefined,
    };
  }

  // Active Shipping Countdown
  const remainingMs = deadline - now.getTime();
  const slaPercent = Math.max(0, Math.min(100, (remainingMs / slaDurationMs) * 100));

  let state: SlaInfo['state'] = 'normal';
  if (remainingMs <= 0) {
    state = 'overdue';
  } else if (slaPercent <= 10) {
    state = 'critical';
  } else if (slaPercent <= 15) {
    state = 'warning';
  }

  return {
    status,
    deliveryMethod,
    shippedAt,
    deadline,
    remainingMs,
    remainingFormatted: formatDurationMs(remainingMs, isAr),
    slaPercent,
    state,
  };
}

// Enforce valid lifecycle transitions
export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (current === 'delivered' || current === 'cancelled' || current === 'refunded') {
    return false; // Terminal states
  }

  const validMap: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    refunded: [],
  };

  return (validMap[current] || []).includes(next);
}

// Track fired SLA threshold notifications to prevent duplicates
const firedEventsKey = 'sodafa_fired_sla_events_v1';

function getFiredEvents(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(firedEventsKey);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFiredEvents(set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(firedEventsKey, JSON.stringify(Array.from(set)));
  } catch {}
}

export function checkAndTriggerSlaNotifications(
  orders: Order[],
  now: Date = new Date(),
  notifyFn?: (event: { type: 'warning' | 'critical' | 'overdue'; order: Order; slaInfo: SlaInfo }) => void
) {
  const fired = getFiredEvents();
  let changed = false;

  for (const order of orders) {
    if (order.orderStatus !== 'shipped') continue;
    const sla = calculateOrderSla(order, now);

    if (sla.state === 'warning' || sla.state === 'critical' || sla.state === 'overdue') {
      const eventId = `${order.id}_${sla.state}`;
      if (!fired.has(eventId)) {
        fired.add(eventId);
        changed = true;
        if (notifyFn) {
          notifyFn({ type: sla.state as any, order, slaInfo: sla });
        }
      }
    }
  }

  if (changed) {
    saveFiredEvents(fired);
  }
}

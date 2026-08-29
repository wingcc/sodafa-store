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

function getTimelineTimestampForStatus(order: any, status: string): number | null {
  const tl = Array.isArray((order as any).timeline) ? (order as any).timeline : Array.isArray((order as any).order_timeline) ? (order as any).order_timeline : null;
  if (tl && tl.length) {
    const matches = (tl as any[]).filter((e: any) => e.status === status);
    if (matches.length) {
      // Use latest timestamp for that status (in case of multiple)
      const sorted = matches
        .map((e: any) => new Date(e.timestamp ?? e.created_at ?? e.time).getTime())
        .filter((t: number) => !Number.isNaN(t))
        .sort((a: number, b: number) => b - a);
      if (sorted.length) return sorted[0];
    }
  }
  return null;
}

export function getShippedTimestamp(order: any): number {
  const fromTimeline = getTimelineTimestampForStatus(order, 'shipped');
  if (fromTimeline !== null) return fromTimeline;
  if (order.shippedAt) {
    const t = new Date(order.shippedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if ((order as any).shipped_at) {
    const t = new Date((order as any).shipped_at).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (order.updatedAt && order.orderStatus === 'shipped') {
    const t = new Date(order.updatedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  const created = new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  return Number.isNaN(created) ? Date.now() : created;
}

export function getOrderTimestampForStatus(order: any): number {
  const st = order.orderStatus;
  const safe = (v: any) => {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? null : t;
  };
  // First, try timeline (source of truth) — ensures pending/processing respect actual time
  const tlTs = getTimelineTimestampForStatus(order, st);
  if (tlTs !== null) return tlTs;

  // Explicit handling for pending - always use createdAt
  if (st === 'pending') {
    return safe(order.createdAt ?? order.created_at) ?? Date.now();
  }

  if (st === 'shipped' && order.shippedAt) return safe(order.shippedAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'shipped' && (order as any).shipped_at) return safe((order as any).shipped_at) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'delivered' && order.deliveredAt) return safe(order.deliveredAt) ?? safe(order.shippedAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'delivered' && (order as any).delivered_at) return safe((order as any).delivered_at) ?? safe((order as any).shipped_at) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'delivered' && order.shippedAt) return safe(order.shippedAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'confirmed' && order.confirmedAt) return safe(order.confirmedAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'confirmed' && (order as any).confirmed_at) return safe((order as any).confirmed_at) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'processing' && order.processingStartedAt) return safe(order.processingStartedAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'processing' && (order as any).processing_started_at) return safe((order as any).processing_started_at) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'cancelled' && order.cancelledAt) return safe(order.cancelledAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'cancelled' && (order as any).cancelled_at) return safe((order as any).cancelled_at) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'refunded' && (order as any).refundedAt) return safe((order as any).refundedAt) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  if (st === 'refunded' && (order as any).refunded_at) return safe((order as any).refunded_at) ?? new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
  return new Date(order.createdAt || (order as any).created_at || Date.now()).getTime();
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
    if (remHours > 0 || mins > 0) {
      str = isAr ? `${days} يوم ${remHours} س ${mins} د` : `${days}d ${remHours}h ${mins}m`;
    } else {
      str = isAr ? `${days} يوم` : `${days}d`;
    }
  } else if (hours > 0) {
    str = isAr ? `${hours} س ${mins} د` : `${hours}h ${mins}m`;
  } else {
    str = isAr ? `${mins} دقيقة` : `${mins}m`;
  }

  return isNegative ? (isAr ? `تأخير ${str}` : `-${str}`) : str;
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
      state: 'none',
    };
  }

  const shippedAt = getShippedTimestamp(order);
  const deadline = shippedAt + slaDurationMs;

  if (status === 'delivered') {
    const rawDelivered = (order as any).deliveredAt || (order as any).updatedAt || order.updatedAt;
    let deliveredAt = rawDelivered ? new Date(rawDelivered).getTime() : NaN;
    if (Number.isNaN(deliveredAt)) deliveredAt = Date.now();
    if (deliveredAt < shippedAt) deliveredAt = shippedAt;
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

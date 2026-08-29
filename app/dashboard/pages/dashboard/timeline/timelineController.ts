'use client';

import type { Order, OrderStatus } from '../../../types';
import { getOrderTimestampForStatus, calcPercentFromTimestamp } from './deliverySlaService';

export const GROUP_THRESHOLD_MS = 4 * 3600 * 1000; // 4 ساعات
export const MERGE_THRESHOLD_MS = 4 * 3600 * 1000; // للدمج مع الحالة الحالية (لم نعد نستخدمه في النسخة الجديدة)

const LIFECYCLE_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export type TimelineNode = { status: OrderStatus; timestampMs: number; timeStr: string };

export type TimelineElement =
  | { type: 'circle'; pct: number; endPct: number; node: TimelineNode }
  | { type: 'group'; pct: number; endPct: number; nodes: TimelineNode[] }
  | { type: 'merged'; pct: number; endPct: number; nodes: TimelineNode[]; currentStatus: OrderStatus };

export interface TimelineBuildResult {
  elements: TimelineElement[];
  connectors: { from: number; to: number }[];
  merged: boolean;
}

// ── المساعدات ──
function parseTs(v: any): number | null {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

function toTimeStr(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── 1) تطبيع التاريخ – ترتيب زمني، إزالة المكررات، ضمان وجود Pending ──
export function normalizeHistory(order: any): TimelineNode[] {
  const add = (status: OrderStatus, ts: any, out: TimelineNode[]) => {
    const t = parseTs(ts);
    if (t === null) return;
    // إزالة المكرر لنفس الحالة خلال 60 ثانية
    if (out.find(o => o.status === status && Math.abs(o.timestampMs - t) < 60000)) return;
    out.push({ status, timestampMs: t, timeStr: toTimeStr(t) });
  };

  const nodes: TimelineNode[] = [];

  // المصدر الأساسي: الجدول الزمني
  const rawTimeline = Array.isArray((order as any).timeline) ? (order as any).timeline : Array.isArray((order as any).order_timeline) ? (order as any).order_timeline : null;
  if (rawTimeline && rawTimeline.length) {
    for (const ev of rawTimeline) {
      const st = ev.status as OrderStatus;
      const raw = ev.timestamp ?? ev.created_at ?? ev.time ?? null;
      add(st, raw, nodes);
    }
  }

  // الحقول الاحتياطية
  add('pending', order.createdAt ?? order.created_at, nodes);
  add('confirmed', order.confirmedAt ?? order.confirmed_at, nodes);
  add('processing', order.processingStartedAt ?? order.processing_started_at ?? order.processingAt, nodes);
  add('shipped', order.shippedAt ?? order.shipped_at, nodes);
  add('delivered', order.deliveredAt ?? order.delivered_at, nodes);
  add('cancelled', order.cancelledAt ?? order.cancelled_at, nodes);
  add('refunded', (order as any).refundedAt ?? (order as any).refunded_at, nodes);

  // ضمان وجود الحالة الحالية
  const cur = order.orderStatus as OrderStatus;
  if (cur && !nodes.find(n => n.status === cur)) {
    const fallbackMs = getOrderTimestampForStatus(order);
    if (!Number.isNaN(fallbackMs)) {
      add(cur, new Date(fallbackMs).toISOString(), nodes);
    }
  }

  // الترتيب الزمني الصارم
  nodes.sort((a, b) => {
    if (a.timestampMs !== b.timestampMs) return a.timestampMs - b.timestampMs;
    return LIFECYCLE_ORDER.indexOf(a.status) - LIFECYCLE_ORDER.indexOf(b.status);
  });

  // تصفية الحالات التي تأتي بعد الحالة الحالية في دورة الحياة (لا نعرض المستقبل)
  const curIdx = LIFECYCLE_ORDER.indexOf(cur);
  if (curIdx !== -1) {
    const allowed = new Set(LIFECYCLE_ORDER.slice(0, curIdx + 1));
    allowed.add(cur);
    const filtered = nodes.filter(n => allowed.has(n.status));
    if (filtered.length) return filtered;
  }

  return nodes;
}

// ── 2) بناء التايملاين الدقيق مع الخط الموصل الثابت ──
export function buildAccurateTimeline(
  lifecycleHistory: TimelineNode[],
  currentStatus: string,
  viewportStartMs: number,
  viewportDurationMs: number,
  _zoomLevel: number,
  currentTimestamp: number,
): TimelineBuildResult {
  const calcPct = (ts: number) => calcPercentFromTimestamp(ts, viewportStartMs, viewportDurationMs);

  // الحالات التاريخية (جميعها ما عدا الحالة الحالية)
  const historical = lifecycleHistory
    .filter(n => n.status !== currentStatus)
    .sort((a, b) => a.timestampMs - b.timestampMs);

  // إذا لم تكن هناك حالات تاريخية، نعيد مصفوفة فارغة
  if (historical.length === 0) {
    return { elements: [], connectors: [], merged: false };
  }

  // ── تجميع الحالات التاريخية حسب الفجوة الزمنية ──
  const clusters: TimelineNode[][] = [];
  let curCluster: TimelineNode[] = [historical[0]];
  for (let i = 1; i < historical.length; i++) {
    const gap = historical[i].timestampMs - historical[i - 1].timestampMs;
    if (gap < GROUP_THRESHOLD_MS) {
      curCluster.push(historical[i]);
    } else {
      clusters.push(curCluster);
      curCluster = [historical[i]];
    }
  }
  clusters.push(curCluster);

  // ── تحويل المجموعات إلى عناصر (circle أو group) ──
  const elements: TimelineElement[] = clusters.map(cluster => {
    const pct = calcPct(cluster[0].timestampMs);
    const endPct = calcPct(cluster[cluster.length - 1].timestampMs);
    if (cluster.length === 1) {
      return { type: 'circle', pct, endPct, node: cluster[0] };
    } else {
      return { type: 'group', pct, endPct, nodes: cluster };
    }
  });

  // ترتيب العناصر حسب الموضع (زمنياً)
  elements.sort((a, b) => a.pct - b.pct);

  // ── بناء الموصل الواحد من البداية إلى النهاية ──
  const connectors: { from: number; to: number }[] = [];

  // الحالة الأولى هي Pending أو أول عقدة في التاريخ
  const firstNode = lifecycleHistory.find(n => n.status === 'pending') || lifecycleHistory[0];
  const firstPct = calcPct(firstNode.timestampMs);
  const lastPct = calcPct(currentTimestamp);

  // إذا كان هناك أكثر من حالة (أي على الأقل حالتان مختلفتان)
  if (lifecycleHistory.length >= 2) {
    // نضيف موصل واحد من البداية إلى النهاية
    connectors.push({ from: firstPct, to: lastPct });
  }

  // ملاحظة: لم نعد نستخدم MERGE_THRESHOLD لأننا نفضل إظهار جميع الحالات التاريخية
  // كعناصر مستقلة أو مجموعات، والخط يبقى مستمراً من البداية إلى النهاية.

  return { elements, connectors, merged: false };
}

// ── 3) المتحكم الزمني الكامل (اختياري للاستخدام في حالات أخرى) ──
export function processOrderTimeline(
  order: any,
  viewportStartMs: number,
  viewportDurationMs: number,
  zoomLevel: number,
  now: Date,
) {
  const history = normalizeHistory(order);
  const currentStatus = order.orderStatus as string;
  const currentTs = getOrderTimestampForStatus(order);

  const { elements, connectors, merged } = buildAccurateTimeline(
    history,
    currentStatus,
    viewportStartMs,
    viewportDurationMs,
    zoomLevel,
    currentTs,
  );

  return { history, elements, connectors, merged, currentPct: calcPercentFromTimestamp(currentTs, viewportStartMs, viewportDurationMs) };
}

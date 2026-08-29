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

// ── 1) تطبيع التاريخ – ترتيب زمني، إزالة التكرارات المتطابقة فقط ──
export function normalizeHistory(order: any): TimelineNode[] {
  // BUGFIX (grouping): 
  // كان الكود السابق يحتفظ فقط بأحدث طابع زمني لكل حالة، مما يتسبب في فقدان الأحداث
  // المتكررة لنفس الحالة (مثل confirmed مرتين في أوقات مختلفة). هذا يؤدي إلى عدم
  // تجميع الأحداث المتقاربة بشكل صحيح.
  // الآن نحتفظ بجميع الأحداث المميزة (حسب الوقت)، مع إزالة التكرارات المتطابقة فقط.
  const add = (status: OrderStatus, ts: any, out: TimelineNode[]) => {
    const t = parseTs(ts);
    if (t === null) return;
    // نزيل التكرارات المتطابقة فقط (نفس الحالة ونفس الطابع الزمني)
    const exists = out.some(o => o.status === status && Math.abs(o.timestampMs - t) < 500);
    if (!exists) {
      out.push({ status, timestampMs: t, timeStr: toTimeStr(t) });
    }
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

  // ضمان وجود الحالة الحالية (حتى لو لم تكن في الـ timeline أو الحقول الاحتياطية)
  const cur = order.orderStatus as OrderStatus;
  if (cur && !nodes.find(n => n.status === cur)) {
    const fallbackMs = getOrderTimestampForStatus(order);
    if (!Number.isNaN(fallbackMs)) {
      add(cur, new Date(fallbackMs).toISOString(), nodes);
    }
  }

  // ضمان وجود Pending (إذا لم يكن موجوداً من المصدر أو الحقول)
  if (!nodes.find(n => n.status === 'pending')) {
    const created = order.createdAt ?? order.created_at;
    if (created) {
      add('pending', created, nodes);
    }
  }

  // حل أخير: إذا لم يكن هناك أي عقدة بعد كل ما سبق (حالة نادرة جداً)،
  // نضيف pending والحالية بالوقت الحالي لتجنب انقطاع الخط
  if (nodes.length === 0) {
    const now = Date.now();
    add('pending', new Date(now).toISOString(), nodes);
    if (cur) {
      add(cur, new Date(now).toISOString(), nodes);
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

  // BUGFIX (real-time state transitions): this used to require >= 2 historical
  // states before drawing any connector at all. Right after a live status change
  // (e.g. pending -> confirmed), the order only has ONE historical state yet —
  // the line from that single circle to the current status pill was silently
  // skipped, making the connection look "broken" exactly when a state updates.
  // We already bail out earlier (`historical.length === 0`) when there is
  // nothing at all to connect, so here >= 1 is the correct, sufficient check.
  if (historical.length >= 1) {
    connectors.push({ from: firstPct, to: lastPct });
  }

  // ملاحظة: لم نعد نستخدم MERGE_THRESHOLD لأننا نفضل إظهار جميع الحالات التاريخية
  // كعناصر مستقلة أو مجموعات، والخط يبقى مستمراً من البداية إلى النهاية.

  return { elements, connectors, merged: false };
}

// ── 3) أدوات محرر التايم لاين الاحترافي (Timeline Editor Toolkit) ──
// هذه دوال مساعدة خالصة (pure) تُستخدم لبناء أدوات محرر احترافية فوق نفس
// مصدر الحقيقة الزمني (normalizeHistory / getOrderTimestampForStatus)، بدون
// تكرار منطق حساب الزمن في كل مكون.

export interface ViewportBounds { startMs: number; endMs: number }

// هل الطابع الزمني داخل نافذة العرض الحالية؟ يُستخدم لتفادي "تثبيت" العناصر
// على حافة الشريط (0% أو 100%) بشكل مضلل عندما تكون خارج الفترة المعروضة فعليًا.
export function isTimestampInViewport(ts: number, viewportStartMs: number, viewportEndMs: number): boolean {
  return ts >= viewportStartMs && ts <= viewportEndMs;
}

// "Fit to Data" / "Zoom to Fit": يحسب أقدم وأحدث حدث فعلي عبر مجموعة طلبات،
// لبناء نافذة عرض تحتوي كل الأحداث (مع هامش أمان بالأيام). يُستخدم من زر
// "ملاءمة تلقائية" في شريط أدوات التايم لاين بدل التنقل اليدوي يوماً بيوم.
export function computeFitViewport(orders: any[], opts?: { paddingDays?: number }): ViewportBounds | null {
  let min = Infinity;
  let max = -Infinity;
  for (const order of orders) {
    const history = normalizeHistory(order);
    for (const node of history) {
      if (node.timestampMs < min) min = node.timestampMs;
      if (node.timestampMs > max) max = node.timestampMs;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const paddingMs = (opts?.paddingDays ?? 1) * 24 * 3600 * 1000;
  return { startMs: min - paddingMs, endMs: max + paddingMs };
}

// يرجّح نقطة مركز واحدة (متوسط الزمن) لضبط centerDate عند "الملاءمة التلقائية"
// حين تبقى نافذة العرض بعرض ثابت (مثلاً 7 أيام) ولا يمكن توسيعها لتغطية كل شيء.
export function computeFitCenterMs(orders: any[]): number | null {
  const bounds = computeFitViewport(orders, { paddingDays: 0 });
  if (!bounds) return null;
  return Math.round((bounds.startMs + bounds.endMs) / 2);
}

// يحسب عدد الطلبات "خارج نافذة العرض" الحالية (قبلها/بعدها) وأقرب طابع زمني
// في كل اتجاه — يغذّي شارات "⏪ N أقدم" / "N أحدث ⏩" القابلة للنقر للقفز إليها
// بدل ترك العناصر مثبّتة بشكل خاطئ عند حافة الشريط.
export function getOffViewportSummary(
  items: { eventTimestamp: number }[],
  viewportStartMs: number,
  viewportEndMs: number,
): { beforeCount: number; afterCount: number; nearestBeforeMs: number | null; nearestAfterMs: number | null } {
  let beforeCount = 0;
  let afterCount = 0;
  let nearestBeforeMs: number | null = null;
  let nearestAfterMs: number | null = null;

  for (const item of items) {
    const ts = item.eventTimestamp;
    if (ts < viewportStartMs) {
      beforeCount++;
      if (nearestBeforeMs === null || ts > nearestBeforeMs) nearestBeforeMs = ts;
    } else if (ts > viewportEndMs) {
      afterCount++;
      if (nearestAfterMs === null || ts < nearestAfterMs) nearestAfterMs = ts;
    }
  }

  return { beforeCount, afterCount, nearestBeforeMs, nearestAfterMs };
}

// يُقرّب طابعاً زمنياً لأقرب "خانة" شبكية (بالدقائق) — أداة قياسية في محررات
// التايم لاين الاحترافية (Snap to Grid) لأي تعديل يدوي مستقبلي لموعد حدث.
export function snapToGrid(ts: number, gridMinutes: number = 15): number {
  const gridMs = gridMinutes * 60 * 1000;
  return Math.round(ts / gridMs) * gridMs;
}

// يتحقق أن نقل حدث إلى طابع زمني جديد لا يكسر ترتيب دورة الحياة الزمني
// (مثلاً منع جعل "shipped" أقدم من "confirmed" عند تعديل يدوي في المحرر).
export function validateEventMove(
  history: TimelineNode[],
  status: OrderStatus,
  newTimestampMs: number,
): { valid: boolean; reason?: string } {
  const idx = LIFECYCLE_ORDER.indexOf(status);
  const prevStatus = LIFECYCLE_ORDER.slice(0, idx).reverse().find(s => history.some(n => n.status === s));
  const nextStatus = LIFECYCLE_ORDER.slice(idx + 1).find(s => history.some(n => n.status === s));
  const prevNode = prevStatus ? history.find(n => n.status === prevStatus) : undefined;
  const nextNode = nextStatus ? history.find(n => n.status === nextStatus) : undefined;

  if (prevNode && newTimestampMs < prevNode.timestampMs) {
    return { valid: false, reason: `Cannot be earlier than "${prevStatus}"` };
  }
  if (nextNode && newTimestampMs > nextNode.timestampMs) {
    return { valid: false, reason: `Cannot be later than "${nextStatus}"` };
  }
  return { valid: true };
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
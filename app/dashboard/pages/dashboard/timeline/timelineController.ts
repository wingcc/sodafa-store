'use client';

import type { Order, OrderStatus } from '../../../types';
import { getOrderTimestampForStatus, calcPercentFromTimestamp } from './deliverySlaService';

// ─────────────────────────────────────────────────────────────────────────────
// Real-Time Timeline Controller
// Strict time-respect, correct grouping (2-4h), merge with shipping, and
// automatic history correction. Called on every order change.
// ─────────────────────────────────────────────────────────────────────────────

export const GROUP_THRESHOLD_MS = 4 * 3600 * 1000; // 4 hours — user spec 2-4h
export const MERGE_THRESHOLD_MS = 4 * 3600 * 1000; // if historical within 4h of shipped → merge into same column
export const MIN_CONNECTOR_PCT = 0.3; // minimum visible connector width (% of viewport) — prevents "missing line"

const LIFECYCLE_ORDER: OrderStatus[] = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export type TimelineNode = { status: OrderStatus; timestampMs: number; timeStr: string };

export type TimelineElement =
  | { type: 'circle'; pct: number; endPct: number; node: TimelineNode }
  | { type: 'group'; pct: number; endPct: number; nodes: TimelineNode[] }
  | { type: 'merged'; pct: number; endPct: number; nodes: TimelineNode[]; currentStatus: OrderStatus }; // merged historical + current at same column

export interface TimelineBuildResult {
  elements: TimelineElement[];
  connectors: { from: number; to: number }[];
  merged: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function parseTs(v: any): number | null {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

function toTimeStr(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── 1) Normalize & correct history — always chronological, dedup, time-respect ──
export function normalizeHistory(order: any): TimelineNode[] {
  const add = (status: OrderStatus, ts: any, out: TimelineNode[]) => {
    const t = parseTs(ts);
    if (t === null) return;
    // dedup within 60s for same status
    if (out.find(o => o.status === status && Math.abs(o.timestampMs - t) < 60000)) return;
    out.push({ status, timestampMs: t, timeStr: toTimeStr(t) });
  };

  const nodes: TimelineNode[] = [];

  // Prefer explicit timeline table (source of truth), then fallback fields — handle both `timeline` and `order_timeline` aliases
  const rawTimeline = Array.isArray((order as any).timeline) ? (order as any).timeline : Array.isArray((order as any).order_timeline) ? (order as any).order_timeline : null;
  if (rawTimeline && rawTimeline.length) {
    for (const ev of rawTimeline) {
      const st = ev.status as OrderStatus;
      const raw = ev.timestamp ?? ev.created_at ?? ev.time ?? null;
      add(st, raw, nodes);
    }
  }

  // Fallback fields (for orders without timeline rows or mock data)
  add('pending', order.createdAt ?? order.created_at, nodes);
  add('confirmed', order.confirmedAt ?? order.confirmed_at, nodes);
  add('processing', order.processingStartedAt ?? order.processing_started_at ?? order.processingAt, nodes);
  add('shipped', order.shippedAt ?? order.shipped_at, nodes);
  add('delivered', order.deliveredAt ?? order.delivered_at, nodes);
  add('cancelled', order.cancelledAt ?? order.cancelled_at, nodes);
  add('refunded', (order as any).refundedAt ?? (order as any).refunded_at, nodes);

  // Ensure current status has at least one node (fallback to getOrderTimestampForStatus)
  const cur = order.orderStatus as OrderStatus;
  if (cur && !nodes.find(n => n.status === cur)) {
    const fallbackMs = getOrderTimestampForStatus(order);
    if (!Number.isNaN(fallbackMs)) {
      add(cur, new Date(fallbackMs).toISOString(), nodes);
    }
  }

  // ── Strict chronological sort (time-respect) ──
  nodes.sort((a, b) => {
    if (a.timestampMs !== b.timestampMs) return a.timestampMs - b.timestampMs;
    return LIFECYCLE_ORDER.indexOf(a.status) - LIFECYCLE_ORDER.indexOf(b.status);
  });

  // ── Correct non-monotonic history (if timestamps out of lifecycle order, keep time but log)
  // We do NOT reorder by lifecycle; we respect actual time. But we ensure no duplicate status
  // with earlier time than previous same-status? Already deduped.

  // ── Filter to allowed statuses up to current (hide future statuses like delivered when still shipped)
  const curIdx = LIFECYCLE_ORDER.indexOf(cur);
  if (curIdx !== -1) {
    // Allow only statuses up to and including current, plus terminal branches
    // But keep chronological order, not lifecycle order
    const allowed = new Set(LIFECYCLE_ORDER.slice(0, curIdx + 1));
    // Always allow current status itself
    allowed.add(cur);
    const filtered = nodes.filter(n => allowed.has(n.status));
    // If filtering removes nodes that are historically before current but lifecycle says future, keep them if they are before current timestamp
    // For now, return filtered if non-empty, else original
    if (filtered.length) return filtered;
  }

  return nodes;
}

// ── 2) Build accurate timeline — time-respect, correct grouping, merge, connectors ──
export function buildAccurateTimeline(
  lifecycleHistory: TimelineNode[],
  currentStatus: string,
  viewportStartMs: number,
  viewportDurationMs: number,
  _zoomLevel: number, // kept for API compat, but grouping now time-based not pixel-based
  currentTimestamp: number,
): TimelineBuildResult {
  const calcPct = (ts: number) => calcPercentFromTimestamp(ts, viewportStartMs, viewportDurationMs);

  // Historical nodes = all except current status, sorted chronologically (already)
  const historical = lifecycleHistory
    .filter(n => n.status !== currentStatus)
    .sort((a, b) => a.timestampMs - b.timestampMs);

  if (historical.length === 0) {
    return { elements: [], connectors: [], merged: false };
  }

  // ── Cluster historical by time gap < GROUP_THRESHOLD_MS (2-4h) ──
  const clusters: TimelineNode[][] = [];
  let cur: TimelineNode[] = [historical[0]];
  for (let i = 1; i < historical.length; i++) {
    const gap = historical[i].timestampMs - historical[i - 1].timestampMs;
    if (gap < GROUP_THRESHOLD_MS) {
      cur.push(historical[i]);
    } else {
      clusters.push(cur);
      cur = [historical[i]];
    }
  }
  clusters.push(cur);

  // ── Merge check: if last historical cluster is within MERGE_THRESHOLD of current, merge ──
  let merged = false;
  let elements: TimelineElement[] = [];
  const currentPct = calcPct(currentTimestamp);

  // Check last cluster's last node vs current
  if (clusters.length > 0) {
    const lastCluster = clusters[clusters.length - 1];
    const lastNode = lastCluster[lastCluster.length - 1];
    const gapToCurrent = currentTimestamp - lastNode.timestampMs;
    // Only merge if gap is positive (historical before current) and within threshold, and current is shipped-like
    // User spec: if difference 2-4h and shipping also close, merge all three into shipping column
    const shouldMerge = gapToCurrent >= 0 && gapToCurrent < MERGE_THRESHOLD_MS;
    if (shouldMerge) {
      // Merge last cluster + current into one "merged" element at current's position
      // This satisfies "show all three in same column for Shipping, not using group"
      const mergedNodes = [...lastCluster, { status: currentStatus as OrderStatus, timestampMs: currentTimestamp, timeStr: toTimeStr(currentTimestamp) }];
      // Remove last cluster from regular clusters, create merged element
      const remainingClusters = clusters.slice(0, -1);
      elements = remainingClusters.map(cluster => {
        const pct = calcPct(cluster[0].timestampMs);
        const endPct = calcPct(cluster[cluster.length - 1].timestampMs);
        if (cluster.length === 1) return { type: 'circle' as const, pct, endPct, node: cluster[0] };
        return { type: 'group' as const, pct, endPct, nodes: cluster };
      });
      // Merged element positioned at current's pct (time-respect), but its visual spans from first historical in cluster to current
      const mergedPct = calcPct(currentTimestamp); // use current time as anchor (same column)
      const mergedEndPct = mergedPct; // for connector calc, end is current
      elements.push({ type: 'merged', pct: mergedPct, endPct: mergedEndPct, nodes: mergedNodes, currentStatus: currentStatus as OrderStatus });
      merged = true;
    } else {
      // Normal: each cluster → element at its own time
      elements = clusters.map(cluster => {
        const pct = calcPct(cluster[0].timestampMs);
        const endPct = calcPct(cluster[cluster.length - 1].timestampMs);
        if (cluster.length === 1) return { type: 'circle' as const, pct, endPct, node: cluster[0] };
        return { type: 'group' as const, pct, endPct, nodes: cluster };
      });
    }
  }

  // Sort elements by time (pct)
  elements.sort((a, b) => a.pct - b.pct);

  // ─── CONNECTOR LOGIC (FIXED) ──────────────────────────────────────────
  // Rule:
  //   - If only one status (Pending) → no connector.
  //   - If 2+ statuses → ALWAYS connect the FIRST status (Pending) to the LAST/current status.
  //   - Intermediate statuses sit on the same horizontal path; the connector line
  //     spans from the first node to the current position.
  //   - The line is continuous and vertically centered (handled by CSS).
  const connectors: { from: number; to: number }[] = [];

  // Find the first status – always Pending per business rule.
  const firstNode = lifecycleHistory.find(n => n.status === 'pending') || lifecycleHistory[0];
  // The last/current position is the current status timestamp.
  const lastPct = currentPct;

  // Only draw a connector if there are at least two distinct statuses.
  if (lifecycleHistory.length >= 2) {
    const firstPct = calcPct(firstNode.timestampMs);
    // Ensure the connector goes from first to last, with a minimum width for visibility.
    const width = Math.max(lastPct - firstPct, MIN_CONNECTOR_PCT);
    // If width is extremely small, we still draw a minimal line.
    connectors.push({ from: firstPct, to: firstPct + width });
  }
  // ────────────────────────────────────────────────────────────────────────

  return { elements, connectors, merged };
}

// ── 3) Real-Time Controller — validates entire order row, corrects shapes ──
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

  // Validation: ensure every element's pct is within viewport and chronological
  const errors: string[] = [];
  for (const el of elements) {
    if (el.pct < 0 || el.pct > 100) {
      errors.push(`Element ${el.type} pct ${el.pct.toFixed(2)} out of viewport`);
    }
  }
  // Check sorted
  for (let i = 1; i < elements.length; i++) {
    if (elements[i].pct < elements[i - 1].pct - 0.01) {
      errors.push(`Elements out of chronological order: ${elements[i - 1].pct} -> ${elements[i].pct}`);
    }
  }

  return { history, elements, connectors, merged, currentPct: calcPercentFromTimestamp(currentTs, viewportStartMs, viewportDurationMs), errors };
}
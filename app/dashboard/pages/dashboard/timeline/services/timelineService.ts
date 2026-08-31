import { TimelineNode, TimelineElement } from '../timelineController';
import { calcPercentFromTimestamp } from '../deliverySlaService';
export type { TimelineNode } from '../timelineController';

export const GROUP_THRESHOLD_MS = 4 * 3600 * 1000; // 4 hours

export interface ConnectorPoint {
  from: number;
  to: number;
}

export interface ClusteredNodes {
  elements: TimelineElement[];
  connectors: ConnectorPoint[];
}

/**
 * Build a single connector from first historical node to current status pill.
 * pillPct = the actual % position where the current state pill renders on the lane.
 * This ensures the dashed line always reaches the pill, regardless of branch type.
 */
export function buildConnectors(
  lifecycleHistory: TimelineNode[],
  pillPct: number,
  viewportStartMs: number,
  viewportDurationMs: number
): ConnectorPoint[] {
  const connectors: ConnectorPoint[] = [];
  const calcPct = (ts: number) => calcPercentFromTimestamp(ts, viewportStartMs, viewportDurationMs);

  // Need at least one historical node
  if (lifecycleHistory.length < 1) return connectors;

  // First node = Pending (always the starting point)
  const firstNode = lifecycleHistory.find(n => n.status === 'pending') || lifecycleHistory[0];
  const firstPct = calcPct(firstNode.timestampMs);

  // Draw single continuous dashed line from first status → current pill
  if (pillPct > firstPct) {
    connectors.push({ from: firstPct, to: pillPct });
  } else if (firstPct > pillPct) {
    // Edge case: current is before first (shouldn't happen, but handle gracefully)
    connectors.push({ from: pillPct, to: firstPct });
  }

  return connectors;
}

/**
 * Cluster timeline nodes by time gap threshold (4 hours)
 * Uses a more robust algorithm: builds clusters where ALL nodes in a cluster
 * are within GROUP_THRESHOLD_MS of at least one other node in the cluster.
 * This ensures transitive grouping (A-B < 4h, B-C < 4h => A, B, C all in same cluster).
 */
export function clusterNodes(nodes: TimelineNode[]): TimelineNode[][] {
  if (nodes.length === 0) return [];
  
  // Ensure nodes are sorted by timestamp
  const sortedNodes = [...nodes].sort((a, b) => a.timestampMs - b.timestampMs);
  
  const clusters: TimelineNode[][] = [];
  let currentCluster: TimelineNode[] = [sortedNodes[0]];
  
  for (let i = 1; i < sortedNodes.length; i++) {
    const currentNode = sortedNodes[i];
    const prevNode = sortedNodes[i - 1];
    const gap = currentNode.timestampMs - prevNode.timestampMs;
    
    if (gap < GROUP_THRESHOLD_MS) {
      // Gap is small enough - add to current cluster
      currentCluster.push(currentNode);
    } else {
      // Gap too large - finalize current cluster and start new one
      clusters.push(currentCluster);
      currentCluster = [currentNode];
    }
  }
  
  // Don't forget the last cluster
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }
  
  return clusters;
}

/**
 * Alternative: More aggressive clustering using connected components
 * Groups nodes where each node is within threshold of ANY node in the cluster
 * (not just the previous one). Use this if transitive grouping is needed.
 */
export function clusterNodesTransitive(nodes: TimelineNode[]): TimelineNode[][] {
  if (nodes.length === 0) return [];
  
  const sortedNodes = [...nodes].sort((a, b) => a.timestampMs - b.timestampMs);
  const n = sortedNodes.length;
  const visited = new Array(n).fill(false);
  const clusters: TimelineNode[][] = [];
  
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    
    // Start new cluster with this node
    const cluster: TimelineNode[] = [sortedNodes[i]];
    visited[i] = true;
    
    // Expand cluster: find all nodes within threshold of ANY node in cluster
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (let j = 0; j < n; j++) {
        if (visited[j]) continue;
        
        // Check if this node is within threshold of any node in current cluster
        const isClose = cluster.some(clusterNode => 
          Math.abs(sortedNodes[j].timestampMs - clusterNode.timestampMs) < GROUP_THRESHOLD_MS
        );
        
        if (isClose) {
          cluster.push(sortedNodes[j]);
          visited[j] = true;
          expanded = true;
        }
      }
    }
    
    // Sort cluster by timestamp
    cluster.sort((a, b) => a.timestampMs - b.timestampMs);
    clusters.push(cluster);
  }
  
  return clusters;
}

/**
 * Build timeline elements from lifecycle history
 * Returns circles, groups, or merged elements based on clustering
 */
export function buildTimelineElements(
  lifecycleHistory: TimelineNode[],
  currentStatus: string,
  pillPct: number,
  viewportStartMs: number,
  viewportDurationMs: number,
  zoomLevel: number
): ClusteredNodes {
  const calcPct = (ts: number) => calcPercentFromTimestamp(ts, viewportStartMs, viewportDurationMs);

  // Historical nodes (exclude current status)
  const historical = lifecycleHistory
    .filter(n => n.status !== currentStatus)
    .sort((a, b) => a.timestampMs - b.timestampMs);

  // No history - return empty
  if (historical.length === 0) {
    return { elements: [], connectors: [] };
  }

  // Cluster historical nodes using transitive clustering for robustness
  const clusters = clusterNodesTransitive(historical);

  // Convert clusters to elements
  const elements: TimelineElement[] = clusters.map(cluster => {
    const uniqueNodes = cluster.reduce((acc, node) => {
      const existing = acc.find(n => n.status === node.status);
      if (!existing || node.timestampMs > existing.timestampMs) {
        return acc.filter(n => n.status !== node.status).concat(node);
      }
      return acc;
    }, [] as TimelineNode[]).sort((a, b) => a.timestampMs - b.timestampMs);
    
    const pct = calcPct(uniqueNodes[0].timestampMs);
    const endPct = calcPct(uniqueNodes[uniqueNodes.length - 1].timestampMs);
    
    if (uniqueNodes.length === 1) {
      return { type: 'circle' as const, pct, endPct, node: uniqueNodes[0] };
    } else {
      return { type: 'group' as const, pct, endPct, nodes: uniqueNodes };
    }
  });

  elements.sort((a, b) => a.pct - b.pct);

  // Build single continuous connector from first status → pill position
  const connectors = buildConnectors(lifecycleHistory, pillPct, viewportStartMs, viewportDurationMs);

  return { elements, connectors };
}

/**
 * Format duration between two timestamps
 */
export function formatDurationMs(startMs: number, endMs: number): string {
  const diff = Math.abs(endMs - startMs);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/**
 * Format full date string
 */
export function formatDateTime(ts: number, isAr: boolean = false): string {
  return new Date(ts).toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
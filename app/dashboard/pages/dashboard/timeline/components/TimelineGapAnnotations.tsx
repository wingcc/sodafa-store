import React from 'react';
import { Hourglass } from 'lucide-react';
import { calcPercentFromTimestamp } from '../deliverySlaService';

export interface GapAnnotation {
  midPct: number;
  gapMs: number;
  hours: number;
  fromStatus: string;
  toStatus: string;
}

export interface TimelineGapAnnotationsProps {
  lifecycleHistory: { status: string; timestampMs: number }[];
  viewportStartMs: number;
  viewportDurationMs: number;
  centerY: number;
  isAr: boolean;
  top?: number;
}

export const TimelineGapAnnotations: React.FC<TimelineGapAnnotationsProps> = ({
  lifecycleHistory,
  viewportStartMs,
  viewportDurationMs,
  centerY,
  isAr,
  top = -28,
}) => {
  const calcPct = (ts: number) => calcPercentFromTimestamp(ts, viewportStartMs, viewportDurationMs);

  // Find gaps > 8 hours
  const gaps: GapAnnotation[] = [];
  const sorted = [...lifecycleHistory].sort((a, b) => a.timestampMs - b.timestampMs);
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gapMs = curr.timestampMs - prev.timestampMs;
    
    if (gapMs > 8 * 3600 * 1000) {
      const midPct = (calcPct(prev.timestampMs) + calcPct(curr.timestampMs)) / 2;
      const hours = Math.round(gapMs / 3600000);
      gaps.push({ midPct, gapMs, hours, fromStatus: prev.status, toStatus: curr.status });
    }
  }

  if (gaps.length === 0) return null;

  return (
    <>
      {gaps.map((g, idx) => (
        <div
          key={`gap-${idx}`}
          className="absolute z-[7] flex flex-col items-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/row:pointer-events-auto"
          style={{ 
            left: `${g.midPct}%`, 
            transform: 'translateX(-50%)', 
            top: `${centerY + top}px` 
          }}
        >
          <span 
            className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm cursor-help"
            title={`${isAr ? 'تأخر داخلي' : 'Internal delay'} ${g.hours}h ${isAr ? 'عن المتوسط' : 'above average'} — ${g.fromStatus} → ${g.toStatus}`}
          >
            <Hourglass size={10} />
          </span>
          <span className="text-[8px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded-full border border-amber-200 dark:border-amber-700 mt-0.5 whitespace-nowrap">
            {g.hours}h
          </span>
        </div>
      ))}
    </>
  );
};
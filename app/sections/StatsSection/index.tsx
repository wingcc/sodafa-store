"use client";
import React, { useEffect, useRef } from "react";
import type { StatItem } from "../common/types";

interface StatsSectionProps {
  stats: StatItem[];
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = stat.count;
    const pre = stat.pre || "";
    const suf = stat.suf || "";
    const fmt = (n: number) => n.toLocaleString("en-US");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return;
        animated.current = true;
        const dur = 1600;
        let t0: number | null = null;
        const step = (ts: number) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + fmt(Math.round(target * e)) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.count, stat.pre, stat.suf]);

  return (
    <div className="stat rv" data-d={index * 80}>
      <div className="num">
        <span ref={ref} data-count={stat.count} data-pre={stat.pre || ""} data-suf={stat.suf || ""}>
          0
        </span>
      </div>
      <div className="lbl">{stat.label}</div>
    </div>
  );
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="dark-band">
      <div className="wrap stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </div>
    </div>
  );
}

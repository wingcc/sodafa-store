"use client";
import React from "react";
import { ICONS } from "../common/icons";
import type { TrustItem } from "../common/types";

interface TrustBadgesProps {
  trust: TrustItem[];
  variant?: "dark" | "light";
}

export default function TrustBadges({ trust, variant = "dark" }: TrustBadgesProps) {
  const isLight = variant === "light";

  return (
    <div className={isLight ? "rounded-[28px] border border-stone-200 bg-white shadow-[0_10px_30px_rgba(17,64,47,0.06)] p-4 sm:p-5" : "dark-band"}>
      <div className={isLight ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "trust-grid"}>
        {trust.map((item, i) => (
          <div
            key={`${item.title}-${i}`}
            className={isLight ? "flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 sm:p-4" : "tb-item rv"}
            data-d={i * 80}
          >
            <span className={isLight ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700" : "tb-ic"}>
              {ICONS[item.icon] || ICONS.leaf}
            </span>
            <div>
              <b className={isLight ? "block text-sm font-bold text-stone-900" : undefined}>{item.title}</b>
              <small className={isLight ? "mt-1 block text-xs text-stone-500" : undefined}>{item.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

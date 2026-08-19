"use client";
import React from "react";
import { ICONS } from "../common/icons";
import type { TrustItem } from "../common/types";

interface TrustBadgesProps {
  trust: TrustItem[];
}

export default function TrustBadges({ trust }: TrustBadgesProps) {
  return (
    <div className="dark-band">
      <div className="trust-grid">
        {trust.map((item, i) => (
          <div key={i} className="tb-item rv" data-d={i * 80}>
            <span className="tb-ic">{ICONS[item.icon] || ICONS.leaf}</span>
            <div>
              <b>{item.title}</b>
              <small>{item.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

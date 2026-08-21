"use client";
import React from "react";
import type { OrderStep, SiteConfig } from "../common/types";

interface HowToOrderSectionProps {
  steps: OrderStep[];
  site: SiteConfig;
}

export default function HowToOrderSection({ steps, site }: HowToOrderSectionProps) {
  return (
    <div>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="sec-head rv">
          <span className="eyebrow">بكل بساطة</span>
          <h2>كيفاش تطلبي؟</h2>
          <p>من الاختيار حتى باب دارك، في 4 خطوات</p>
        </div>

        <div className="steps-row">
          {steps.map((step, i) => (
            <div key={i} className="step-card rv" data-d={i * 100}>
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <span className="mini">{step.mini}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

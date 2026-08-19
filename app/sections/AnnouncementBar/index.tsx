"use client";

import React from "react";

const MESSAGES = [
  "تركيبة 100% طبيعية",
  "نتائج ملموسة خلال 30 يوماً",
  "استشارة مجانية عبر واتساب",
  "الدفع عند الاستلام",
  "شحن سريع لجميع المناطق",
];

export const AnnouncementBar = () => {
  return (
    <div className="top-bar" aria-hidden="true">
      <div className="mq">
        {[...MESSAGES, ...MESSAGES].map((msg, i) => (
          <span key={i}>
            <i>{i % 2 === 0 ? "❧" : "✦"}</i> {msg}
          </span>
        ))}
      </div>
    </div>
  );
};
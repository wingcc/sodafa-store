"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { PricingConfig, SiteConfig } from "../common/types";

interface CtaSectionProps {
  pricing: PricingConfig;
  site: SiteConfig;
}

const CTA_FEATURES = [
  "استشارة مجانية",
  "الدفع عند الاستلام",
  "شحن سريع وآمن",
  "ضمان الرضا",
];

const CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>';

function pad2(n: number) {
  return (n < 10 ? "0" : "") + n;
}

export default function CtaSection({ pricing, site }: CtaSectionProps) {
  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;

  // End-of-day countdown matching original safeDayCountdown
  const [time, setTime] = useState({ h: "00", m: "00", s: "00" });

  const tick = useCallback(() => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end.getTime() - now.getTime());
    setTime({
      h: pad2(Math.floor(diff / 3600000)),
      m: pad2(Math.floor((diff % 3600000) / 60000)),
      s: pad2(Math.floor((diff % 60000) / 1000)),
    });
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <section id="cta">
      <div className="wrap">
        <div className="cta-card rv">
          <div className="cta-txt">
            <span className="eyebrow">تحدث مع خبيرنا للطلب</span>
            <h2>احصل على التركيبة الطبيعية المتكاملة واستمتع بشعر قوي، لامع، وصحي</h2>
            <p>
              تواصل معنا الآن عبر واتساب للحصول على استشارة مجانية كاملة، وسيرافقك خبيرنا خطوة بخطوة حتى تحقيق النتائج.
            </p>
            <ul className="cta-list">
              {CTA_FEATURES.map((f) => (
                <li key={f} dangerouslySetInnerHTML={{ __html: CHECK + f }} />
              ))}
            </ul>
          </div>

          <div className="cta-side">
            <span className="off">✦ عرض اليوم الخاص ✦</span>
            <div className="cd" aria-label="الوقت المتبقي على انتهاء العرض">
              <div><b data-cd="h">{time.h}</b><small>ساعة</small></div>
              <div><b data-cd="m">{time.m}</b><small>دقيقة</small></div>
              <div><b data-cd="s">{time.s}</b><small>ثانية</small></div>
            </div>

            <div className="cta-price" data-el="ctaPrice" aria-label="عرض السعر">
              <span className="cta-price-label" data-el="priceLabel">{pricing.label}</span>
              <div className="cta-price-row">
                <span className="cta-price-cur-num" data-el="priceCurrent">{pricing.current}</span>
                <span className="cta-price-cur-unit" data-el="priceCurrency">{pricing.currency}</span>
                <span className="cta-price-sep">عوض</span>
                <span className="cta-price-old-num" data-el="priceOld">{pricing.old}</span>
                <span className="cta-price-old-unit">{pricing.oldCurrency || pricing.currency}</span>
              </div>
            </div>

            <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.6-2.6.2-.5.8-1.4 1.3-1.5.4 0 .7 0 .9.5l.7 1.6c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4-.1.7.5.9 2 2.4 3.2 2.9.3.1.5.1.7-.1l.7-.8c.2-.3.5-.3.8-.2l1.7.8c.4.2.6.4.6.6 0 .2 0 .5-.1.8Z" />
              </svg>
              اطلب الآن عبر الواتساب
            </a>
            <small className="note">رد فوري خلال دقائق • خدمة 7 أيام في الأسبوع</small>
          </div>
        </div>
      </div>
    </section>
  );
}

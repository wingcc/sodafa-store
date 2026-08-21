"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { FlashConfig, SiteConfig } from "../common/types";

interface FlashSaleSectionProps {
  flash: FlashConfig;
  site: SiteConfig;
}

const STAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z"/></svg>';

function useCountdown(hours: number) {
  const endTime = useCallback(() => Date.now() + hours * 3600 * 1000, [hours]);
  const [end] = useState(endTime);
  const [time, setTime] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  return time;
}

export default function FlashSaleSection({ flash, site }: FlashSaleSectionProps) {
  const time = useCountdown(flash.hours || 60);
  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;

  return (
    <div>
      <div className="wrap">
        <div className="fs-head rv">
          <h2>🔥 تخفيضات سريعة</h2>
          <div className="fs-timer" aria-label="الوقت المتبقي على انتهاء العرض">
            <div><b data-fs="d">{time.d}</b><small>أيام</small></div><i>:</i>
            <div><b data-fs="h">{time.h}</b><small>ساعات</small></div><i>:</i>
            <div><b data-fs="m">{time.m}</b><small>دقائق</small></div><i>:</i>
            <div><b data-fs="s">{time.s}</b><small>ثواني</small></div>
          </div>
          <a className="btn btn-main fs-all" href={waUrl} target="_blank" rel="noopener">عرض الكل</a>
        </div>

        <div className="fs-grid">
          {(flash.products || []).map((p, i) => (
            <div key={i} className="fs-card rv" data-d={i * 120}>
              <div className="fs-img">
                <span className="fs-disc">{p.discount}</span>
                <img loading="lazy" src={p.img} alt={p.title} />
              </div>
              <div className="fs-body">
                <div>
                  <h3>{p.title}</h3>
                  <div className="fs-rate">
                    <b>{p.rating}</b>{" "}
                    <span dangerouslySetInnerHTML={{ __html: STAR }} />
                    {" "}
                    <span>({p.reviews} تقييم)</span>
                  </div>
                </div>
                <div>
                  <div className="fs-price">
                    <b>{p.price}</b>
                    {p.oldPrice && <s>{p.oldPrice}</s>}
                  </div>
                  <button className="fs-add" data-add={p.title}>أضف إلى السلة</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

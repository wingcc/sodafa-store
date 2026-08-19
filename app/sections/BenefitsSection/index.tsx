"use client";
import React, { useEffect, useRef } from "react";
import { ICONS, BEN_ICONS } from "../common/icons";
import type { BenefitItem, SiteConfig } from "../common/types";

interface BenefitsSectionProps {
  benefits: BenefitItem[];
  site: SiteConfig;
}

function pad2(n: number) {
  return (n < 10 ? "0" : "") + n;
}

const delays = [0, 80, 160, 120, 200];

export default function BenefitsSection({ benefits, site }: BenefitsSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!site.benefitsVideoUrl || !vid) {
      if (vid) vid.style.display = "none";
      return;
    }
    vid.src = site.benefitsVideoUrl;
    vid.addEventListener("canplay", () => {
      vid.classList.add("ready");
      bandRef.current?.classList.add("video-on");
      vid.play().catch(() => {});
    });
    vid.addEventListener("error", () => { vid.style.display = "none"; });
  }, [site.benefitsVideoUrl]);

  return (
    <div className="dark-band" id="benefitsBand" ref={bandRef}>
      <video
        ref={videoRef}
        className="bg-video"
        id="benefitsVideo"
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="bg-vid-overlay" />
      <div className="wrap inner">
        <div className="sec-head rv" style={{ marginBottom: "2.6rem" }}>
          <span className="eyebrow">مميزات السيروم</span>
          <h2>خمس فوائد أساسية تجمعها تركيبتنا الطبيعية المتكاملة</h2>
          <p>صُممت كل قطرة لتعمل على مستوى البصيلة، فتعالج السبب لا المظهر فقط.</p>
        </div>

        <div className="ben-grid" style={{ paddingTop: 0 }}>
          {benefits.map((b, i) => (
            <div
              key={i}
              className={`ben w${b.span || ""} rv`}
              data-d={delays[i] != null ? delays[i] : 0}
            >
              <span className="ghost">{pad2(i + 1)}</span>
              <div className="ic">{BEN_ICONS[b.icon] || ICONS[b.icon] || ICONS.leaf}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { WhatsAppIcon } from "../common/icons";
import type { SiteConfig } from "../common/types";

interface SoyaProductHeroProps {
  site: SiteConfig;
}

export const SoyaProductHero = ({ site }: SoyaProductHeroProps) => {
  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;
  const sectionRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Hero tilt effect (only on devices with hover & fine pointer)
  useEffect(() => {
    const sec = sectionRef.current;
    const tilt = tiltRef.current;
    if (!sec || !tilt) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = sec.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
      tilt.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    const onLeave = () => {
      tilt.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    sec.addEventListener("mousemove", onMove);
    sec.addEventListener("mouseleave", onLeave);
    return () => {
      sec.removeEventListener("mousemove", onMove);
      sec.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section id="soya-product-hero" className="hero soya-hero" ref={sectionRef}>
      <div className="blob b1" />
      <div className="blob b2" />
      <svg className="leaf-bg" style={{ top: "-40px", left: "-60px", width: "340px" }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M50 95C50 45 20 30 8 10c30 8 42 25 42 45 0-20 12-37 42-45C80 30 50 45 50 95Z" />
      </svg>
      <svg className="leaf-bg" style={{ bottom: "-70px", right: "-50px", width: "420px", transform: "rotate(160deg)" }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M50 95C50 45 20 30 8 10c30 8 42 25 42 45 0-20 12-37 42-45C80 30 50 45 50 95Z" />
      </svg>

      <div className="wrap hero-grid">
        <div>
          <span className="badge-pill rv">
            <i />
            <span>منتج SODFA المميز</span>
          </span>

          <h1 className="rv" data-d="80">
            سيروم <span className="grad">الشعر الطبيعي</span> بخلاصة الصويا
          </h1>

          <p className="lead rv" data-d="160">
            تركيبة متطورة تجمع بين بروتينات الصويا الطبيعية وأربعة زيوت نادرة لتغذية عميقة للبصيلات، وتقوية الشعر من الجذور. <b>من أول استعمال، لمعان وحماية تدوم.</b>
          </p>

          <div className="hero-cta rv" data-d="240">
            <a className="btn btn-main" href={waUrl} target="_blank" rel="noopener">
              <WhatsAppIcon size={18} />
              اطلب الآن
            </a>
            <a className="btn btn-line" href="#oils">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
              </svg>
              اكتشفي المكونات
            </a>
          </div>

          <div className="trust rv" data-d="320">
            <div className="avatars"><b>ن</b><b>أ</b><b>س</b><b>+8K</b></div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <span className="stars" aria-hidden="true">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z" />
                    </svg>
                  ))}
                </span>
                <span className="rate">4.9 / 5</span>
              </div>
              <small>تقييم موثّق • نتائج مضمونة من أكثر من 8,500 عميلة وعميل</small>
            </div>
          </div>
        </div>

        <div className="hero-vis rv" data-d="150">
          <div className="hero-tilt" id="heroTilt" ref={tiltRef}>
            <div className="arch">
              <div className="halo" />
              <img src="/assets/Image/product-hero.jpg" alt="سيروم SODFA الطبيعي بخلاصة الصويا" />
            </div>
            <div className="chip c1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21C12 13 7 10 5 5c5 2 7 5 7 9 0-4 2-7 7-9-2 5-7 8-7 16z" />
              </svg>
              بروتين الصويا
            </div>
            <div className="chip c2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21s-7-4.6-7-10a7 7 0 0 1 14 0c0 5.4-7 10-7 10z" />
              </svg>
              نتائج خلال 30 يوم
            </div>
            <div className="chip c3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              طبيعي 100%
            </div>
            <div className="spin-badge">
              <svg className="ring" viewBox="0 0 120 120">
                <image href="/assets/Image/BRAND.png" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SoyaProductHero;
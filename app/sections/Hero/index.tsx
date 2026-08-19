"use client";
import React, { useEffect, useRef } from "react";
import { WhatsAppIcon } from "../common/icons";
import type { HeroConfig, SiteConfig } from "../common/types";

interface HeroSectionProps {
  hero: HeroConfig;
  site: SiteConfig;
  onOpenVideo?: () => void;
}

export default function HeroSection({ hero, site, onOpenVideo }: HeroSectionProps) {
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

  const scrollDown = () => {
    const first = document.querySelector("[data-section]") as HTMLElement;
    if (first && first.getAttribute("data-section") !== "hero") {
      first.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback: scroll to stats
      document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="hero" ref={sectionRef}>
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
            <span>{hero.badge || "100% طبيعي • غني بالمغذيات"}</span>
          </span>

          <h1 className="rv" data-d="80" dangerouslySetInnerHTML={{ __html: `${hero.h1a} <span class="grad">${hero.hl}</span> ${hero.h1b}` }} />

          <p
            className="lead rv"
            data-d="160"
            dangerouslySetInnerHTML={{ __html: hero.lead || "" }}
          />

          <div className="hero-cta rv" data-d="240">
            <a className="btn btn-main" href={waUrl} target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.6-2.6.2-.5.8-1.4 1.3-1.5.4 0 .7 0 .9.5l.7 1.6c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4-.1.7.5.9 2 2.4 3.2 2.9.3.1.5.1.7-.1l.7-.8c.2-.3.5-.3.8-.2l1.7.8c.4.2.6.4.6.6 0 .2 0 .5-.1.8Z" />
              </svg>
              اطلب عبر الواتساب
            </a>
            <a className="btn btn-line" href="#cases">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
              </svg>
              شاهد النتائج
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
                <span className="rate">{hero.rate || "4.9 / 5"}</span>
              </div>
              <small>{hero.trustNote}</small>
            </div>
          </div>
        </div>

        <div className="hero-vis rv" data-d="150">
          <div className="hero-tilt" id="heroTilt" ref={tiltRef}>
            <div className="arch">
              <div className="halo" />
              <img src={hero.img || "/assets/Image/HERO.png"} alt="سيروم SODFA الطبيعي للشعر" />
            </div>
            <div className="chip c1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21C12 13 7 10 5 5c5 2 7 5 7 9 0-4 2-7 7-9-2 5-7 8-7 16z" />
              </svg>
              16 زيتاً طبيعياً
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
              بدون بارابين أو سلفات
            </div>
            <div className="spin-badge">
              <svg className="ring" viewBox="0 0 120 120">
                <image href="/assets/Image/BRAND.png" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scrollwrap">
        <div className="scroll-ind" aria-hidden="true" />
        <button className="scroll-down" id="scrollDownBtn" onClick={scrollDown} aria-label="انزل للأسفل">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

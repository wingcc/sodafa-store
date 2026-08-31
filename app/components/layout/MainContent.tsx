// app/components/layout/MainContent.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SodfaConfig } from "../../sections/common/types";
import { loadPublicConfig } from "@/lib/public-content";
import Preloader from "../common/Preloader";
import VideoModal from "../../sections/common/VideoModal";
import ContactModal from "../../sections/common/ContactModal";
import LegalModal from "../../sections/common/LegalModal";
import FloatingButtons from "../../sections/common/FloatingButtons";
import ScrollProgress from "../../sections/common/ScrollProgress";

// Import all section components
import { AnnouncementBar } from "../../sections/AnnouncementBar";
import Navbar from "../../sections/Navbar";
import HeroSection from "../../sections/Hero";
import StatsSection from "../../sections/StatsSection";
import TrustBadges from "../../sections/TrustBadges";
import FlashSaleSection from "../../sections/FlashSaleSection";
import OilsSection from "../../sections/OilsSection";
import BenefitsSection from "../../sections/BenefitsSection";
import VideoSection from "../../sections/VideoSection";
import CasesSection from "../../sections/CasesSection";
import AboutSection from "../../sections/AboutSection";
import ProductSection from "../../sections/ProductSection";
import TestimonialsSection from "../../sections/TestimonialsSection";
import FaqSection from "../../sections/FaqSection";
import HowToOrderSection from "../../sections/HowToOrderSection";
import CtaSection from "../../sections/CtaSection";
import StoreVisitSection from "../../sections/StoreVisitSection";
import Footer from "../../sections/Footer";
import FallingLeaves from "../../sections/common/FallingLeaves";

export const MainContent = () => {
  const [config, setConfig] = useState<SodfaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | "cookies" | null>(null);
  const [videoModal, setVideoModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [storeLegal, setStoreLegal] = useState<Record<string, { title: string; body: string }>>({});

  // Re-observe .rv elements whenever config changes (sections render after config loads)
  const revealRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!config) return;
    // Small delay to let React commit the new sections to the DOM
    const timer = setTimeout(() => {
      // Clean up previous observer
      revealRef.current?.disconnect();

      const els = document.querySelectorAll<HTMLElement>(".rv:not(.in)");
      if (els.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const delay = parseInt(el.getAttribute("data-d") || "0", 10);
              setTimeout(() => {
                el.classList.add("in");
              }, delay);
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      els.forEach((el) => observer.observe(el));
      revealRef.current = observer;
    }, 150);

    return () => {
      clearTimeout(timer);
      revealRef.current?.disconnect();
    };
  }, [config]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // config.json base + dashboard-managed database overlay
        const cfg = await loadPublicConfig();
        setConfig(cfg);
      } catch (err) {
        console.error("Failed to load config:", err);
        setError("Failed to load configuration");
        document.title = "SODFA — Config Error";
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Load Store Content pages for legal popups — uses slugs from Store Info (Dashboard → Store Management → Settings → Legal Pages)
  useEffect(() => {
    if (!config?.site) return;
    let cancelled = false;
    (async () => {
      try {
        const siteInfo: any = (config as any).site ?? {};
        const privacySlug = siteInfo.privacyPolicySlug || 'privacy-policy';
        const termsSlug = siteInfo.termsSlug || 'terms';
        const cookiesSlug = siteInfo.cookiesSlug || 'cookies';
        const targets = [
          { key: 'privacy', slug: privacySlug },
          { key: 'terms', slug: termsSlug },
          { key: 'cookies', slug: cookiesSlug },
        ];
        const map: Record<string, { title: string; body: string }> = {};
        await Promise.all(
          targets.map(async ({ key, slug }) => {
            if (!slug) return;
            try {
              const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`);
              const json = await res.json();
              if (json.success && json.data) {
                map[key] = { title: String(json.data.name ?? ''), body: String(json.data.content ?? '') };
              }
            } catch {}
          })
        );
        // Fallback bulk
        const missing = targets.filter((t) => !map[t.key]);
        if (missing.length) {
          try {
            const res = await fetch('/api/content-pages');
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              for (const row of json.data as any[]) {
                const slug = String(row.slug ?? '');
                const hit = missing.find((m) => m.slug === slug);
                if (hit && !map[hit.key]) map[hit.key] = { title: String(row.name ?? ''), body: String(row.content ?? '') };
              }
            }
          } catch {}
        }
        if (!cancelled && Object.keys(map).length) setStoreLegal(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [config]);

  // Store flush (test.24.html): when 'store' is the last enabled section,
  // merge it seamlessly into the footer. Desktop only — see website.css.
  useEffect(() => {
    const lastEnabled = config?.sections?.filter((s) => s.enabled).pop()?.id;
    document.documentElement.classList.toggle("store-flush", lastEnabled === "store");
    return () => document.documentElement.classList.remove("store-flush");
  }, [config]);

  const handleOpenContact = useCallback(() => {
    setContactModal(true);
  }, []);

  const handleCloseContact = useCallback(() => {
    setContactModal(false);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const handleOpenLegal = useCallback(async (key: string) => {
    setLegalModal(key as "privacy" | "terms" | "cookies");
    // Fetch fresh from Store Content so popup matches Dashboard edits
    try {
      const siteInfo: any = (config as any)?.site ?? {};
      const slugMap: Record<string, string> = {
        privacy: siteInfo.privacyPolicySlug || 'privacy-policy',
        terms: siteInfo.termsSlug || 'terms',
        cookies: siteInfo.cookiesSlug || 'cookies',
      };
      const slug = slugMap[key];
      if (!slug) return;
      const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setStoreLegal((prev) => ({ ...prev, [key]: { title: String(json.data.name ?? ''), body: String(json.data.content ?? '') } }));
      }
    } catch {}
  }, [config]);

  const handleCloseLegal = useCallback(() => {
    setLegalModal(null);
  }, []);

  const handleOpenVideo = useCallback(() => {
    setVideoModal(true);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  if (!config) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontWeight: 700 }}>
        {error || "فشل تحميل الإعدادات"}
      </div>
    );
  }

  const { site, hero, stats, trust, flash, oils, benefits, video, cases, about, founder, products, testimonials, faq, orderSteps, pricing, legal: configLegal, sections, buttonsSettings } = config as any;
  const legal = { ...(configLegal as any), ...storeLegal } as any;

  // Build enabled set from config sections array
  const enabledSet = new Set(
    (sections || []).filter((s: { enabled: boolean }) => s.enabled).map((s: { id: string }) => s.id)
  );

  // Check if section is enabled: if config has no sections list, all are enabled; otherwise check the set
  const isEnabled = (id: string) => enabledSet.size === 0 || enabledSet.has(id);

  return (
    <main role="main" id="app">
      <FallingLeaves />
      <Preloader />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar site={site} onOpenContact={handleOpenContact} />

      {/* Hero Section — div mount like the original buildApp() (hero carries
          its own <section class="hero"> with padding:0) */}
      {isEnabled("hero") && (
        <div data-section="hero">
          <HeroSection hero={hero} site={site} />
        </div>
      )}

      {/* Stats Section */}
      {isEnabled("stats") && (
        <section data-section="stats" id="stats" className="band-wrap">
          <StatsSection stats={stats} />
        </section>
      )}

      {/* Trust Badges Section */}
      {isEnabled("trust") && (
        <section data-section="trust" id="trust" className="band-wrap">
          <TrustBadges trust={trust} />
        </section>
      )}

      {/* Flash Sale Section */}
      {isEnabled("flash") && (
        <section data-section="flash" id="flash">
          <FlashSaleSection />
        </section>
      )}

      {/* Oils Section */}
      {isEnabled("oils") && (
        <section data-section="oils" id="oils">
          <OilsSection oils={oils} />
        </section>
      )}

      {/* Benefits Section */}
      {isEnabled("benefits") && (
        <section data-section="benefits" id="benefits">
          <BenefitsSection benefits={benefits} site={site} />
        </section>
      )}

      {/* Video Section */}
      {isEnabled("video") && (
        <section data-section="video" id="video">
          <VideoSection video={video} site={site} onOpenVideo={handleOpenVideo} />
        </section>
      )}

      {/* Cases / Before-After Section */}
      {isEnabled("cases") && (
        <section data-section="cases" id="cases">
          <CasesSection cases={cases} />
        </section>
      )}

      {/* About Section */}
      {isEnabled("about") && (
        <section data-section="about" id="about">
          <AboutSection about={about} founder={founder} />
        </section>
      )}

      {/* Products Section (disabled by default) */}
      {isEnabled("products") && (
        <section data-section="products" id="products">
          <ProductSection />
        </section>
      )}

      {/* Testimonials / Reviews Section */}
      {isEnabled("reviews") && (
        <section data-section="reviews" id="reviews">
          <TestimonialsSection testimonials={testimonials} stats={stats} />
        </section>
      )}

      {/* FAQ Section */}
      {isEnabled("faq") && (
        <section data-section="faq" id="faq">
          <FaqSection faq={faq} />
        </section>
      )}

      {/* How to Order Section */}
      {isEnabled("order") && (
        <section data-section="order" id="order">
          <HowToOrderSection steps={orderSteps} site={site} />
        </section>
      )}

      {/* CTA Section */}
      {isEnabled("cta") && (
        <section data-section="cta" id="cta">
          <CtaSection pricing={pricing} site={site} />
        </section>
      )}

      {/* Store Visit Section */}
      {isEnabled("store") && (
        <section data-section="store" id="store">
          <StoreVisitSection site={site} onOpenContact={handleOpenContact} />
        </section>
      )}

      {/* Footer */}
      {isEnabled("footer") && (
        <div data-section="footer" id="footer">
          <Footer
            site={site}
            legal={legal || {}}
            onOpenContact={handleOpenContact}
            onOpenLegal={handleOpenLegal}
            showToast={showToast}
          />
        </div>
      )}

      {/* Floating Buttons */}
      <FloatingButtons site={site} onOpenContact={handleOpenContact} buttonsSettings={buttonsSettings} />

      {/* Toast */}
      <div className={`toast${toastMsg ? " show" : ""}`} id="toast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span>{toastMsg}</span>
      </div>

      {/* Video Modal */}
      {videoModal && <VideoModal onClose={() => setVideoModal(false)} />}

      {/* Contact Modal (Popup) */}
      {contactModal && (
        <ContactModal site={site} onClose={handleCloseContact} showToast={showToast} />
      )}

      {/* Legal Modal — beautiful, editor-grade */}
      {legalModal && legal && legal[legalModal] && (
        <LegalModal
          title={legal[legalModal]!.title}
          body={legal[legalModal]!.body}
          updatedAt="غشت 2026"
          onClose={handleCloseLegal}
        />
      )}
    </main>
  );
};
// app/components/layout/MainContent.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SodfaConfig, LegalConfig } from "../../sections/common/types";
import Preloader from "../../sections/common/Preloader";
import VideoModal from "../../sections/common/VideoModal";
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
import { ContactSection } from "../../sections/ContactSection";
import Footer from "../../sections/Footer";

export const MainContent = () => {
  const [config, setConfig] = useState<SodfaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | "cookies" | null>(null);
  const [videoModal, setVideoModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
        const res = await fetch("/json/config.json");
        if (res.ok) {
          const cfg = await res.json();
          setConfig(cfg);
        } else {
          setError("Failed to load config");
        }
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

  const handleOpenContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const handleOpenLegal = useCallback((key: string) => {
    setLegalModal(key as "privacy" | "terms" | "cookies");
  }, []);

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

  const { site, hero, stats, trust, flash, oils, benefits, video, cases, about, founder, products, testimonials, faq, orderSteps, pricing, legal, sections } = config;

  // Build enabled set from config sections array
  const enabledSet = new Set(
    (sections || []).filter((s: { enabled: boolean }) => s.enabled).map((s: { id: string }) => s.id)
  );

  // Check if section is enabled: if config has no sections list, all are enabled; otherwise check the set
  const isEnabled = (id: string) => enabledSet.size === 0 || enabledSet.has(id);

  return (
    <main role="main" id="app">
      <Preloader />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar site={site} onOpenContact={handleOpenContact} />

      {/* Hero Section */}
      <section data-section="hero" id="hero">
        <HeroSection hero={hero} site={site} />
      </section>

      {/* Stats Section */}
      <section data-section="stats" id="stats" className="band-wrap">
        <StatsSection stats={stats} />
      </section>

      {/* Trust Badges Section */}
      <section data-section="trust" id="trust" className="band-wrap">
        <TrustBadges trust={trust} />
      </section>

      {/* Flash Sale Section (disabled by default) */}
      {isEnabled("flash") && flash && (
        <section data-section="flash" id="flash">
          <FlashSaleSection flash={flash} site={site} />
        </section>
      )}

      {/* Oils Section */}
      <section data-section="oils" id="oils">
        <OilsSection oils={oils} />
      </section>

      {/* Benefits Section */}
      <section data-section="benefits" id="benefits">
        <BenefitsSection benefits={benefits} site={site} />
      </section>

      {/* Video Section */}
      <section data-section="video" id="video">
        <VideoSection video={video} site={site} onOpenVideo={handleOpenVideo} />
      </section>

      {/* Cases / Before-After Section */}
      <section data-section="cases" id="cases">
        <CasesSection cases={cases} />
      </section>

      {/* About Section */}
      <section data-section="about" id="about">
        <AboutSection about={about} founder={founder} />
      </section>

      {/* Products Section (disabled by default) */}
      {isEnabled("products") && (
        <section data-section="products" id="products">
          <ProductSection products={products} site={site} />
        </section>
      )}

      {/* Testimonials / Reviews Section */}
      <section data-section="reviews" id="reviews">
        <TestimonialsSection testimonials={testimonials} stats={stats} />
      </section>

      {/* FAQ Section */}
      <section data-section="faq" id="faq">
        <FaqSection faq={faq} />
      </section>

      {/* How to Order Section */}
      <section data-section="order" id="order">
        <HowToOrderSection steps={orderSteps} site={site} />
      </section>

      {/* CTA Section */}
      <section data-section="cta" id="cta">
        <CtaSection pricing={pricing} site={site} />
      </section>

      {/* Store Visit Section */}
      <section data-section="store" id="store">
        <StoreVisitSection site={site} onOpenContact={handleOpenContact} />
      </section>

      {/* Contact Section */}
      <section data-section="contact" id="contact">
        <ContactSection site={site} />
      </section>

      {/* Footer */}
      <div data-section="footer" id="footer">
        <Footer
          site={site}
          legal={legal || {}}
          onOpenContact={handleOpenContact}
          onOpenLegal={handleOpenLegal}
          showToast={showToast}
        />
      </div>

      {/* Floating Buttons */}
      <FloatingButtons site={site} />

      {/* Toast */}
      <div className={`toast${toastMsg ? " show" : ""}`} id="toast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span>{toastMsg}</span>
      </div>

      {/* Video Modal */}
      {videoModal && <VideoModal onClose={() => setVideoModal(false)} />}

      {/* Legal Modal */}
      {legalModal && legal && legal[legalModal] && (
        <div className="modal open" id="legalModal" data-page="legalModal" role="dialog" aria-modal="true" aria-label="معلومات قانونية">
          <div className="ovl" onClick={handleCloseLegal} />
          <div className="modal-box legal-box">
            <button className="m-close" onClick={handleCloseLegal} aria-label="إغلاق">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <h3>{legal[legalModal]!.title}</h3>
            <span className="lg-date">آخر تحديث: غشت 2026</span>
            <div className="lg-body" dangerouslySetInnerHTML={{ __html: legal[legalModal]!.body }} />
          </div>
        </div>
      )}
    </main>
  );
};

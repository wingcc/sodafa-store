"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { InstagramSVG, FacebookSVG } from "../common/icons";
import type { SiteConfig, LegalConfig } from "../common/types";

const DEFAULT_SITE: SiteConfig = {
  brandName: "SODFA",
  logo: "/assets/Image/NavbarLogo.png",
  NavbarLogo: "/assets/Image/NavbarLogo.png",
  footerLogo: "/assets/Image/FooterLogo.jpg",
  tagline: "جمال · طبيعة · ثقة",
  whatsappMain: "+212673932389",
  whatsappMessage: "أريد طلب سيروم الشعر الطبيعي",
  whatsappStore: "+212673932389",
  phoneDisplay: "+212 673-932389",
  phoneTel: "+212673932389",
  email: "info@sodfa.com",
  address: "حي شماعو سلا ، المغرب",
  addressShort: "حي شماعو سلا، سلا",
  hoursStore: "من الإثنين إلى السبت · 9:00 ص – 8:00 م",
  hoursContact: "السبت - الخميس: 9:00 ص - 6:00 م",
  instagram: "https://www.instagram.com/soodfa2026?igsh=NTJkMWt3cW42a2E0",
  facebook: "https://web.facebook.com/profile.php?id=61590754402259",
  tiktok: "https://www.tiktok.com/@karimayassmin",
};

const DEFAULT_LEGAL: LegalConfig = {};

type FooterVariant = "home" | "store" | "minimal";

interface FooterProps {
  site?: SiteConfig;
  legal?: LegalConfig;
  onOpenContact?: () => void;
  onOpenLegal?: (key: string) => void;
  showToast?: (msg: string) => void;
  variant?: FooterVariant;
}

const HOME_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#products", label: "منتجاتنا" },
  { href: "#order", label: "كيفاش نخدمو" },
  { href: "#about", label: "قصتنا" },
  { href: "#faq", label: "الأسئلة الشائعة" },
];

const STORE_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/store", label: "المتجر" },
  { href: "/track-order", label: "تتبع الطلب" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

function resolveVariant(pathname: string, explicit?: FooterVariant): FooterVariant {
  if (explicit) return explicit;
  if (pathname === "/") return "home";
  if (pathname.startsWith("/store")) return "store";
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) return "minimal";
  if (pathname.startsWith("/contact") || pathname.startsWith("/track-order")) return "store";
  return "store";
}

export function Footer({
  site: siteProp = DEFAULT_SITE,
  legal: legalProp = DEFAULT_LEGAL,
  onOpenContact = () => {},
  onOpenLegal,
  showToast = () => {},
  variant,
}: FooterProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const activeVariant = resolveVariant(pathname, variant);
  const [btnLabel, setBtnLabel] = useState("اشتركي الآن");
  const [localLegal, setLocalLegal] = useState<string | null>(null);
  const [site, setSite] = useState<SiteConfig>(siteProp);
  const [legal, setLegal] = useState<LegalConfig>(legalProp);

  // Keep in sync if parent passes real config (e.g. MainContent)
  useEffect(() => {
    if (siteProp !== DEFAULT_SITE) setSite(siteProp);
  }, [siteProp]);
  useEffect(() => {
    if (legalProp !== DEFAULT_LEGAL && Object.keys(legalProp).length > 0) setLegal(legalProp);
  }, [legalProp]);

  // Self-fetch when rendered standalone on store pages (no props)
  useEffect(() => {
    const needsSite = siteProp === DEFAULT_SITE;
    const needsLegal = !legalProp || Object.keys(legalProp).length === 0;
    if (!needsSite && !needsLegal) return;
    let cancelled = false;
    (async () => {
      try {
        const { loadPublicConfig } = await import("@/lib/public-content");
        const cfg = await loadPublicConfig();
        if (cancelled) return;
        if (needsSite && cfg.site) setSite(cfg.site);
        if (needsLegal && cfg.legal) setLegal(cfg.legal as LegalConfig);
      } catch {
        // fallback to static json
        try {
          const r = await fetch("/json/config.json");
          const data = await r.json();
          if (cancelled) return;
          if (needsSite && data.site) setSite((prev) => ({ ...prev, ...data.site }));
          if (needsLegal && data.legal) setLegal(data.legal);
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteProp, legalProp]);

  const quickLinks = activeVariant === "home" ? HOME_LINKS : STORE_LINKS;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHash = href.startsWith("#") || href.startsWith("/#");
    if (!isHash) return;
    const hash = href.slice(href.indexOf("#"));
    if (pathname !== "/" && href.startsWith("#")) {
      e.preventDefault();
      router.push(`/${hash}`);
      return;
    }
    if (hash && pathname === "/") {
      e.preventDefault();
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContact = () => {
    if (activeVariant !== "home") {
      router.push("/contact");
      return;
    }
    onOpenContact();
  };

  const handleLegal = (key: string) => {
    if (onOpenLegal) {
      onOpenLegal(key);
      return;
    }
    // Fallback: show inline modal if no external handler (store pages)
    setLocalLegal(key);
  };

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector("input") as HTMLInputElement;
    if (input?.value) {
      setBtnLabel("✓ تم الاشتراك");
      showToast("تم اشتراكك في النشرة البريدية بنجاح 🌿");
      setTimeout(() => {
        setBtnLabel("اشتركي الآن");
        input.value = "";
      }, 3000);
    }
  };

  const legalData = legal as Record<string, { title: string; body: string } | undefined>;
  const activeLegal = localLegal ? legalData[localLegal] : null;

  return (
    <>
      <footer className="site-footer" data-page="footer">
        <div className="deco d1" />
        <div className="deco d2" />
        <div className="pat" />

        <div className="wrap">
          <div className="ft-grid">
            {/* Brand */}
            <div className="ft-col ft-brand rv">
              <Link className="logo-ft" href="/" aria-label="SODFA">
                <span className="ft-logo-c">
                  <img src={site.footerLogo || "/assets/Image/FooterLogo.jpg"} alt="SODFA" aria-hidden="true" />
                </span>
                <span>
                  <span className="nm">{site.brandName}</span>
                  <span className="tg">{site.tagline}</span>
                </span>
              </Link>
              <p>تركيبة طبيعية متكاملة من أربعة زيوت نادرة، صُنعت بعناية لتعيد لشعرك كثافته ولمعانه — من الجذور حتى الأطراف.</p>
              <div className="social-row" data-page="socialIcons">
                <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <InstagramSVG />
                </a>
                <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookSVG />
                </a>
              </div>
            </div>

            {/* Quick Links — dynamic per page */}
            <div className="ft-col rv" data-d="80">
              <h4>روابط سريعة</h4>
              <ul className="ft-links">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, l.href)}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button onClick={handleContact}>تواصلي معنا</button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="ft-col ft-contact rv" data-d="160" data-page="contact">
              <h4>تواصلي معنا</h4>
              <ul>
                <li>
                  <em>📱</em>
                  <span>
                    واتساب:{" "}
                    <a href={`https://wa.me/${site.whatsappStore}`} target="_blank" rel="noopener" dir="ltr">
                      {site.phoneDisplay}
                    </a>
                  </span>
                </li>
                <li>
                  <em>📞</em>
                  <span>
                    الهاتف:{" "}
                    <a href={`tel:${site.phoneTel}`} dir="ltr">
                      {site.phoneDisplay}
                    </a>
                  </span>
                </li>
                <li>
                  <em>📍</em>
                  <span>
                    العنوان: <span className="addr">{site.address}</span>
                  </span>
                </li>
              </ul>
              <button className="msg-btn" onClick={handleContact}>
                ✉ أو أرسلي رسالة مباشرة
              </button>
            </div>

            {/* Newsletter */}
            <div className="ft-col rv" data-d="240" data-page="newsletter">
              <h4>نشرة البريد</h4>
              <p className="nl-txt">اشتركي لتصلك أحدث العروض والمنتجات الجديدة</p>
              <form className="nl-form" onSubmit={handleNewsletter}>
                <input type="email" placeholder="بريدك الإلكتروني" required />
                <button type="submit" className="nl-btn">
                  {btnLabel}
                </button>
              </form>
              <div className="trust-badges">
                <span>
                  <i />
                  توصيل آمن
                </span>
                <span>
                  <i />
                  منتجات طبيعية
                </span>
                <span>
                  <i />
                  دعم على واتساب
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="ft-bottom">
            <p className="cpy">
              © 2026 <b>SODFA</b>. جميع الحقوق محفوظة <span style={{ display: "inline-block" }}> 🇲🇦 صنع بحب في المغرب</span>
            </p>
            <div className="pay-wrap">
              <span>دفع آمن</span>
              <div className="pay-chips">
                <span>VISA</span>
                <span>MC</span>
                <span>COD</span>
              </div>
            </div>
            <div className="legal-links" data-page="legal">
              <button data-legal="privacy" onClick={() => handleLegal("privacy")}>
                الخصوصية
              </button>
              <i />
              <button data-legal="terms" onClick={() => handleLegal("terms")}>
                الشروط
              </button>
              <i />
              <button data-legal="cookies" onClick={() => handleLegal("cookies")}>
                الكوكيز
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Fallback legal modal for store pages without external handler */}
      {activeLegal && (
        <div className="modal open" role="dialog" aria-modal="true" aria-label="معلومات قانونية">
          <div className="ovl" onClick={() => setLocalLegal(null)} />
          <div className="modal-box legal-box">
            <button className="m-close" onClick={() => setLocalLegal(null)} aria-label="إغلاق">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <h3>{activeLegal.title}</h3>
            <span className="lg-date">آخر تحديث: غشت 2026</span>
            <div className="lg-body" dangerouslySetInnerHTML={{ __html: activeLegal.body }} />
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;

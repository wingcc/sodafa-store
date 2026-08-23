"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { WhatsAppIcon } from "../common/icons";
import type { SiteConfig } from "../common/types";
import { useUI } from "@/app/contexts/UIContext";

// ── Link sets per variant ──
const HOME_LINKS = [
  { href: "#flash", label: "العروض" },
  { href: "#oils", label: "المكونات" },
  { href: "#products", label: "منتجاتنا" },
  { href: "#cases", label: "النتائج" },
  { href: "#about", label: "قصتنا" },
  { href: "#reviews", label: "آراء الزبونات" },
  { href: "#order", label: "طريقة الطلب" },
  { href: "#store", label: "المتجر" },
];

const STORE_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/store", label: "المتجر" },
  { href: "/#oils", label: "المكونات" },
  { href: "/#reviews", label: "الآراء" },
  { href: "/track-order", label: "تتبع الطلب" },
];

const HOME_MOBILE_LINKS = [
  { href: "#home", label: "الرئيسية" },
  ...HOME_LINKS,
  { href: "#faq", label: "الأسئلة الشائعة" },
];

const STORE_MOBILE_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/store", label: "المتجر" },
  { href: "/#oils", label: "المكونات" },
  { href: "/#reviews", label: "الآراء" },
  { href: "/track-order", label: "تتبع الطلب" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "#faq", label: "الأسئلة الشائعة" },
];

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

type NavbarVariant = "home" | "store" | "minimal";

interface NavbarProps {
  site?: SiteConfig;
  onOpenContact?: () => void;
  variant?: NavbarVariant;
}

function resolveVariant(pathname: string, explicit?: NavbarVariant): NavbarVariant {
  if (explicit) return explicit;
  if (pathname === "/") return "home";
  if (pathname.startsWith("/store")) return "store";
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) return "minimal";
  if (pathname.startsWith("/contact") || pathname.startsWith("/track-order")) return "store";
  return "store";
}

export function Navbar({ site: siteProp = DEFAULT_SITE, onOpenContact = () => {}, variant }: NavbarProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { openSearch, openCart, cartItems } = useUI();
  const activeVariant = resolveVariant(pathname, variant);

  const [site, setSite] = useState<SiteConfig>(siteProp);
  useEffect(() => {
    if (siteProp !== DEFAULT_SITE) setSite(siteProp);
  }, [siteProp]);
  useEffect(() => {
    if (siteProp !== DEFAULT_SITE) return;
    let cancelled = false;
    (async () => {
      try {
        const { loadPublicConfig } = await import("@/lib/public-content");
        const cfg = await loadPublicConfig();
        if (!cancelled && cfg.site) setSite(cfg.site);
      } catch {
        try {
          const r = await fetch("/json/config.json");
          const data = await r.json();
          if (!cancelled && data.site) setSite((prev) => ({ ...prev, ...data.site }));
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteProp]);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;
  const closeMenu = () => setMenuOpen(false);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // On store/minimal pages navigate to /contact instead of modal
    if (activeVariant !== "home") {
      router.push("/contact");
      closeMenu();
      return;
    }
    onOpenContact();
    closeMenu();
  };

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Hash links like "#oils" or "/#oils" — handle cross-page navigation
    const isHash = href.startsWith("#") || href.startsWith("/#");
    if (!isHash) return;
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : href;
    if (pathname !== "/" && href.startsWith("#")) {
      e.preventDefault();
      router.push(`/${hash}`);
      closeMenu();
      return;
    }
    if (pathname !== "/" && href.startsWith("/#")) {
      // Already absolute — let Next handle, but close menu
      closeMenu();
      return;
    }
    // On home page, smooth scroll
    if (hash && pathname === "/") {
      e.preventDefault();
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      closeMenu();
    }
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Minimal variant: logo + back to store/home
  if (activeVariant === "minimal") {
    return (
      <nav id="nav" className={scrolled ? "scrolled" : ""}>
        <div className="wrap nav-in">
          <Link className="logo has-logo" href="/" aria-label="SODFA">
            <img src={site.NavbarLogo} alt="SODFA" aria-hidden="true" />
          </Link>
          <div className="nav-links">
            <Link href="/store">المتجر</Link>
            <Link href="/contact">تواصلي معنا</Link>
          </div>
          <Link className="btn btn-main nav-cta" href={waUrl} target="_blank" rel="noopener">
            <WhatsAppIcon size={17} />
            واتساب
          </Link>
        </div>
      </nav>
    );
  }

  const links = activeVariant === "home" ? HOME_LINKS : STORE_LINKS;
  const mobileLinks = activeVariant === "home" ? HOME_MOBILE_LINKS : STORE_MOBILE_LINKS;

  return (
    <nav id="nav" className={scrolled ? "scrolled" : ""}>
      <div className="wrap nav-in">
        <Link className="logo has-logo" href="/" aria-label="SODFA">
          <img src={site.NavbarLogo} alt="SODFA" aria-hidden="true" />
        </Link>

        <div className="nav-links">
          {links.map((link) =>
            link.href.startsWith("/") || link.href.startsWith("#") ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleHashClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, link.href)}
              >
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            )
          )}
          {activeVariant === "home" ? (
            <button className="nav-plain" onClick={handleContactClick}>
              تواصلي معنا
            </button>
          ) : (
            <Link href="/contact">تواصلي معنا</Link>
          )}
        </div>

        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Store variant: Search + Cart */}
          {activeVariant === "store" && (
            <>
              <button
                aria-label="بحث"
                onClick={openSearch}
                className="nav-icon-btn"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1.5px solid var(--line)",
                  background: "var(--card)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-3.5-3.5" />
                </svg>
              </button>
              <button
                aria-label="سلة التسوق"
                onClick={openCart}
                className="nav-icon-btn"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1.5px solid var(--line)",
                  background: "var(--card)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6h15l-1.5 9h-13z" />
                  <path d="M6 6L5 2H2" />
                  <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      background: "var(--brand)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: "grid",
                      placeItems: "center",
                      padding: "0 4px",
                      lineHeight: 1,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
          <a className="btn btn-main nav-cta" href={waUrl} target="_blank" rel="noopener">
            <WhatsAppIcon size={17} />
            تواصل واتساب
          </a>
        </div>

        <button
          className={`burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
          id="burger"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`m-menu${menuOpen ? " open" : ""}`} id="mMenu">
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => {
              handleHashClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, link.href);
              closeMenu();
            }}
          >
            {link.label}
          </Link>
        ))}
        <button onClick={handleContactClick}>تواصلي معنا ✉</button>
        {activeVariant === "store" && (
          <>
            <button
              onClick={() => {
                openSearch();
                closeMenu();
              }}
            >
              🔍 بحث
            </button>
            <button
              onClick={() => {
                openCart();
                closeMenu();
              }}
            >
              🛒 السلة {cartCount > 0 ? `(${cartCount})` : ""}
            </button>
          </>
        )}
        <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener" onClick={closeMenu}>
          اطلبي عبر الواتساب
        </a>
      </div>
    </nav>
  );
}

export default Navbar;

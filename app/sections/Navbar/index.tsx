"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { WhatsAppIcon } from "../common/icons";
import type { SiteConfig } from "../common/types";
import { useUI } from "@/app/contexts/UIContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useStoreSettings } from "../../contexts/StoreSettingsContext";
import { LanguageDropdown } from "../../components/LanguageDropdown";

// ── Link sets per variant ──
const HOME_LINKS = [
  { href: "#flash", ar: "العروض", en: "Offers" },
  { href: "#products", ar: "منتجاتنا", en: "Products" },
  { href: "#cases", ar: "النتائج", en: "Results" },
  { href: "#about", ar: "قصتنا", en: "Our Story" },
  { href: "#order", ar: "طريقة الطلب", en: "How to Order" },
  { href: "#store", ar: "المتجر", en: "Store" },
];

const STORE_LINKS = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/store", ar: "المتجر", en: "Store" },
  { href: "/track-order", ar: "تتبع الطلب", en: "Track Order" },
];

const HOME_MOBILE_LINKS = [
  { href: "#home", ar: "الرئيسية", en: "Home" },
  ...HOME_LINKS,
];

const STORE_MOBILE_LINKS = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/store", ar: "المتجر", en: "Store" },
  { href: "/track-order", ar: "تتبع الطلب", en: "Track Order" },
  { href: "/contact", ar: "اتصل بنا", en: "Contact" },
];

// Default site config — only logo and brand name, no hardcoded contact info
const DEFAULT_SITE: SiteConfig = {
  brandName: "SODFA",
  logo: "/assets/Image/NavbarLogo.png",
  NavbarLogo: "/assets/Image/NavbarLogo.png",
  footerLogo: "/assets/Image/FooterLogo.jpg",
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
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) return "store";
  if (pathname.startsWith("/contact") || pathname.startsWith("/track-order")) return "store";
  return "store";
}

export function Navbar({ site: siteProp, onOpenContact = () => {}, variant }: NavbarProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { openSearch, openCart, cartItems } = useUI();
  const { locale, setLocale } = useLanguage();
  const { favorites } = useFavorites();
  const { siteConfig } = useStoreSettings();
  const isAr = locale === "ar";
  const activeVariant = resolveVariant(pathname, variant);

  // Use store settings from database, fallback to minimal default
  const site = siteConfig ?? siteProp ?? DEFAULT_SITE;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const updateViewport = () => setIsMobileView(window.innerWidth <= 768);

    handleScroll();
    updateViewport();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
            <img src={site.NavbarLogo || "/assets/Image/NavbarLogo.png"} alt="SODFA" aria-hidden="true" />
          </Link>
          <div className="nav-links">
            <Link href="/store">{isAr ? "المتجر" : "Store"}</Link>
            <Link href="/contact">{isAr ? "تواصلي معنا" : "Contact Us"}</Link>
          </div>
          {!isMobileView && (
            <a className="btn btn-main nav-cta" href={waUrl} target="_blank" rel="noopener">
              <WhatsAppIcon size={17} />
              <span className="cta-text">{isAr ? "واتساب" : "WhatsApp"}</span>
            </a>
          )}
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
          <Link href="/store" onClick={closeMenu}>{isAr ? "المتجر" : "Store"}</Link>
          <Link href="/contact" onClick={closeMenu}>{isAr ? "تواصلي معنا" : "Contact Us"}</Link>
          <Link href="/favorites" onClick={closeMenu}>
            {isAr ? "❤️ المفضلة" : locale === "fr" ? "❤️ Favoris" : "❤️ Favorites"}
            {favorites.length > 0 && ` (${favorites.length})`}
          </Link>
          <button onClick={() => { setLocale("ar"); closeMenu(); }}>
            🇲🇦 {isAr ? "العربية" : locale === "fr" ? "Arabe" : "Arabic"}
          </button>
          <button onClick={() => { setLocale("fr"); closeMenu(); }}>
            🇫🇷 {isAr ? "الفرنسية" : locale === "fr" ? "Français" : "French"}
          </button>
          <button onClick={() => { setLocale("en"); closeMenu(); }}>
            🇬🇧 {isAr ? "الإنجليزية" : locale === "fr" ? "Anglais" : "English"}
          </button>
          <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener" onClick={closeMenu}>
            {isAr ? "اطبي عبر الواتساب" : "Order via WhatsApp"}
          </a>
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
          <img src={site.NavbarLogo || "/assets/Image/NavbarLogo.png"} alt="SODFA" aria-hidden="true" />
        </Link>

        <div className="nav-links">
          {links.map((link) =>
            link.href.startsWith("/") || link.href.startsWith("#") ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleHashClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, link.href)}
              >
                {isAr ? link.ar : link.en}
              </Link>
            ) : (
              <a key={link.href} href={link.href}>
                {isAr ? link.ar : link.en}
              </a>
            )
          )}
          {activeVariant === "home" ? (
            <button className="nav-plain" onClick={handleContactClick}>
              {isAr ? "تواصلي معنا" : "Contact Us"}
            </button>
          ) : (
            <Link href="/contact">{isAr ? "تواصلي معنا" : "Contact Us"}</Link>
          )}
        </div>

        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Store variant: Favorites + Language + Search + Cart */}
          {activeVariant === "store" && (
            <>
              {/* Language Dropdown */}
              <LanguageDropdown />

              {/* Favorites */}
              <Link
                href="/favorites"
                aria-label={isAr ? "المفضلة" : "Favorites"}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites.length > 0 ? "var(--brand)" : "none"} stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {favorites.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      background: "var(--brand)",
                      color: "#fff",
                      fontSize: 10,
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
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Search */}
              <button
                aria-label={isAr ? "بحث" : "Search"}
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

              {/* Cart */}
              <button
                aria-label={isAr ? "سلة التسوق" : "Cart"}
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
                    className="absolute flex items-center justify-center"
                    style={{
                      top: -5,
                      right: -5,
                      minWidth: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "0 5px",
                      lineHeight: 1,
                      border: "2px solid var(--card)",
                    }}
                  >
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: "#ef4444",
                        opacity: 0.5,
                      }}
                    />
                    <span className="relative z-10">{cartCount}</span>
                  </span>
                )}
              </button>
            </>
          )}
          {!isMobileView && (
            <a className="btn btn-main nav-cta" href={waUrl} target="_blank" rel="noopener">
              <WhatsAppIcon size={17} />
              <span className="cta-text">{isAr ? "تواصل واتساب" : "WhatsApp"}</span>
            </a>
          )}
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
            {isAr ? link.ar : link.en}
          </Link>
        ))}
        <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener" onClick={closeMenu}>
          {isAr ? "اطبي عبر الواتساب" : "Order via WhatsApp"}
        </a>
      </div>
    </nav>
  );
}

export default Navbar;

"use client";
import React, { useState, useEffect } from "react";
import { WhatsAppIcon, InstagramSVG, FacebookSVG } from "../common/icons";
import type { SiteConfig } from "../common/types";

const NAV_LINKS = [
  { href: "#flash",    label: "العروض" },
  { href: "#oils",     label: "المكونات" },
  { href: "#products", label: "منتجاتنا" },
  { href: "#cases",    label: "النتائج" },
  { href: "#about",    label: "قصتنا" },
  { href: "#reviews",  label: "آراء الزبونات" },
  { href: "#order",    label: "طريقة الطلب" },
  { href: "#store",    label: "المتجر" },
];

const MOBILE_LINKS = [
  { href: "#home",     label: "الرئيسية" },
  ...NAV_LINKS,
  { href: "#faq",      label: "الأسئلة الشائعة" },
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

interface NavbarProps {
  site?: SiteConfig;
  onOpenContact?: () => void;
}

export function Navbar({ site = DEFAULT_SITE, onOpenContact = () => {} }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;
  const closeMenu = () => setMenuOpen(false);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenContact();
    closeMenu();
  };

  return (
    <nav id="nav" className={scrolled ? "scrolled" : ""}>
      <div className="wrap nav-in">
        <a className="logo has-logo" href="#home" aria-label="SODFA">
          <img src={site.NavbarLogo} alt="SODFA" aria-hidden="true" />
        </a>

        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <button className="nav-plain" onClick={handleContactClick}>تواصلي معنا</button>
        </div>

        <a className="btn btn-main nav-cta" href={waUrl} target="_blank" rel="noopener">
          <WhatsAppIcon size={17} />
          تواصل واتساب
        </a>

        <button
          className={`burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
          id="burger"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`m-menu${menuOpen ? " open" : ""}`} id="mMenu">
        {MOBILE_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
        ))}
        <button onClick={handleContactClick}>تواصلي معنا ✉</button>
        <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener" onClick={closeMenu}>
          اطلبي عبر الواتساب
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
"use client";
import React, { useState } from "react";
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

interface FooterProps {
  site?: SiteConfig;
  legal?: LegalConfig;
  onOpenContact?: () => void;
  onOpenLegal?: (key: string) => void;
  showToast?: (msg: string) => void;
}

const QUICK_LINKS = [
  { href: "#home",     label: "الرئيسية" },
  { href: "#products", label: "منتجاتنا" },
  { href: "#order",    label: "كيفاش نخدمو" },
  { href: "#about",    label: "قصتنا" },
  { href: "#faq",      label: "الأسئلة الشائعة" },
];

export function Footer({
  site = DEFAULT_SITE,
  legal = DEFAULT_LEGAL,
  onOpenContact = () => {},
  onOpenLegal = () => {},
  showToast = () => {},
}: FooterProps) {
  const [btnLabel, setBtnLabel] = useState("اشتركي الآن");

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

  return (
    <footer className="site-footer" data-page="footer">
      <div className="deco d1" />
      <div className="deco d2" />
      <div className="pat" />

      <div className="wrap">
        <div className="ft-grid">
          {/* Brand */}
          <div className="ft-col ft-brand rv">
            <a className="logo-ft" href="#home" aria-label="SODFA">
              <span className="ft-logo-c">
                <img src={site.footerLogo || "/assets/Image/FooterLogo.jpg"} alt="SODFA" aria-hidden="true" />
              </span>
              <span>
                <span className="nm">{site.brandName}</span>
                <span className="tg">{site.tagline}</span>
              </span>
            </a>
            <p>تركيبة طبيعية متكاملة من أربعة زيوت نادرة، صُنعت بعناية لتعيد لشعرك كثافته ولمعانه — من الجذور حتى الأطراف.</p>
            <div className="social-row" data-page="socialIcons">
              <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram"><InstagramSVG /></a>
              <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook"><FacebookSVG /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="ft-col rv" data-d="80">
            <h4>روابط سريعة</h4>
            <ul className="ft-links">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}><a href={l.href}>{l.label}</a></li>
              ))}
              <li><button onClick={onOpenContact}>تواصلي معنا</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="ft-col ft-contact rv" data-d="160" data-page="contact">
            <h4>تواصلي معنا</h4>
            <ul>
              <li>
                <em>📱</em>
                <span>واتساب: <a href={`https://wa.me/${site.whatsappStore}`} target="_blank" rel="noopener" dir="ltr">{site.phoneDisplay}</a></span>
              </li>
              <li>
                <em>📞</em>
                <span>الهاتف: <a href={`tel:${site.phoneTel}`} dir="ltr">{site.phoneDisplay}</a></span>
              </li>
              <li>
                <em>📍</em>
                <span>العنوان: <span className="addr">{site.address}</span></span>
              </li>
            </ul>
            <button className="msg-btn" onClick={onOpenContact}>✉ أو أرسلي رسالة مباشرة</button>
          </div>

          {/* Newsletter */}
          <div className="ft-col rv" data-d="240" data-page="newsletter">
            <h4>نشرة البريد</h4>
            <p className="nl-txt">اشتركي لتصلك أحدث العروض والمنتجات الجديدة</p>
            <form className="nl-form" onSubmit={handleNewsletter}>
              <input type="email" placeholder="بريدك الإلكتروني" required />
              <button type="submit" className="nl-btn">{btnLabel}</button>
            </form>
            <div className="trust-badges">
              <span><i />توصيل آمن</span>
              <span><i />منتجات طبيعية</span>
              <span><i />دعم على واتساب</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ft-bottom">
          <p className="cpy">
            © 2026 <b>SODFA</b>. جميع الحقوق محفوظة{" "}
            <span style={{ display: "inline-block" }}> 🇲🇦 صنع بحب في المغرب</span>
          </p>
          <div className="pay-wrap">
            <span>دفع آمن</span>
            <div className="pay-chips">
              <span>VISA</span><span>MC</span><span>COD</span>
            </div>
          </div>
          <div className="legal-links" data-page="legal">
            <button data-legal="privacy" onClick={() => onOpenLegal("privacy")}>الخصوصية</button><i />
            <button data-legal="terms" onClick={() => onOpenLegal("terms")}>الشروط</button><i />
            <button data-legal="cookies" onClick={() => onOpenLegal("cookies")}>الكوكيز</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
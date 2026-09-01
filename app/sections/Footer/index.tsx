"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { InstagramSVG, FacebookSVG } from "../common/icons";
import type { SiteConfig, LegalConfig } from "../common/types";
import { useLanguage } from "../../contexts/LanguageContext";
import LegalModal from "../common/LegalModal";

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
  { href: "#home", ar: "الرئيسية", fr: "Accueil", en: "Home" },
  { href: "#products", ar: "منتجاتنا", fr: "Produits", en: "Products" },
  { href: "#order", ar: "كيفاش نخدمو", fr: "Comment ça marche", en: "How it Works" },
  { href: "#about", ar: "قصتنا", fr: "Notre histoire", en: "Our Story" },
  { href: "#faq", ar: "الأسئلة الشائعة", fr: "FAQ", en: "FAQ" },
];

const STORE_LINKS = [
  { href: "/", ar: "الرئيسية", fr: "Accueil", en: "Home" },
  { href: "/store", ar: "المتجر", fr: "Boutique", en: "Store" },
  { href: "/favorites", ar: "المفضلة", fr: "Favoris", en: "Favorites" },
  { href: "/track-order", ar: "تتبع الطلب", fr: "Suivre la commande", en: "Track Order" },
  { href: "/contact", ar: "اتصل بنا", fr: "Contactez-nous", en: "Contact Us" },
];

function resolveVariant(pathname: string, explicit?: FooterVariant): FooterVariant {
  if (explicit) return explicit;
  if (pathname === "/") return "home";
  if (pathname.startsWith("/store")) return "store";
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) return "store";
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
  const { locale } = useLanguage();
  // Homepage locked to Arabic — all homepage data is Arabic-only for now
  const isAr = pathname === "/" ? true : locale === "ar";
  const isFr = pathname === "/" ? false : locale === "fr";
  const t = (ar: string, fr: string, en: string) => isAr ? ar : isFr ? fr : en;
  const activeVariant = resolveVariant(pathname, variant);
  const [localLegal, setLocalLegal] = useState<string | null>(null);
  const [fetchedSite, setFetchedSite] = useState<SiteConfig>(DEFAULT_SITE);
  const [fetchedLegal, setFetchedLegal] = useState<LegalConfig>(DEFAULT_LEGAL);
  const [storeLegal, setStoreLegal] = useState<Record<string, { title: string; body: string }>>({});
  const btnLabel = t("اشتركي الآن", "S'abonner", "Subscribe Now");

  const site = siteProp !== DEFAULT_SITE ? siteProp : fetchedSite;
  // Prefer Store Content (content_pages) over legacy legal config — editable in Dashboard → Store Content
  const LEGAL_SLUG_MAP: Record<string, string> = { privacy: 'privacy-policy', terms: 'terms', cookies: 'cookies' };
  const legal = { ...(legalProp && Object.keys(legalProp).length > 0 ? legalProp : fetchedLegal), ...storeLegal } as LegalConfig;

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
        if (needsSite && cfg.site) setFetchedSite({ ...DEFAULT_SITE, ...cfg.site });
        if (needsLegal && cfg.legal) setFetchedLegal(cfg.legal as LegalConfig);
      } catch {
        // fallback to static json
        try {
          const r = await fetch("/json/config.json");
          const data = await r.json();
          if (cancelled) return;
          if (needsSite && data.site) setFetchedSite((prev) => ({ ...prev, ...data.site }));
          if (needsLegal && data.legal) setFetchedLegal(data.legal);
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteProp, legalProp]);

  // Fetch Store Content pages for footer popups — uses Store Info slugs (editable in Dashboard → Store Management → Settings → Legal Pages)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const privacySlug = (site as any).privacyPolicySlug || LEGAL_SLUG_MAP.privacy;
        const termsSlug = (site as any).termsSlug || LEGAL_SLUG_MAP.terms;
        const cookiesSlug = (site as any).cookiesSlug || LEGAL_SLUG_MAP.cookies;
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
        // Fallback bulk for any missing
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
              // also support legacy direct keys
              for (const row of json.data as any[]) {
                const slug = String(row.slug ?? '');
                if (['privacy', 'terms', 'cookies'].includes(slug) && !map[slug]) {
                  map[slug] = { title: String(row.name ?? ''), body: String(row.content ?? '') };
                }
              }
            }
          } catch {}
        }
        if (!cancelled && Object.keys(map).length) setStoreLegal((prev) => ({ ...prev, ...map }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [site]);

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

  const handleLegal = async (key: string) => {
    if (onOpenLegal) {
      onOpenLegal(key);
      return;
    }
    setLocalLegal(key);
    // Always fetch fresh from Store Content (content_pages) so popup matches what was edited in Dashboard
    const slugMap: Record<string, string> = {
      privacy: (site as any).privacyPolicySlug || LEGAL_SLUG_MAP.privacy,
      terms: (site as any).termsSlug || LEGAL_SLUG_MAP.terms,
      cookies: (site as any).cookiesSlug || LEGAL_SLUG_MAP.cookies,
    };
    const slug = slugMap[key];
    if (!slug) return;
    try {
      const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setStoreLegal((prev) => ({ ...prev, [key]: { title: String(json.data.name ?? ''), body: String(json.data.content ?? '') } }));
      }
    } catch {}
  };

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector("input") as HTMLInputElement;
    if (input?.value) {
      // Send notification to admin
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          title: 'New newsletter subscriber',
          message: `${input.value} has subscribed to the newsletter.`,
          priority: 'low',
        }),
      }).catch(() => {});

      const subscribedLabel = t("✓ تم الاشتراك", "✓ Abonné", "✓ Subscribed");
      const button = (e.currentTarget as HTMLFormElement).querySelector("button") as HTMLButtonElement | null;

      showToast(t("تم اشتراكك في النشرة البريدية بنجاح 🌿", "Abonné avec succès à la newsletter 🌿", "Successfully subscribed to our newsletter 🌿"));

      if (button) {
        button.textContent = subscribedLabel;
      }

      setTimeout(() => {
        if (button) {
          button.textContent = t("اشتركي الآن", "S'abonner", "Subscribe Now");
        }
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
              <p>{t("تركيبة طبية متكاملة من أربعة زيوت نادرة، صُنعت بعناية لتعيد لشعرك كثافته ولمعانه  من الجذور حتى الأطراف.", "Une formule naturelle complète de quatre huiles rares, soigneusement élaborée pour restaurer le volume et l'éclat de vos cheveux — des racines aux pointes.", "A complete natural formula of four rare oils, carefully crafted to restore your hair's volume and shine — from roots to ends.")}</p>
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
              <h4>{t("روابط سريعة", "Liens rapides", "Quick Links")}</h4>
              <ul className="ft-links">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, l.href)}>
                      {isAr ? l.ar : isFr ? l.fr : l.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="ft-col ft-contact rv" data-d="160" data-page="contact">
              <h4>{t("تواصلي معنا", "Contactez-nous", "Contact Us")}</h4>
              <ul>
                <li>
                  <em>📱</em>
                  <span>
                    {t("واتساب:", "WhatsApp:", "WhatsApp:")}{" "}
                    <a href={`https://wa.me/${site.whatsappStore}`} target="_blank" rel="noopener" dir="ltr">
                      {site.phoneDisplay}
                    </a>
                  </span>
                </li>
                <li>
                  <em>📞</em>
                  <span>
                    {t("الهاتف:", "Téléphone:", "Phone:")}{" "}
                    <a href={`tel:${site.phoneTel}`} dir="ltr">
                      {site.phoneDisplay}
                    </a>
                  </span>
                </li>
                <li>
                  <em>📍</em>
                  <span>
                    {t("العنوان:", "Adresse:", "Address:")} <span className="addr">{isAr ? site.address : site.addressShort}</span>
                  </span>
                </li>
              </ul>
              <button type="button" className="msg-btn" onClick={handleContact}>
                {t("✉ أو أرسلي رسالة مباشرة", "✉ Ou envoyez-nous un message", "✉ Or send us a message")}
              </button>
            </div>

            {/* Newsletter */}
            <div className="ft-col rv" data-d="240" data-page="newsletter">
              <h4>{t("نشرة البريد", "Newsletter", "Newsletter")}</h4>
              <p className="nl-txt">{t("اشتركي لتصلك أحدث العروض والمنتجات الجديدة", "Abonnez-vous pour recevoir les dernières offres et produits", "Subscribe to get the latest deals and new products")}</p>
              <form className="nl-form" onSubmit={handleNewsletter}>
                <input type="email" placeholder={t("بريدك الإلكتروني", "Votre email", "Your email")} required />
                <button type="submit" className="nl-btn">
                  {btnLabel}
                </button>
              </form>
              <div className="trust-badges">
                <span>
                  <i />
                  {t("توصيل آمن", "Livraison sécurisée", "Safe Delivery")}
                </span>
                <span>
                  <i />
                  {t("منتجات طبيعية", "Produits naturels", "Natural Products")}
                </span>
                <span>
                  <i />
                  {t("دعم على واتساب", "Support WhatsApp", "WhatsApp Support")}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="ft-bottom">
            <p className="cpy">
              © 2026 <b>SODFA</b>. {t("جميع الحقوق محفوظة", "Tous droits réservés", "All rights reserved")} <span style={{ display: "inline-block" }}> 🇲🇦 {t("صنع بحب في المغرب", "Fait avec amour au Maroc", "Made with love in Morocco")}</span>
            </p>

            <div className="pay-wrap">
              <span>{t("دفع آمن", "Paiement sécurisé", "Secure Payment")}</span>
              <div className="pay-chips">
                <span>VISA</span>
                <span>MC</span>
                <span>COD</span>
              </div>
            </div>
            <div className="legal-links" data-page="legal">
              <button data-legal="privacy" onClick={() => handleLegal("privacy")}>
                {t("الخصوصية", "Confidentialité", "Privacy")}
              </button>
              <i />
              <button data-legal="terms" onClick={() => handleLegal("terms")}>
                {t("الشروط", "Conditions", "Terms")}
              </button>
              <i />
              <button data-legal="cookies" onClick={() => handleLegal("cookies")}>
                {t("الكوكيز", "Cookies", "Cookies")}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal modal — beautiful, editor-grade, with polished scroll */}
      {activeLegal && (
        <LegalModal
          title={activeLegal.title}
          body={activeLegal.body}
          updatedAt="غشت 2026"
          onClose={() => setLocalLegal(null)}
        />
      )}
    </>
  );
}

export default Footer;

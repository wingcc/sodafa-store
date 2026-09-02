"use client";

import { Home, LayoutGrid, Phone } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useStoreSettings } from "../../contexts/StoreSettingsContext";
import { ContactSection } from "../../sections/ContactSection";
import { StoreBreadcrumb } from "../../components/StoreBreadcrumb";

// Default site config — only logo and brand name, no hardcoded contact info
const DEFAULT_SITE = {
  brandName: "SODFA",
  logo: "/assets/Image/NavbarLogo.png",
  NavbarLogo: "/assets/Image/NavbarLogo.png",
  footerLogo: "/assets/Image/FooterLogo.jpg",
};

export default function ContactPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const isFr = locale === "fr";
  const tr = (ar: string, fr: string, en: string) => (isAr ? ar : isFr ? fr : en);
  const { siteConfig } = useStoreSettings();
  const site = siteConfig ?? DEFAULT_SITE;

  return (
    <main className="flex-1 bg-[#FCFBF7]" dir={isAr ? "rtl" : "ltr"}>
      <div className="border-b border-[rgba(23,64,47,.06)] bg-white/70 backdrop-blur-[8px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
          <StoreBreadcrumb
            items={[
              { href: "/", label: tr("الرئيسية", "Accueil", "Home"), icon: Home },
              { href: "/store", label: tr("المتجر", "Boutique", "Store"), icon: LayoutGrid },
              { label: tr("تواصلي معنا", "Contactez-nous", "Contact us"), icon: Phone, current: true },
            ]}
          />
          <span className="hidden items-center gap-1.5 rounded-full bg-[#EAF4EE] px-2.5 py-1 text-[11px] font-extrabold text-[#1E7A57] sm:inline-flex shrink-0">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E7A57]" />
            {tr("نرد خلال ساعتين", "Réponse sous 2 heures", "We reply within 2 hours")}
          </span>
        </div>
      </div>

      <ContactSection site={site} />
    </main>
  );
}
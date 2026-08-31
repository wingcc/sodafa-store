"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";
import { ContactSection } from "../../sections/ContactSection";
import type { SiteConfig } from "../../sections/common/types";

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
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=SODFA+Salé+Morocco",
  hoursStore: "من الإثنين إلى السبت · 9:00 ص – 8:00 م",
  hoursContact: "السبت - الخميس: 9:00 ص - 6:00 م",
  instagram: "https://www.instagram.com/soodfa2026?igsh=NTJkMWt3cW42a2E0",
  facebook: "https://web.facebook.com/profile.php?id=61590754402259",
  tiktok: "https://www.tiktok.com/@karimayassmin",
};

export default function ContactPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const isFr = locale === "fr";
  const tr = (ar: string, fr: string, en: string) => (isAr ? ar : isFr ? fr : en);
  const [site, setSite] = useState<SiteConfig>(DEFAULT_SITE);

  useEffect(() => {
    fetch("/json/config.json")
      .then((r) => r.json())
      .then((d) => d.site && setSite(d.site))
      .catch(() => {});
  }, []);

  return (
    <main className="flex-1 bg-[#FCFBF7]" dir={isAr ? "rtl" : "ltr"}>
      <div className="border-b border-[rgba(23,64,47,.06)] bg-white/70 backdrop-blur-[8px]">
        <div className="mx-auto flex max-w-[1180px] items-center gap-2 px-4 py-3 text-[13px] sm:px-6 lg:px-[22px]">
          <Link href="/store" className="font-bold text-[#8AA39A] transition-colors hover:text-[#1E7A57]">
            {tr("المتجر", "Boutique", "Store")}
          </Link>
          <span className="text-[#CBD5D1]">/</span>
          <span className="font-extrabold text-[#122A20]">{tr("تواصلي معنا", "Contactez-nous", "Contact us")}</span>
          <span className={`${isAr ? "mr-auto" : "ml-auto"} hidden items-center gap-1.5 rounded-full bg-[#EAF4EE] px-2.5 py-1 text-[11px] font-extrabold text-[#1E7A57] sm:inline-flex`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E7A57]" />
            {tr("نرد خلال ساعتين", "Réponse sous 2 heures", "We reply within 2 hours")}
          </span>
        </div>
      </div>

      <ContactSection site={site} />
    </main>
  );
}
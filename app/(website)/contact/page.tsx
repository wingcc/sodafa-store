"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../sections/Navbar";
import { Footer } from "../../sections/Footer";
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
  hoursStore: "من الإثنين إلى السبت · 9:00 ص – 8:00 م",
  hoursContact: "السبت - الخميس: 9:00 ص - 6:00 م",
  instagram: "https://www.instagram.com/soodfa2026?igsh=NTJkMWt3cW42a2E0",
  facebook: "https://web.facebook.com/profile.php?id=61590754402259",
  tiktok: "https://www.tiktok.com/@karimayassmin",
};

export default function ContactPage() {
  const [site, setSite] = useState<SiteConfig>(DEFAULT_SITE);

  useEffect(() => {
    fetch("/json/config.json")
      .then((r) => r.json())
      .then((d) => d.site && setSite(d.site))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar site={site} />
      <main className="flex-1">
        <ContactSection site={site} />
      </main>
      <Footer site={site} />
    </div>
  );
}
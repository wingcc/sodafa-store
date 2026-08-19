// sections/Footer/components/FooterLinks.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

const COLORS = {
  gold: "#cda552",
  white: "#ffffff",
};

const QUICK_LINKS = {
  ar: [
    { label: "الرئيسية", href: "/" },
    { label: "منتجاتنا", href: "/flashSales" },
    { label: "كيفاش نخدمو", href: "/how-it-works" },
    { label: "قصتنا", href: "/about" },
    { label: "تواصلي معنا", href: "/contact" },
  ],
  en: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/flashSales" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export const FooterLinks = () => {
  const { locale } = useLanguage();
  const links = QUICK_LINKS[locale as keyof typeof QUICK_LINKS];

  return (
    <div className="space-y-4">
      <h4
        className="text-sm font-bold uppercase tracking-[0.2em]"
        style={{ color: COLORS.gold }}
      >
        {locale === "ar" ? "روابط سريعة" : "Quick Links"}
      </h4>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-[15px] font-medium transition-all duration-200 hover:translate-x-1 inline-block hover:brightness-110"
              style={{ color: COLORS.white }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
// sections/Footer/components/FooterBrand.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";
import { FOOTER_DATA } from "../../../constants/footer";

const COLORS = {
  gold: "#cda552",
  cream: "#f7f3ec",
  white: "#ffffff",
};

export const FooterBrand = () => {
  const { locale } = useLanguage();
  const data = FOOTER_DATA[locale as keyof typeof FOOTER_DATA];

  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-md opacity-50"
            style={{
              background: `radial-gradient(circle, ${COLORS.gold}30 0%, transparent 70%)`,
            }}
          />
          <img
            src="/assets/images/logo.png"
            alt={locale === "ar" ? "صودفا" : "Sodafa"}
            className="relative h-14 w-14 rounded-full object-cover border-2"
            style={{ borderColor: `${COLORS.gold}50` }}
          />
        </div>
        <div className="flex flex-col">
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: COLORS.white }}
          >
            {locale === "ar" ? "صودفا" : "Sodafa"}
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: COLORS.gold }}
          >
            {locale === "ar" ? "جمال · طبيعة · ثقة" : "Beauty · Nature · Trust"}
          </span>
        </div>
      </Link>

      <p
        className="text-[15px] leading-relaxed max-w-sm font-medium"
        style={{ color: COLORS.white }}
      >
        {data.brand.text}
      </p>

      {/* Social Icons */}
      <div className="flex items-center gap-3 pt-1">
        {data.social.map((social, index) => (
          <a
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            className="group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
            style={{
              background: `${COLORS.white}12`,
              border: `1px solid ${COLORS.white}15`,
            }}
          >
            <img
              src={social.iconSrc}
              alt={social.name}
              className="w-5 h-5 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                filter: "brightness(0) invert(1) opacity(0.85)",
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
};
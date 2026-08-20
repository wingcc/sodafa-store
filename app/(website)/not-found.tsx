// app/not-found.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";
import { AnnouncementBar } from "../sections/AnnouncementBar";

// Brand colors
const COLORS = {
  darkGreen: "#0a2c23",
  mediumGreen: "#0f3d31",
  gold: "#cda552",
  cream: "#f7f3ec",
  warmCream: "#ece3d4",
};

export default function NotFoundPage() {
  const { locale } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isRTL = locale === "ar";

  const content = {
    title: {
      ar: "404",
      en: "404",
    },
    heading: {
      ar: "عذراً! الصفحة غير موجودة",
      en: "Oops! Page Not Found",
    },
    description: {
      ar: "يبدو أن الصفحة التي تبحثين عنها قد تم نقلها أو حذفها أو أنها غير موجودة.",
      en: "It seems the page you're looking for has been moved, deleted, or doesn't exist.",
    },
    homeButton: {
      ar: "العودة إلى الرئيسية",
      en: "Back to Home",
    },
    storeButton: {
      ar: "زيارة المتجر",
      en: "Visit Store",
    },
    contactButton: {
      ar: "تواصل معنا",
      en: "Contact Us",
    },
    subMessage: {
      ar: "✨ يمكنك العودة إلى الصفحة الرئيسية أو تصفح متجرنا.",
      en: "✨ You can go back to the homepage or browse our store.",
    },
    decorativeText: {
      ar: "صودفا",
      en: "SODFA",
    },
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 py-20 md:py-28" style={{ background: "#f7f3ec" }}>
        <div className="max-w-4xl w-full mx-auto">
          <div className="relative">
            {/* ===== Decorative Background Elements ===== */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5"
              style={{ background: `radial-gradient(circle, ${COLORS.gold} 0%, transparent 70%)` }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-5"
              style={{ background: `radial-gradient(circle, ${COLORS.mediumGreen} 0%, transparent 70%)` }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.02]"
              style={{
                background: `radial-gradient(circle, ${COLORS.gold} 0%, transparent 70%)`,
              }}
            />

            {/* ===== Decorative Pattern ===== */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cda552' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
            />

            {/* ===== Main Content ===== */}
            <div className="relative z-10 text-center">
              {/* 404 Number with gold accent */}
              <div
                className="relative inline-block mb-6"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "scale(1)" : "scale(0.8)",
                  transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Large 404 text */}
                <div className="relative">
                  <h1
                    className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold tracking-tight leading-none select-none"
                    style={{ color: "#0a2c23" }}
                  >
                    404
                  </h1>
                  {/* Decorative gold underline */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-1.5 rounded-full"
                    style={{
                      width: "60%",
                      background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
                    }}
                  />
                </div>

                {/* Small decorative dot pattern */}
                <div className="flex justify-center gap-3 mt-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full transition-all duration-700"
                      style={{
                        background: COLORS.gold,
                        opacity: visible ? 0.15 + i * 0.05 : 0,
                        transform: visible ? "scale(1)" : "scale(0)",
                        transitionDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Heading */}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
                style={{
                  color: "#0a2c23",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s 0.15s ease, transform 0.5s 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {content.heading[locale as keyof typeof content.heading]}
              </h2>

              {/* Decorative line with gold accent */}
              <div
                className="flex items-center justify-center gap-4 my-5"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: "opacity 0.5s 0.2s ease",
                }}
              >
                <span
                  className="h-px w-12 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${COLORS.gold})` }}
                />
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: COLORS.gold }}
                />
                <span
                  className="h-px w-12 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.gold}, transparent)` }}
                />
              </div>

              {/* Description */}
              <p
                className="text-base sm:text-lg max-w-md mx-auto leading-relaxed"
                style={{
                  color: "#0a2c23CC",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s 0.25s ease, transform 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {content.description[locale as keyof typeof content.description]}
              </p>

              {/* Sub message */}
              <p
                className="text-sm mt-3"
                style={{
                  color: "#cda552",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s 0.3s ease, transform 0.5s 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {content.subMessage[locale as keyof typeof content.subMessage]}
              </p>

              {/* ===== Action Buttons ===== */}
              <div
                className="flex flex-wrap items-center justify-center gap-3 mt-8"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s 0.35s ease, transform 0.5s 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Home Button */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "#cda552",
                    color: "#0a2c23",
                    boxShadow: "0 4px 20px rgba(205, 165, 82, 0.25)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {content.homeButton[locale as keyof typeof content.homeButton]}
                </Link>

                {/* Store Button */}
                <Link
                  href="/flashSales"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 border hover:shadow-lg"
                  style={{
                    color: "#0a2c23",
                    borderColor: "#cda55240",
                    background: "transparent",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {content.storeButton[locale as keyof typeof content.storeButton]}
                </Link>

                {/* Contact Button */}
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "#0f3d31",
                    color: "#f7f3ec",
                    boxShadow: "0 4px 20px rgba(15, 61, 49, 0.25)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  {content.contactButton[locale as keyof typeof content.contactButton]}
                </Link>
              </div>

              {/* ===== Decorative Brand Text ===== */}
              <div
                className="mt-12"
                style={{
                  opacity: visible ? 0.08 : 0,
                  transition: "opacity 0.8s 0.5s ease",
                }}
              >
                <span
                  className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-widest select-none"
                  style={{
                    color: "#0a2c23",
                    letterSpacing: "0.15em",
                  }}
                >
                  {content.decorativeText[locale as keyof typeof content.decorativeText]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
// app/layout.tsx — Minimal root layout
// Contains only what genuinely needs to exist across the ENTIRE app:
//   - HTML structure
//   - Global CSS (fonts, tokens, base resets)
//   - Global Toast infrastructure
//
// Website-specific providers, RTL, and website CSS live in app/(website)/layout.tsx
// Dashboard-specific providers and CSS live in app/dashboard/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider, ToastSettingsProvider } from '@/lib/toast';
import Preloader from './components/common/Preloader';

export const metadata: Metadata = {
  title: "SODFA Store — 100% Natural Moroccan Beauty & Skincare",
  description: "سيروم SODFA الطبيعي بأربعة زيوت نادرة لعلاج تساقط الشعر وتغذية البصيلات. نتائج ملموسة خلال شهر.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif' }}>
        <Preloader />
        <ToastSettingsProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ToastSettingsProvider>
      </body>
    </html>
  );
}

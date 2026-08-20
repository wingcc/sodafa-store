// app/layout.tsx — Minimal root layout
// Contains only what genuinely needs to exist across the ENTIRE app:
//   - HTML structure
//   - Global CSS (fonts, tokens, base resets)
//   - Geist fonts
//   - Global Toast infrastructure
//
// Website-specific providers, RTL, and website CSS live in app/(website)/layout.tsx
// Dashboard-specific providers and CSS live in app/dashboard/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider, ToastSettingsProvider } from '@/lib/toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SODFA Store — 100% Natural Moroccan Beauty & Skincare",
  description: "Discover luxury Moroccan hair serums, argan oils, and natural skincare products with Cash on Delivery across Morocco.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastSettingsProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ToastSettingsProvider>
      </body>
    </html>
  );
}

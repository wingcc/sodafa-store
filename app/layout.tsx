// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastProvider, ToastSettingsProvider } from '@/lib/toast'
 
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
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <ToastSettingsProvider>
          <ToastProvider>
            <Providers>{children}</Providers>
          </ToastProvider>
        </ToastSettingsProvider>
         
      </body>
    </html>
  );
}

// app/(website)/layout.tsx
// Website-specific layout: Landing Page + Store
// Adds RTL, website providers, modals, and website CSS.
// The Dashboard is NOT affected by anything in this file.

import './website.css';
import { UIProvider } from '../contexts/UIContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '@/lib/theme';
import { CartDrawer } from '../components/CartDrawer';
import { SearchDialog } from '../components/SearchDialog';
import { CheckoutFormModal } from '../components/CheckoutFormModal';
// NOTE: no FloatingWhatsappButton here — the landing page's MainContent renders
// its own dashboard-managed floating buttons (sections/common/FloatingButtons).
// The old component remains only for the (store) route group.

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Brand display font — same source as the original app/Resources/index.html.
          Tajawal (body font) is already @font-face'd in globals.css. */}
      <link
        href="https://cdn.jsdelivr.net/npm/@fontsource/el-messiri@5.0.13/arabic-400.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/@fontsource/el-messiri@5.0.13/arabic-500.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/@fontsource/el-messiri@5.0.13/arabic-600.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/@fontsource/el-messiri@5.0.13/arabic-700.css"
        rel="stylesheet"
      />
      <ThemeProvider>
      <UIProvider>
        <LanguageProvider>
          <div dir="rtl" lang="ar" className="flex flex-col min-h-screen">
            {children}
            <CartDrawer />
            <SearchDialog />
            <CheckoutFormModal />
          </div>
        </LanguageProvider>
      </UIProvider>
      </ThemeProvider>
    </>
  );
}

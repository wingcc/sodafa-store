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
import { FloatingWhatsappButton } from '../components/FloatingWhatsappButton';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <UIProvider>
        <LanguageProvider>
          <div dir="rtl" lang="ar" className="flex flex-col min-h-screen">
            {children}
            <CartDrawer />
            <SearchDialog />
            <CheckoutFormModal />
            <FloatingWhatsappButton />
          </div>
        </LanguageProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

// app/(store)/layout.tsx
// Store-specific layout: Checkout, Contact, Order Confirmation, Store, Track Order
// Provides UI, Language, and Theme contexts plus store CSS.

import './store.css';
import { UIProvider } from '../contexts/UIContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '@/lib/theme';
import { CartDrawer } from '../components/CartDrawer';
import { SearchDialog } from '../components/SearchDialog';
import { CheckoutFormModal } from '../components/CheckoutFormModal';
import { FloatingWhatsappButton } from '../components/FloatingWhatsappButton';

export default function StoreLayout({
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
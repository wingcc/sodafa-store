// app/(store)/layout.tsx — SINGLE SOURCE for store chrome
// All /store, /checkout, /contact, /track-order, /order-confirmation share
// the SAME AnnouncementBar + Navbar + Footer. Pages no longer render them
// themselves — delete any per-page duplicates.

import './store.css';
import { UIProvider } from '../contexts/UIContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '@/lib/theme';
import { CartDrawer } from '../components/CartDrawer';
import { SearchDialog } from '../components/SearchDialog';
import { CheckoutFormModal } from '../components/CheckoutFormModal';
import { FloatingWhatsappButton } from '../components/FloatingWhatsappButton';
import { AnnouncementBar } from '../sections/AnnouncementBar';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';



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
            <AnnouncementBar />
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
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
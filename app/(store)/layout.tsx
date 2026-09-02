// app/(store)/layout.tsx — SINGLE SOURCE for store chrome
// All /store, /checkout, /contact, /track-order, /order-confirmation share
// the SAME AnnouncementBar + Navbar + Footer. Pages no longer render them
// themselves — delete any per-page duplicates.

import './store.css';
import { UIProvider } from '../contexts/UIContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { StoreSettingsProvider } from '../contexts/StoreSettingsContext';
import { ThemeProvider } from '@/lib/theme';
import { DirectionWrapper } from '../components/DirectionWrapper';
import { CartDrawer } from '../components/CartDrawer';
import { SearchDialog } from '../components/SearchDialog';
 
import { FloatingWhatsappButton } from '../components/FloatingWhatsappButton';
import { AnnouncementBar } from '../sections/AnnouncementBar';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import { StoreToastProvider } from './components/StoreToastContext';
import AnalyticsProvider from './components/AnalyticsProvider';
import CookieConsentBanner from './components/CookieConsentBanner';



export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <UIProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <StoreSettingsProvider>
              <StoreToastProvider>
                <AnalyticsProvider>
                  <DirectionWrapper>
                    <AnnouncementBar />
                    <Navbar />
                    <div className="flex-1 flex flex-col">{children}</div>
                    <Footer />
                    <CartDrawer />
                    <SearchDialog />
                     
                    <FloatingWhatsappButton />
                    <CookieConsentBanner />
                  </DirectionWrapper>
                </AnalyticsProvider>
              </StoreToastProvider>
            </StoreSettingsProvider>
          </FavoritesProvider>
        </LanguageProvider>
      </UIProvider>
    </ThemeProvider>
  );
}
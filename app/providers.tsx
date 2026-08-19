// app/providers.tsx
"use client";

import { usePathname } from "next/navigation";
import { UIProvider } from "./contexts/UIContext";
import { ThemeProvider } from '@/lib/theme';
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartDrawer } from "./components/CartDrawer";
import { SearchDialog } from "./components/SearchDialog";
import { CheckoutFormModal } from "./components/CheckoutFormModal";
import { FloatingWhatsappButton } from "./components/FloatingWhatsappButton";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <UIProvider>
      <ThemeProvider>
        <LanguageProvider>
          {children}
          {!isDashboard && (
            <>
              <CartDrawer />
              <SearchDialog />
              <CheckoutFormModal />
              <FloatingWhatsappButton />
            </>
          )}
        </LanguageProvider>
      </ThemeProvider>
    </UIProvider>
  );
}

// app/dashboard/layout.tsx
// Independent Dashboard layout boundary.
// Imports dashboard-only CSS, sets LTR direction, handles auth.
// Nothing from this layout leaks into the website (Landing Page / Store).

'use client';

import './dashboard.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from './components/layout/Sidebar';
import { usePreferencesStore } from './store/usePreferencesStore';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider';
import { PALETTES, getPalette } from '@/lib/theme/palettes';
import { applyDashboardPalettes } from '@/lib/theme/cssVariables';

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const prefTheme = usePreferencesStore((s) => s.theme);
  const setPrefTheme = usePreferencesStore((s) => s.setTheme);
  const language = usePreferencesStore((s) => s.language);
  const lightPaletteId = usePreferencesStore((s) => s.lightPaletteId);
  const darkPaletteId = usePreferencesStore((s) => s.darkPaletteId);
  const { theme: providerTheme, setTheme: setProviderTheme, updateColors } = useTheme();

  // Sync ThemeProvider <-> Preferences store (unified dashboard theme)
  // Preferences is the source of truth for dashboard; provider follows it
  useEffect(() => {
    if (providerTheme !== prefTheme) {
      setProviderTheme(prefTheme);
    }
  }, [prefTheme, providerTheme, setProviderTheme]);

  // Keep html.dark + dashboard-root.dark in sync with prefTheme (single source of truth for dashboard)
  useEffect(() => {
    const root = document.documentElement;
    const dashRoot = document.querySelector('.dashboard-root') as HTMLElement | null;
    if (prefTheme === 'dark') {
      root.classList.add('dark');
      dashRoot?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      dashRoot?.classList.remove('dark');
    }
  }, [prefTheme]);

  // Apply palette-aware dashboard surfaces + brand colors
  useEffect(() => {
    const lightPal = getPalette(lightPaletteId);
    const darkPal = getPalette(darkPaletteId);
    applyDashboardPalettes(lightPal, darkPal);
    const targetBrand = prefTheme === 'dark' ? darkPal.brand : lightPal.brand;
    // Avoid overwriting fine-tuned colors unless palette truly changed?
    // For now, sync brand to palette's brand for the active mode
    updateColors(targetBrand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightPaletteId, darkPaletteId, prefTheme]);

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthenticated(false);
          router.replace('/login?returnUrl=/dashboard');
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Dashboard auth check error:', err);
        setIsAuthenticated(false);
        router.replace('/login?returnUrl=/dashboard');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        router.replace('/login?returnUrl=/dashboard');
      } else if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div
        className="dashboard-root flex h-screen w-screen items-center justify-center"
        dir="ltr"
        style={{
          background: 'var(--color-darkGreen, #061c16)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4"
            style={{ borderColor: 'var(--color-gold, #d97706)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium text-white/80">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  return (
    <div className={`dashboard-root flex h-screen ${prefTheme === 'dark' ? 'dark' : ''}`} dir={dir} lang={language} style={{ background: prefTheme === 'dark' ? 'var(--dashboard-bg-dark, #0f1411)' : 'var(--dashboard-bg-light, #f8f6f3)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardInner>{children}</DashboardInner>
    </ThemeProvider>
  );
}

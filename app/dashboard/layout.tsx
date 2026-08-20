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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

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
          background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 50%, #061c16 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4"
            style={{ borderColor: '#cda552', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium text-white/80">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-root flex h-screen bg-[#f8f6f3]" dir="ltr" lang="en">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

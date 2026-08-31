'use client';

/**
 * SODFA STORE - Client-side Analytics Provider
 *
 * Auto-tracks page views, session lifecycle, and custom events.
 * Runs inside the store layout — invisible to users.
 */
import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────

interface AnalyticsContextValue {
  trackEvent: (eventType: string, eventData?: Record<string, unknown>) => void;
  getVisitorId: () => string | null;
  getSessionToken: () => string | null;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackEvent: () => {},
  getVisitorId: () => null,
  getSessionToken: () => null,
});

export const useAnalytics = () => useContext(AnalyticsContext);

// ─── Cookie helpers ───────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// ─── Fingerprint generation (simple, non-crypto) ──────────────

function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || '',
  ];
  // Simple hash
  let hash = 0;
  const str = components.join('|||');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'fp_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
}

function generateSessionToken(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ─── Device detection ─────────────────────────────────────────

function detectDevice(): 'desktop' | 'mobile' | 'tablet' | 'other' {
  if (typeof window === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/mobile|android.*phone|iphone/i.test(ua)) return 'mobile';
  if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

// ─── Inner provider that uses searchParams (needs Suspense) ───
function AnalyticsInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageViewIdRef = useRef<string | null>(null);
  const lastPageRef = useRef<string>('');
  const initializedRef = useRef(false);

  // Get or create consent
  const getConsent = useCallback(() => {
    const analyticsConsent = getCookie('sodfa_analytics_consent');
    const marketingConsent = getCookie('sodfa_marketing_consent');
    return {
      analytics: analyticsConsent === 'true',
      marketing: marketingConsent === 'true',
    };
  }, []);

  // Get or create fingerprint
  const getFingerprint = useCallback(() => {
    let fp = getCookie('sodfa_fp');
    if (!fp) {
      fp = generateFingerprint();
      setCookie('sodfa_fp', fp, 365);
    }
    return fp;
  }, []);

  // Get or create session token
  const getSessionToken = useCallback(() => {
    let token = getCookie('sodfa_session');
    if (!token) {
      token = generateSessionToken();
      setCookie('sodfa_session', token, 1);
    }
    return token;
  }, []);

  const getVisitorId = useCallback(() => getCookie('sodfa_visitor_id'), []);

  // ─── Initialize session on mount ────────────────────────────

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const consent = getConsent();
    if (!consent.analytics) return; // Don't track without consent

    const fingerprint = getFingerprint();
    const sessionToken = getSessionToken();
    const visitorId = getVisitorId();

    // Send initialization beacon
    const sendInit = async () => {
      try {
        const res = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'init',
            fingerprint,
            sessionToken,
            visitorId,
            pageUrl: window.location.href,
            pageTitle: document.title,
            referrer: document.referrer || undefined,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
            device: detectDevice(),
            utmSource: searchParams?.get('utm_source') || undefined,
            utmMedium: searchParams?.get('utm_medium') || undefined,
            utmCampaign: searchParams?.get('utm_campaign') || undefined,
          }),
        });

        const data = await res.json();
        if (data.visitorId) {
          setCookie('sodfa_visitor_id', data.visitorId, 365);
        }
        if (data.pageViewId) {
          pageViewIdRef.current = data.pageViewId;
        }
      } catch {
        // Silent fail — analytics should never break the store
      }
    };

    sendInit();
  }, [getConsent, getFingerprint, getSessionToken, getVisitorId, searchParams]);

  // ─── Track page views on navigation ─────────────────────────

  useEffect(() => {
    const currentPage = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (currentPage === lastPageRef.current) return;
    lastPageRef.current = currentPage;

    const consent = getConsent();
    if (!consent.analytics) return;

    const fingerprint = getFingerprint();
    const sessionToken = getSessionToken();
    const visitorId = getVisitorId();

    if (!visitorId) return; // Not initialized yet

    const sendPageView = async () => {
      try {
        // End previous page view timing
        if (pageViewIdRef.current) {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'page_leave',
              pageViewId: pageViewIdRef.current,
              fingerprint,
              sessionToken,
            }),
          }).catch(() => {});
        }

        const res = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'page_view',
            fingerprint,
            sessionToken,
            visitorId,
            pageUrl: window.location.href,
            pageTitle: document.title,
          }),
        });

        const data = await res.json();
        if (data.pageViewId) {
          pageViewIdRef.current = data.pageViewId;
        }
      } catch {
        // Silent fail
      }
    };

    sendPageView();
  }, [pathname, searchParams, getConsent, getFingerprint, getSessionToken, getVisitorId]);

  // ─── Track session end on page leave / hidden state ────────────────────────────

  useEffect(() => {
    const handlePageLeave = () => {
      const consent = getConsent();
      if (!consent.analytics) return;

      const sessionToken = getSessionToken();
      const fingerprint = getFingerprint();

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track', JSON.stringify({
          action: 'session_end',
          fingerprint,
          sessionToken,
        }));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handlePageLeave();
      }
    };

    window.addEventListener('pagehide', handlePageLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getConsent, getFingerprint, getSessionToken]);

  // ─── Track scroll depth ─────────────────────────────────────

  useEffect(() => {
    const consent = getConsent();
    if (!consent.analytics) return;

    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }
    };

    const sendScrollDepth = () => {
      if (maxScroll > 10 && pageViewIdRef.current) {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'scroll_depth',
            pageViewId: pageViewIdRef.current,
            scrollDepth: maxScroll,
            fingerprint: getFingerprint(),
            sessionToken: getSessionToken(),
          }),
        }).catch(() => {});
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', sendScrollDepth);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', sendScrollDepth);
    };
  }, [getConsent, getFingerprint, getSessionToken]);

  // ─── Public trackEvent function ─────────────────────────────

  const trackEvent = useCallback((eventType: string, eventData?: Record<string, unknown>) => {
    const consent = getConsent();
    if (!consent.analytics) return;

    const fingerprint = getFingerprint();
    const sessionToken = getSessionToken();
    const visitorId = getVisitorId();

    if (!visitorId) return;

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'event',
        fingerprint,
        sessionToken,
        visitorId,
        pageViewId: pageViewIdRef.current,
        eventType,
        eventData,
        pageUrl: window.location.href,
      }),
    }).catch(() => {});
  }, [getConsent, getFingerprint, getSessionToken, getVisitorId]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, getVisitorId, getSessionToken }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ─── Outer wrapper with Suspense (fixes useSearchParams prerender) ───
export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnalyticsInner>{children}</AnalyticsInner>
    </Suspense>
  );
}

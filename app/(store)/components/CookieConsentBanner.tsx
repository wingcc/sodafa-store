'use client';

/**
 * SODFA STORE - Cookie Consent Banner
 *
 * Shows a non-intrusive bottom banner on first visit.
 * Stores consent in cookies (sodfa_analytics_consent, sodfa_marketing_consent).
 * Visitors can change their preferences at any time.
 */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

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

const strings = {
  fr: {
    title: 'Nous utilisons des cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. Vous pouvez personnaliser vos préférences ou accepter tous les cookies.',
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    customize: 'Personnaliser',
    analytics: 'Cookies analytiques',
    analyticsDesc: 'Aident à comprendre comment les visiteurs interagissent avec le site.',
    marketing: 'Cookies marketing',
    marketingDesc: 'Utilisés pour diffuser des publicités pertinentes.',
    save: 'Enregistrer les préférences',
    close: 'Fermer',
  },
  ar: {
    title: 'نستخدم ملفات تعريف الارتباط',
    description: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور وتخصيص المحتوى. يمكنك تخصيص تفضيلاتك أو قبول جميع ملفات تعريف الارتباط.',
    acceptAll: 'قبول الكل',
    rejectAll: 'رفض الكل',
    customize: 'تخصيص',
    analytics: 'ملفات تعريف الارتباط التحليلية',
    analyticsDesc: 'تساعد في فهم كيفية تفاعل الزوار مع الموقع.',
    marketing: 'ملفات تعريف الارتباط التسويقية',
    marketingDesc: 'تُستخدم لنشر إعلانات ذات صلة.',
    save: 'حفظ التفضيلات',
    close: 'إغلاق',
  },
  en: {
    title: 'We use cookies',
    description: 'We use cookies to improve your experience, analyze traffic, and personalize content. You can customize your preferences or accept all cookies.',
    acceptAll: 'Accept all',
    rejectAll: 'Reject all',
    customize: 'Customize',
    analytics: 'Analytics cookies',
    analyticsDesc: 'Help understand how visitors interact with the site.',
    marketing: 'Marketing cookies',
    marketingDesc: 'Used to deliver relevant advertisements.',
    save: 'Save preferences',
    close: 'Close',
  },
};

export default function CookieConsentBanner() {
  const { locale } = useLanguage();
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const t = strings[locale] || strings.fr;

  useEffect(() => {
    // Only show if no consent cookie exists
    const existingConsent = getCookie('sodfa_analytics_consent');
    if (existingConsent === null) {
      // Small delay to not overwhelm on first load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookie('sodfa_analytics_consent', 'true', 365);
    setCookie('sodfa_marketing_consent', 'true', 365);
    setShow(false);
    // Reload to restart tracking with consent
    window.location.reload();
  };

  const handleRejectAll = () => {
    setCookie('sodfa_analytics_consent', 'false', 365);
    setCookie('sodfa_marketing_consent', 'false', 365);
    setShow(false);
  };

  const handleSavePreferences = () => {
    setCookie('sodfa_analytics_consent', analytics ? 'true' : 'false', 365);
    setCookie('sodfa_marketing_consent', marketing ? 'true' : 'false', 365);
    setShow(false);
    if (analytics) {
      window.location.reload();
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--color-darkGreen)',
          color: '#fff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '20px',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Title */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            margin: '0 0 8px 0',
            fontFamily: locale === 'ar' ? 'var(--font-arabic)' : 'inherit',
            direction: locale === 'ar' ? 'rtl' : 'ltr',
          }}
        >
          {t.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            margin: '0 0 16px 0',
            opacity: 0.9,
            fontFamily: locale === 'ar' ? 'var(--font-arabic)' : 'inherit',
            direction: locale === 'ar' ? 'rtl' : 'ltr',
          }}
        >
          {t.description}
        </p>

        {/* Details toggle */}
        {showDetails && (
          <div style={{ marginBottom: '16px' }}>
            {/* Analytics toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.analytics}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{t.analyticsDesc}</div>
              </div>
              <div
                onClick={(e) => { e.preventDefault(); setAnalytics(!analytics); }}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  background: analytics ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: analytics ? '20px' : '2px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </label>

            {/* Marketing toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.marketing}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{t.marketingDesc}</div>
              </div>
              <div
                onClick={(e) => { e.preventDefault(); setMarketing(!marketing); }}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  background: marketing ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: marketing ? '20px' : '2px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </label>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAcceptAll}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '10px 16px',
              background: 'var(--accent)',
              color: 'var(--color-darkGreen)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {t.acceptAll}
          </button>
          <button
            onClick={handleRejectAll}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {t.rejectAll}
          </button>
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              style={{
                flex: 1,
                minWidth: '100px',
                padding: '10px 16px',
                background: 'transparent',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t.customize}
            </button>
          )}
          {showDetails && (
            <button
              onClick={handleSavePreferences}
              style={{
                flex: 1,
                minWidth: '100px',
                padding: '10px 16px',
                background: 'var(--accent)',
                color: 'var(--color-darkGreen)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t.save}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

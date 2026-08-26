/**
 * SODFA STORE - Server-side Analytics Tracker
 *
 * Utility functions for recording visitor data.
 * Used by /api/analytics/track and potentially other server routes.
 */
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type SupabaseClient = ReturnType<typeof createServerClient>;

export interface TrackPageViewInput {
  fingerprint: string;
  sessionToken: string;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  device?: 'desktop' | 'mobile' | 'tablet' | 'other';
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceBrand?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface TrackEventInput {
  fingerprint: string;
  sessionToken: string;
  eventType: string;
  eventName?: string;
  eventData?: Record<string, unknown>;
  pageUrl?: string;
}

// ─── Fingerprint helpers ──────────────────────────────────────

function parseUserAgent(ua: string | null) {
  if (!ua) return { browser: 'Unknown', browserVersion: '', os: 'Unknown', osVersion: '', device: 'other' as const, deviceBrand: '' };

  // Device
  let device: 'desktop' | 'mobile' | 'tablet' | 'other' = 'desktop';
  if (/mobile|android.*phone|iphone/i.test(ua)) device = 'mobile';
  else if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) device = 'tablet';

  // Browser
  let browser = 'Unknown';
  let browserVersion = '';
  const browserPatterns: [RegExp, string][] = [
    [/edg[e\/]([\d.]+)/i, 'Edge'],
    [/opr[\/]([\d.]+)/i, 'Opera'],
    [/chrome\/([\d.]+)/i, 'Chrome'],
    [/firefox\/([\d.]+)/i, 'Firefox'],
    [/safari\/([\d.]+)/i, 'Safari'],
  ];
  for (const [pattern, name] of browserPatterns) {
    const match = ua.match(pattern);
    if (match) {
      browser = name;
      browserVersion = match[1] || '';
      break;
    }
  }
  // Safari special case (if no Chrome match)
  if (browser === 'Unknown' && /safari/i.test(ua)) {
    browser = 'Safari';
    const m = ua.match(/version\/([\d.]+)/i);
    browserVersion = m ? m[1] : '';
  }

  // OS
  let os = 'Unknown';
  let osVersion = '';
  if (/windows nt 10/i.test(ua)) { os = 'Windows'; osVersion = '10'; }
  else if (/windows nt 11/i.test(ua)) { os = 'Windows'; osVersion = '11'; }
  else if (/mac os x ([\d_]+)/i.test(ua)) { os = 'macOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/iphone os ([\d_]+)/i.test(ua)) { os = 'iOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/android ([\d.]+)/i.test(ua)) { os = 'Android'; osVersion = RegExp.$1; }
  else if (/linux/i.test(ua)) os = 'Linux';

  // Device brand
  let deviceBrand = '';
  if (/iphone/i.test(ua)) deviceBrand = 'Apple';
  else if (/ipad/i.test(ua)) deviceBrand = 'Apple';
  else if (/samsung/i.test(ua)) deviceBrand = 'Samsung';
  else if (/huawei/i.test(ua)) deviceBrand = 'Huawei';
  else if (/xiaomi/i.test(ua)) deviceBrand = 'Xiaomi';
  else if (/oppo/i.test(ua)) deviceBrand = 'OPPO';
  else if (/vivo/i.test(ua)) deviceBrand = 'Vivo';

  return { browser, browserVersion, os, osVersion, device, deviceBrand };
}

function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function classifyPageType(path: string): string {
  if (path === '/' || path === '') return 'home';
  if (path.startsWith('/store')) return 'store';
  if (path.startsWith('/product/') || path.startsWith('/store/')) return 'product';
  if (path.startsWith('/favorites')) return 'favorites';
  if (path.startsWith('/checkout')) return 'checkout';
  if (path.startsWith('/order-confirmation')) return 'order_confirmation';
  if (path.startsWith('/track-order')) return 'track_order';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/contact')) return 'contact';
  if (path.startsWith('/faq')) return 'faq';
  if (path.startsWith('/privacy') || path.startsWith('/terms') || path.startsWith('/cookies')) return 'legal';
  return 'other';
}

function extractPathFromUrl(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);
    return url.pathname + url.search;
  } catch {
    return pageUrl;
  }
}

// ─── Core tracking functions ──────────────────────────────────

export async function upsertVisitor(supabase: SupabaseClient, fingerprint: string, consentAnalytics: boolean, consentMarketing: boolean) {
  const { data: existing } = await supabase
    .from('visitors')
    .select('id, visitor_type')
    .eq('fingerprint', fingerprint)
    .single();

  if (existing) {
    await supabase
      .from('visitors')
      .update({ last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return { id: existing.id, isNew: false };
  }

  const { data, error } = await supabase
    .from('visitors')
    .insert({
      fingerprint,
      visitor_type: 'new',
      consent_analytics: consentAnalytics,
      consent_marketing: consentMarketing,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id, isNew: true };
}

export async function createSession(supabase: SupabaseClient, input: {
  visitorId: string;
  sessionToken: string;
  device?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceBrand?: string;
  screenWidth?: number;
  screenHeight?: number;
  referrerUrl?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
}) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      visitor_id: input.visitorId,
      session_token: input.sessionToken,
      device: input.device || 'other',
      browser: input.browser || null,
      browser_version: input.browserVersion || null,
      os: input.os || null,
      os_version: input.osVersion || null,
      device_brand: input.deviceBrand || null,
      screen_width: input.screenWidth || null,
      screen_height: input.screenHeight || null,
      referrer_url: input.referrerUrl || null,
      referrer_domain: input.referrerDomain || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
      landing_page: input.landingPage || null,
    })
    .select('id')
    .single();

  if (error) throw error;

  // Increment visitor session count
  try {
    const { data: visitorData } = await supabase
      .from('visitors')
      .select('sessions_count')
      .eq('id', input.visitorId)
      .single();
    if (visitorData) {
      await supabase.from('visitors').update({ sessions_count: visitorData.sessions_count + 1 }).eq('id', input.visitorId);
    }
  } catch {
    // Ignore — session count is non-critical
  }

  return data.id;
}

export async function recordPageView(supabase: SupabaseClient, input: {
  sessionId: string;
  visitorId: string;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  productId?: string;
  categoryId?: string;
}) {
  const pagePath = extractPathFromUrl(input.pageUrl);
  const pageType = classifyPageType(pagePath);

  const { data, error } = await supabase
    .from('page_views')
    .insert({
      session_id: input.sessionId,
      visitor_id: input.visitorId,
      page_url: input.pageUrl,
      page_path: pagePath,
      page_title: input.pageTitle || null,
      page_type: pageType,
      product_id: input.productId || null,
      category_id: input.categoryId || null,
      referrer: input.referrer || null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function recordEvent(supabase: SupabaseClient, input: {
  sessionId: string;
  visitorId: string;
  pageViewId?: string;
  eventType: string;
  eventName?: string;
  eventData?: Record<string, unknown>;
  pageUrl?: string;
}) {
  const { data, error } = await supabase
    .from('visitor_events')
    .insert({
      session_id: input.sessionId,
      visitor_id: input.visitorId,
      page_view_id: input.pageViewId || null,
      event_type: input.eventType,
      event_name: input.eventName || null,
      event_data: input.eventData || null,
      page_url: input.pageUrl || null,
    })
    .select('id')
    .single();

  if (error) throw error;

  return data.id;
}

export async function endSession(supabase: SupabaseClient, sessionToken: string) {
  await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('session_token', sessionToken);
}

export { parseUserAgent, extractDomain, classifyPageType };

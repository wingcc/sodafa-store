/**
 * SODFA STORE - Analytics Tracking API
 *
 * POST /api/analytics/track
 * Receives tracking data from the client-side provider.
 * Actions: init, page_view, page_leave, session_end, scroll_depth, event
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  upsertVisitor,
  createSession,
  recordPageView,
  recordEvent,
  endSession,
  parseUserAgent,
  extractDomain,
} from '@/lib/analytics/tracker';

interface TrackRequest {
  action: 'init' | 'page_view' | 'page_leave' | 'session_end' | 'scroll_depth' | 'event';
  fingerprint: string;
  sessionToken: string;
  visitorId?: string;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  device?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  pageViewId?: string;
  scrollDepth?: number;
  eventType?: string;
  eventData?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackRequest = await request.json();
    const { action, fingerprint, sessionToken } = body;

    if (!fingerprint || !sessionToken) {
      return NextResponse.json({ error: 'Missing fingerprint or sessionToken' }, { status: 400 });
    }

    const supabase = createServerClient();
    const ua = request.headers.get('user-agent') || '';
    const parsedUA = parseUserAgent(ua);
    const device = body.device || parsedUA.device;

    // ─── INIT: Create/update visitor and session ───────────────
    if (action === 'init') {
      const consent = { analytics: true, marketing: false }; // Consent checked on client before calling

      // Upsert visitor
      const { id: visitorId, isNew } = await upsertVisitor(supabase, fingerprint, consent.analytics, consent.marketing);

      // Create new session
      const referrerUrl = body.referrer || request.headers.get('referer') || undefined;
      const referrerDomain = extractDomain(referrerUrl || null) || undefined;

      // Parse UTM from URL if present
      let utmSource = body.utmSource;
      let utmMedium = body.utmMedium;
      let utmCampaign = body.utmCampaign;

      if (!utmSource && referrerUrl) {
        try {
          const refUrl = new URL(referrerUrl);
          utmSource = refUrl.searchParams.get('utm_source') || referrerDomain || 'direct';
          utmMedium = refUrl.searchParams.get('utm_medium') || 'referral';
          utmCampaign = refUrl.searchParams.get('utm_campaign') || undefined;
        } catch {
          utmSource = referrerDomain || 'direct';
          utmMedium = 'referral';
        }
      } else if (!utmSource) {
        utmSource = 'direct';
        utmMedium = 'none';
      }

      const sessionId = await createSession(supabase, {
        visitorId,
        sessionToken,
        device,
        browser: parsedUA.browser,
        browserVersion: parsedUA.browserVersion,
        os: parsedUA.os,
        osVersion: parsedUA.osVersion,
        deviceBrand: parsedUA.deviceBrand,
        screenWidth: body.screenWidth,
        screenHeight: body.screenHeight,
        referrerUrl,
        referrerDomain,
        utmSource,
        utmMedium,
        utmCampaign,
        landingPage: body.pageUrl,
      });

      // Record the initial page view
      const pageViewId = await recordPageView(supabase, {
        sessionId,
        visitorId,
        pageUrl: body.pageUrl || '',
        pageTitle: body.pageTitle,
        referrer: body.referrer,
      });

      return NextResponse.json({
        visitorId,
        sessionId,
        pageViewId,
        isNew,
      });
    }

    // ─── All other actions require visitorId ───────────────────
    if (!body.visitorId) {
      return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
    }

    // ─── PAGE_VIEW: Record new page view ──────────────────────
    if (action === 'page_view') {
      // Find existing session
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .is('ended_at', null)
        .single();

      if (!session) {
        // Session ended, create new one
        const sessionId = await createSession(supabase, {
          visitorId: body.visitorId,
          sessionToken,
          device: device,
          browser: parsedUA.browser,
          browserVersion: parsedUA.browserVersion,
          os: parsedUA.os,
          osVersion: parsedUA.osVersion,
          deviceBrand: parsedUA.deviceBrand,
          landingPage: body.pageUrl,
        });

        const pageViewId = await recordPageView(supabase, {
          sessionId,
          visitorId: body.visitorId,
          pageUrl: body.pageUrl || '',
          pageTitle: body.pageTitle,
        });

        return NextResponse.json({ pageViewId, sessionId });
      }

      const pageViewId = await recordPageView(supabase, {
        sessionId: session.id,
        visitorId: body.visitorId,
        pageUrl: body.pageUrl || '',
        pageTitle: body.pageTitle,
      });

      return NextResponse.json({ pageViewId });
    }

    // ─── PAGE_LEAVE: Update time on page ──────────────────────
    if (action === 'page_leave' && body.pageViewId) {
      // We'll compute time_on_page client-side and pass it
      // For now, just mark the page view — actual time computed by next page_view
      return NextResponse.json({ ok: true });
    }

    // ─── SESSION_END: End the session ─────────────────────────
    if (action === 'session_end') {
      await endSession(supabase, sessionToken);
      return NextResponse.json({ ok: true });
    }

    // ─── SCROLL_DEPTH: Update page view scroll ────────────────
    if (action === 'scroll_depth' && body.pageViewId) {
      await supabase
        .from('page_views')
        .update({ scroll_depth: body.scrollDepth })
        .eq('id', body.pageViewId);
      return NextResponse.json({ ok: true });
    }

    // ─── EVENT: Record custom event ───────────────────────────
    if (action === 'event' && body.eventType) {
      // Find session
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .is('ended_at', null)
        .single();

      if (session) {
        await recordEvent(supabase, {
          sessionId: session.id,
          visitorId: body.visitorId,
          pageViewId: body.pageViewId,
          eventType: body.eventType,
          eventData: body.eventData,
          pageUrl: body.pageUrl,
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    // Analytics should never break the store
    console.error('[Analytics Track]', error);
    return NextResponse.json({ ok: true }); // Return success to avoid client retries
  }
}

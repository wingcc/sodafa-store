/**
 * SODFA STORE - Analytics Dashboard API
 *
 * GET /api/analytics/dashboard
 *
 * Query params:
 *   view   = 'summary' | 'overview' | 'visitors' | 'pages' | 'traffic' | 'devices' | 'realtime'
 *   period = 'today' | '7d' | '30d' | '90d' | 'all' (default: '7d')
 *   page   = pagination page (default: 1)
 *   limit  = items per page (default: 20)
 *
 * Returns aggregated analytics data for the dashboard and analytics pages.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function getDateRange(period: string) {
  const now = new Date();
  switch (period) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case 'yesterday': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case '7d': {
      const start = new Date(now.getTime() - 7 * 86400000);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 86400000);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case '90d': {
      const start = new Date(now.getTime() - 90 * 86400000);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case 'all':
    default:
      return { start: '2000-01-01T00:00:00Z', end: now.toISOString() };
  }
}

function getDateBuckets(period: string) {
  switch (period) {
    case 'today': return 'hour';
    case 'yesterday': return 'hour';
    case '7d': return 'day';
    case '30d': return 'day';
    case '90d': return 'week';
    case 'year': return 'month';
    case 'all': return 'month';
    default: return 'day';
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const view = searchParams.get('view') || 'summary';
    const period = searchParams.get('period') || '7d';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const { start, end } = getDateRange(period);

    // ─── SUMMARY: Dashboard stat cards ────────────────────────
    if (view === 'summary') {
      const [visitorsResult, pageViewsResult, sessionsResult, ordersResult] = await Promise.all([
        supabase.from('visitors').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        supabase.from('page_views').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        supabase.from('sessions').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        supabase.from('orders').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
      ]);

      // Previous period for comparison
      const prevStart = new Date(new Date(start).getTime() - (new Date(end).getTime() - new Date(start).getTime())).toISOString();
      const [prevVisitors, prevPageViews, prevSessions] = await Promise.all([
        supabase.from('visitors').select('id', { count: 'exact', head: true })
          .gte('created_at', prevStart).lt('created_at', start),
        supabase.from('page_views').select('id', { count: 'exact', head: true })
          .gte('created_at', prevStart).lt('created_at', start),
        supabase.from('sessions').select('id', { count: 'exact', head: true })
          .gte('created_at', prevStart).lt('created_at', start),
      ]);

      const visitors = visitorsResult.count || 0;
      const pageViews = pageViewsResult.count || 0;
      const sessions = sessionsResult.count || 0;
      const orders = ordersResult.count || 0;
      const prevVisitorsCount = prevVisitors.count || 0;
      const prevPageViewsCount = prevPageViews.count || 0;
      const prevSessionsCount = prevSessions.count || 0;

      const calcChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100);
      };

      return NextResponse.json({
        stats: {
          visitors: { value: visitors, change: calcChange(visitors, prevVisitorsCount) },
          pageViews: { value: pageViews, change: calcChange(pageViews, prevPageViewsCount) },
          sessions: { value: sessions, change: calcChange(sessions, prevSessionsCount) },
          orders: { value: orders, change: 0 },
          avgSessionDuration: sessions > 0 ? 0 : 0, // Computed below
          bounceRate: sessions > 0 ? 0 : 0,
        },
        period,
      });
    }

    // ─── OVERVIEW: Charts data ────────────────────────────────
    if (view === 'overview') {
      const bucket = getDateBuckets(period);

      // Get all visitors who existed BEFORE this period (for returning detection)
      const { data: prevVisitorsData } = await supabase
        .from('page_views')
        .select('visitor_id')
        .lt('created_at', start);
      const prevVisitorIds = new Set((prevVisitorsData || []).map((pv: { visitor_id: string }) => pv.visitor_id));

      // Visitor trend with unique vs returning
      let visitorTrend: { date: string; uniqueVisitors: number; returningVisitors: number; pageViews: number; sessions: number }[] = [];
      {
        const { data: rawPages } = await supabase
          .from('page_views')
          .select('created_at, visitor_id, session_id')
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: true });

        if (rawPages) {
          const bucketMap = new Map<string, { visitors: Set<string>; pageViews: number; sessions: Set<string> }>();
          for (const pv of rawPages) {
            const date = bucket === 'hour'
              ? pv.created_at.substring(0, 13) + ':00:00Z'
              : bucket === 'week'
                ? getWeekStart(pv.created_at)
                : pv.created_at.substring(0, 10);
            if (!bucketMap.has(date)) {
              bucketMap.set(date, { visitors: new Set(), pageViews: 0, sessions: new Set() });
            }
            const b = bucketMap.get(date)!;
            b.visitors.add(pv.visitor_id);
            b.pageViews++;
            b.sessions.add(pv.session_id);
          }
          visitorTrend = Array.from(bucketMap.entries()).map(([date, d]) => {
            let unique = 0;
            let returning = 0;
            for (const vid of d.visitors) {
              if (prevVisitorIds.has(vid)) returning++;
              else unique++;
            }
            return {
              date,
              uniqueVisitors: unique,
              returningVisitors: returning,
              pageViews: d.pageViews,
              sessions: d.sessions.size,
            };
          });
        }
      }

      // Bounce rate
      const { data: bounceData } = await supabase
        .from('sessions')
        .select('is_bounce')
        .gte('created_at', start).lte('created_at', end);
      const totalSessions = bounceData?.length || 0;
      const bouncedSessions = bounceData?.filter((s: { is_bounce: boolean }) => s.is_bounce).length || 0;
      const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

      // Avg session duration
      const { data: durationData } = await supabase
        .from('sessions')
        .select('duration_seconds, created_at')
        .gte('created_at', start).lte('created_at', end)
        .not('duration_seconds', 'is', null);
      const avgDuration = durationData && durationData.length > 0
        ? Math.round(durationData.reduce((sum: number, s: { duration_seconds: number | null }) => sum + (s.duration_seconds || 0), 0) / durationData.length)
        : 0;

      // Daily avg session duration for bar chart
      const dailyDurationMap = new Map<string, { total: number; count: number }>();
      if (durationData) {
        for (const s of durationData) {
          const date = s.created_at.substring(0, 10);
          if (!dailyDurationMap.has(date)) dailyDurationMap.set(date, { total: 0, count: 0 });
          const entry = dailyDurationMap.get(date)!;
          entry.total += s.duration_seconds || 0;
          entry.count++;
        }
      }
      const dailyAvgDuration = Array.from(dailyDurationMap.entries())
        .map(([date, d]) => ({
          date,
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          minutes: d.count > 0 ? Math.round(d.total / d.count / 60 * 10) / 10 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({
        visitorTrend,
        bounceRate,
        avgSessionDuration: avgDuration,
        dailyAvgDuration,
        period,
      });
    }

    // ─── PAGES: Top pages ─────────────────────────────────────
    if (view === 'pages') {
      const { data: topPages } = await supabase
        .from('page_views')
        .select('page_path, page_title, page_type, visitor_id')
        .gte('created_at', start).lte('created_at', end)
        .order('created_at', { ascending: false });

      // Aggregate in JS
      const pageMap = new Map<string, { path: string; title: string; type: string; views: number; uniqueVisitors: Set<string> }>();
      for (const pv of (topPages || [])) {
        const key = pv.page_path;
        if (!pageMap.has(key)) {
          pageMap.set(key, { path: pv.page_path, title: pv.page_title || pv.page_path, type: pv.page_type, views: 0, uniqueVisitors: new Set() });
        }
        const p = pageMap.get(key)!;
        p.views++;
        p.uniqueVisitors.add(pv.visitor_id);
      }

      const pages = Array.from(pageMap.values())
        .map(p => ({ ...p, uniqueVisitors: p.uniqueVisitors.size }))
        .sort((a, b) => b.views - a.views)
        .slice(offset, offset + limit);

      return NextResponse.json({
        pages,
        total: pageMap.size,
        page,
        limit,
      });
    }

    // ─── TRAFFIC: Sources & referrers ─────────────────────────
    if (view === 'traffic') {
      // UTM source breakdown
      const { data: sessions } = await supabase
        .from('sessions')
        .select('utm_source, utm_medium, utm_campaign, referrer_domain')
        .gte('created_at', start).lte('created_at', end);

      const sourceMap = new Map<string, { source: string; sessions: number }>();
      const mediumMap = new Map<string, { medium: string; sessions: number }>();
      const referrerList: { domain: string; count: number }[] = [];

      for (const s of (sessions || [])) {
        const source = s.utm_source || 'direct';
        const medium = s.utm_medium || 'none';

        if (!sourceMap.has(source)) sourceMap.set(source, { source, sessions: 0 });
        sourceMap.get(source)!.sessions++;

        if (!mediumMap.has(medium)) mediumMap.set(medium, { medium, sessions: 0 });
        mediumMap.get(medium)!.sessions++;

        if (s.referrer_domain) {
          const existing = referrerList.find(r => r.domain === s.referrer_domain);
          if (existing) existing.count++;
          else referrerList.push({ domain: s.referrer_domain, count: 1 });
        }
      }

      return NextResponse.json({
        sources: Array.from(sourceMap.values()).sort((a, b) => b.sessions - a.sessions),
        mediums: Array.from(mediumMap.values()).sort((a, b) => b.sessions - a.sessions),
        referrers: referrerList.sort((a, b) => b.count - a.count).slice(0, 20),
        period,
      });
    }

    // ─── DEVICES: Breakdown ───────────────────────────────────
    if (view === 'devices') {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('device, browser, os, screen_width')
        .gte('created_at', start).lte('created_at', end);

      const deviceMap = new Map<string, number>();
      const browserMap = new Map<string, number>();
      const osMap = new Map<string, number>();
      const screenSize = { mobile: 0, tablet: 0, desktop: 0 };

      for (const s of (sessions || [])) {
        const d = s.device || 'other';
        deviceMap.set(d, (deviceMap.get(d) || 0) + 1);

        const b = s.browser || 'Unknown';
        browserMap.set(b, (browserMap.get(b) || 0) + 1);

        const o = s.os || 'Unknown';
        osMap.set(o, (osMap.get(o) || 0) + 1);

        if (s.screen_width) {
          if (s.screen_width < 768) screenSize.mobile++;
          else if (s.screen_width < 1024) screenSize.tablet++;
          else screenSize.desktop++;
        }
      }

      return NextResponse.json({
        devices: Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count })),
        browsers: Array.from(browserMap.entries()).map(([browser, count]) => ({ browser, count })),
        operatingSystems: Array.from(osMap.entries()).map(([os, count]) => ({ os, count })),
        screenSizes: screenSize,
        period,
      });
    }

    // ─── VISITORS: New vs returning ───────────────────────────
    if (view === 'visitors') {
      const { data: visitors } = await supabase
        .from('visitors')
        .select('visitor_type, country, city, first_seen_at, last_seen_at')
        .gte('created_at', start).lte('created_at', end);

      const typeMap = new Map<string, number>();
      const countryMap = new Map<string, number>();

      for (const v of (visitors || [])) {
        const t = v.visitor_type || 'new';
        typeMap.set(t, (typeMap.get(t) || 0) + 1);

        const c = v.country || 'Unknown';
        countryMap.set(c, (countryMap.get(c) || 0) + 1);
      }

      return NextResponse.json({
        visitorTypes: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
        countries: Array.from(countryMap.entries())
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
        total: visitors?.length || 0,
        period,
      });
    }

    // ─── REALTIME: Current activity ───────────────────────────
    if (view === 'realtime') {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const [activeSessions, recentPageViews, recentEvents] = await Promise.all([
        supabase.from('sessions').select('id', { count: 'exact', head: true })
          .is('ended_at', null).gte('started_at', fiveMinAgo),
        supabase.from('page_views').select('page_path, page_type, created_at')
          .gte('created_at', fiveMinAgo).order('created_at', { ascending: false }).limit(50),
        supabase.from('visitor_events').select('event_type, created_at')
          .gte('created_at', fiveMinAgo).order('created_at', { ascending: false }).limit(50),
      ]);

      return NextResponse.json({
        activeSessions: activeSessions.count || 0,
        recentPageViews: recentPageViews.data || [],
        recentEvents: recentEvents.data || [],
      });
    }

    return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
  } catch (error) {
    console.error('[Analytics Dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  return d.toISOString().substring(0, 10);
}

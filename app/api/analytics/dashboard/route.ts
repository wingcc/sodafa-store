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

    // ─── CART: Abandonment funnel from visitor_events ────────
    if (view === 'cart') {
      const [addToCartRes, checkoutRes] = await Promise.all([
        supabase.from('visitor_events').select('id', { count: 'exact', head: true })
          .in('event_type', ['add_to_cart']).gte('created_at', start).lte('created_at', end),
        supabase.from('visitor_events').select('id', { count: 'exact', head: true })
          .in('event_type', ['begin_checkout', 'checkout_started']).gte('created_at', start).lte('created_at', end),
      ]);
      const addToCartCount = addToCartRes.count || 0;
      const checkoutCount = checkoutRes.count || 0;

      // Fallback: also check page_views for checkout page hits as proxy for checkout intent
      let fallbackCheckout = checkoutCount;
      if (checkoutCount === 0) {
        const { count: checkoutPageViews } = await supabase.from('page_views')
          .select('id', { count: 'exact', head: true })
          .eq('page_type', 'checkout').gte('created_at', start).lte('created_at', end);
        fallbackCheckout = checkoutPageViews || 0;
      }

      const { count: ordersCount } = await supabase.from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start).lte('created_at', end);

      return NextResponse.json({
        addToCart: addToCartCount,
        checkoutStarted: fallbackCheckout,
        orders: ordersCount || 0,
        hasRealData: addToCartCount > 0 || checkoutCount > 0,
        period,
      });
    }

    // ─── BEHAVIOR: User behavior metrics ──────────────────────
    if (view === 'behavior') {
      const [sessionsRes, pageViewsRes, eventsRes, homeViewsRes, storeViewsRes] = await Promise.all([
        supabase.from('sessions').select('id, landing_page, exit_page, page_views').gte('created_at', start).lte('created_at', end),
        supabase.from('page_views').select('id, session_id, page_path, page_type, scroll_depth').gte('created_at', start).lte('created_at', end),
        supabase.from('visitor_events').select('id, event_type').gte('created_at', start).lte('created_at', end),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('page_type', 'home').gte('created_at', start).lte('created_at', end),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).in('page_type', ['store', 'product']).gte('created_at', start).lte('created_at', end),
      ]);

      const sessions = sessionsRes.data || [];
      const pageViews = pageViewsRes.data || [];
      const events = eventsRes.data || [];

      // Avg pages per session
      const totalPageViews = pageViews.length;
      const totalSessions = sessions.length;
      const avgPagesPerSession = totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 10) / 10 : 0;

      // Avg scroll depth (from page_views where scroll_depth not null)
      const scrollDepths = pageViews.filter(pv => pv.scroll_depth != null).map(pv => pv.scroll_depth as number);
      const avgScrollDepth = scrollDepths.length > 0 ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length) : 0;

      // Interaction events
      const eventCounts = new Map<string, number>();
      for (const e of events) {
        eventCounts.set(e.event_type, (eventCounts.get(e.event_type) || 0) + 1);
      }

      // Home → Store funnel
      const homeViews = homeViewsRes.count || 0;
      const storeViews = storeViewsRes.count || 0;

      // Sessions that touched home and store (via page_views)
      const sessionHomeSet = new Set<string>();
      const sessionStoreSet = new Set<string>();
      for (const pv of pageViews) {
        if (pv.page_type === 'home') sessionHomeSet.add(pv.session_id);
        if (pv.page_type === 'store' || pv.page_type === 'product') sessionStoreSet.add(pv.session_id);
      }
      const homeSessions = sessionHomeSet.size;
      const storeSessions = sessionStoreSet.size;
      let homeToStoreSessions = 0;
      for (const sid of sessionHomeSet) {
        if (sessionStoreSet.has(sid)) homeToStoreSessions++;
      }
      const homeToStoreRate = homeSessions > 0 ? Math.round((homeToStoreSessions / homeSessions) * 100) : 0;

      // Home exits (sessions where exit_page is home or only viewed home)
      const homeExits = sessions.filter(s =>
        s.exit_page === '/' || s.exit_page === '/home' || (s.landing_page === '/' && s.page_views === 1)
      ).length;
      const homeExitRate = homeSessions > 0 ? Math.round((homeExits / homeSessions) * 100) : 0;

      // Top entry pages (landing_page)
      const entryMap = new Map<string, number>();
      for (const s of sessions) {
        const lp = s.landing_page || '/';
        entryMap.set(lp, (entryMap.get(lp) || 0) + 1);
      }
      const topEntryPages = Array.from(entryMap.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views).slice(0, 5);

      // Top exit pages (exit_page)
      const exitMap = new Map<string, number>();
      for (const s of sessions) {
        const ep = s.exit_page || s.landing_page || '/';
        exitMap.set(ep, (exitMap.get(ep) || 0) + 1);
      }
      const topExitPages = Array.from(exitMap.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views).slice(0, 5);

      return NextResponse.json({
        avgPagesPerSession,
        avgScrollDepth,
        scrollDepthCount: scrollDepths.length,
        totalEvents: events.length,
        eventBreakdown: Array.from(eventCounts.entries()).map(([type, count]) => ({ type, count })),
        homeFunnel: {
          homeViews,
          storeViews,
          homeSessions,
          storeSessions,
          homeToStoreSessions,
          homeToStoreRate,
          homeExits,
          homeExitRate,
        },
        topEntryPages,
        topExitPages,
        period,
      });
    }

    // ─── PEAK HOURS: Real hourly matrix ───────────────────────
    if (view === 'peak_hours') {
      const metric = searchParams.get('metric') || 'visitors';
      if (metric === 'orders') {
        // Paginated fetch to handle many orders
        let allOrders: { created_at: string }[] = [];
        let from = 0;
        const pageSize = 1000;
        while (true) {
          const { data: chunk } = await supabase.from('orders').select('created_at')
            .gte('created_at', start).lte('created_at', end)
            .order('created_at', { ascending: true })
            .range(from, from + pageSize - 1);
          if (!chunk || chunk.length === 0) break;
          allOrders = allOrders.concat(chunk as any);
          if (chunk.length < pageSize) break;
          from += pageSize;
          if (from > 10000) break;
        }
        const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
        for (const o of allOrders) {
          const d = new Date(o.created_at);
          // Use local hour for more intuitive display (Morocco is UTC+1)
          const day = (d.getUTCDay() + 6) % 7; // Mon=0
          const hour = d.getUTCHours();
          matrix[day][hour]++;
        }
        return NextResponse.json({ matrix, period, metric, total: allOrders.length });
      }
      if (metric === 'sessions') {
        let allSessions: { started_at: string }[] = [];
        let from = 0;
        const pageSize = 1000;
        while (true) {
          const { data: chunk } = await supabase.from('sessions').select('started_at')
            .gte('started_at', start).lte('started_at', end)
            .order('started_at', { ascending: true })
            .range(from, from + pageSize - 1);
          if (!chunk || chunk.length === 0) break;
          allSessions = allSessions.concat(chunk as any);
          if (chunk.length < pageSize) break;
          from += pageSize;
          if (from > 10000) break;
        }
        const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
        for (const s of allSessions) {
          if (!s.started_at) continue;
          const d = new Date(s.started_at);
          const day = (d.getUTCDay() + 6) % 7;
          const hour = d.getUTCHours();
          matrix[day][hour]++;
        }
        return NextResponse.json({ matrix, period, metric, total: allSessions.length });
      }
      // visitors: distinct visitors per hour from page_views (paginated)
      let allPVs: { created_at: string; visitor_id: string }[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data: chunk } = await supabase.from('page_views').select('created_at, visitor_id')
          .gte('created_at', start).lte('created_at', end)
          .order('created_at', { ascending: true })
          .range(from, from + pageSize - 1);
        if (!chunk || chunk.length === 0) break;
        allPVs = allPVs.concat(chunk as any);
        if (chunk.length < pageSize) break;
        from += pageSize;
        if (from > 10000) break;
      }
      const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
      const seen = new Set<string>();
      for (const pv of allPVs) {
        const d = new Date(pv.created_at);
        const day = (d.getUTCDay() + 6) % 7;
        const hour = d.getUTCHours();
        const key = `${pv.visitor_id}-${day}-${hour}`;
        if (!seen.has(key)) { seen.add(key); matrix[day][hour]++; }
      }
      return NextResponse.json({ matrix, period, metric, total: seen.size });
    }

    // ─── SEARCH: Search behavior ──────────────────────────────
    if (view === 'search') {
      const { data: searchEvents } = await supabase
        .from('visitor_events')
        .select('event_data, created_at')
        .eq('event_type', 'search')
        .gte('created_at', start).lte('created_at', end)
        .order('created_at', { ascending: false }).limit(200);

      const termMap = new Map<string, { term: string; count: number; results: number[] }>();
      for (const e of (searchEvents || [])) {
        const q = (e.event_data as any)?.query || (e.event_data as any)?.term || '';
        const term = String(q).trim().toLowerCase();
        if (!term) continue;
        if (!termMap.has(term)) termMap.set(term, { term, count: 0, results: [] });
        const entry = termMap.get(term)!;
        entry.count++;
        const rc = (e.event_data as any)?.results_count ?? (e.event_data as any)?.results ?? 0;
        if (typeof rc === 'number') entry.results.push(rc);
      }
      const topTerms = Array.from(termMap.values())
        .map(t => ({ term: t.term, count: t.count, avgResults: t.results.length ? Math.round(t.results.reduce((a, b) => a + b, 0) / t.results.length) : 0 }))
        .sort((a, b) => b.count - a.count).slice(0, 10);

      const totalSearches = searchEvents?.length || 0;
      const uniqueTerms = termMap.size;

      // Funnel: search -> view -> cart -> order (approx via visitor_events + page_views)
      const { count: searchResultViews } = await supabase.from('page_views').select('id', { count: 'exact', head: true })
        .like('page_path', '%search%').gte('created_at', start).lte('created_at', end);

      return NextResponse.json({
        totalSearches,
        uniqueTerms,
        topTerms,
        searchResultViews: searchResultViews || 0,
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

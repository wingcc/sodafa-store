// SODFA MARKETPLACE - Analytics Page (Visitor & Website Analytics)
// All widgets share a single date-range filter

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Eye,
  MousePointerClick,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Calendar,
  FileText,
  Home,
  ShoppingBag,
  ShoppingCart,
  LayoutGrid,
  CreditCard,
  Package,
  Search,
  User,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#1E7A57', '#C6A15B', '#38BDF8', '#F472B6', '#FB923C', '#4ADE80', '#FBBF24', '#C084FC', '#F87171', '#22D3EE'];

const getPageIcon = (path: string) => {
  const p = path.toLowerCase();
  if (p === '/' || p === '') return <Home size={16} className="text-violet-500" />;
  if (p.includes('product')) return <ShoppingBag size={16} className="text-violet-500" />;
  if (p.includes('shop')) return <ShoppingCart size={16} className="text-violet-500" />;
  if (p.includes('collection')) return <LayoutGrid size={16} className="text-violet-500" />;
  if (p.includes('checkout')) return <CreditCard size={16} className="text-violet-500" />;
  if (p.includes('order')) return <Package size={16} className="text-violet-500" />;
  if (p.includes('search')) return <Search size={16} className="text-violet-500" />;
  if (p.includes('account') || p.includes('profile')) return <User size={16} className="text-violet-500" />;
  return <FileText size={16} className="text-violet-500" />;
};

const getPageName = (path: string, title?: string) => {
  if (title && title !== path) return title;
  const p = path.toLowerCase();
  if (p === '/' || p === '') return 'Home';
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1 || 0] || path;
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ').replace(/_/g, ' ');
};

type Period = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'year';

interface StatValue {
  value: number;
  change: number;
}

interface SummaryStats {
  visitors: StatValue;
  pageViews: StatValue;
  sessions: StatValue;
  orders: StatValue;
}

interface TrendPoint {
  date: string;
  uniqueVisitors: number;
  returningVisitors: number;
  pageViews: number;
  sessions: number;
}

interface PageInfo {
  path: string;
  title: string;
  type: string;
  views: number;
  uniqueVisitors: number;
}

interface TrafficSource {
  source: string;
  sessions: number;
}

interface DeviceInfo {
  device: string;
  count: number;
}

interface BrowserInfo {
  browser: string;
  count: number;
}

interface CountryInfo {
  country: string;
  count: number;
}

const periodOptions: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'year', label: 'This Year' },
];

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topPages, setTopPages] = useState<PageInfo[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [browsers, setBrowsers] = useState<BrowserInfo[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [bounceRate, setBounceRate] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [dailyAvgDuration, setDailyAvgDuration] = useState<{ date: string; day: string; minutes: number }[]>([]);

  // Modal state for View All Pages
  const [showAllPages, setShowAllPages] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [summaryRes, overviewRes, pagesRes, trafficRes, devicesRes, visitorsRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?view=summary&period=${period}`),
        fetch(`/api/analytics/dashboard?view=overview&period=${period}`),
        fetch(`/api/analytics/dashboard?view=pages&period=${period}&limit=10`),
        fetch(`/api/analytics/dashboard?view=traffic&period=${period}`),
        fetch(`/api/analytics/dashboard?view=devices&period=${period}`),
        fetch(`/api/analytics/dashboard?view=visitors&period=${period}`),
      ]);

      const [summary, overview, pages, traffic, devicesData, visitorsData] = await Promise.all([
        summaryRes.json(),
        overviewRes.json(),
        pagesRes.json(),
        trafficRes.json(),
        devicesRes.json(),
        visitorsRes.json(),
      ]);

      setStats(summary.stats);
      setTrend(overview.visitorTrend || []);
      setTopPages(pages.pages || []);
      setTrafficSources(traffic.sources || []);
      setDevices(devicesData.devices || []);
      setBrowsers(devicesData.browsers || []);
      setCountries(visitorsData.countries || []);
      setBounceRate(overview.bounceRate || 0);
      setAvgDuration(overview.avgSessionDuration || 0);
      setDailyAvgDuration(overview.dailyAvgDuration || []);
    } catch (error) {
      console.error('[Analytics] Failed to fetch:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAllPages) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showAllPages]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (dateStr.length === 13) return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const deviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      case 'tablet': return <Tablet size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const statCards = stats ? [
    { label: 'Visitors', value: formatNumber(stats.visitors.value), change: stats.visitors.change, icon: <Users size={20} />, color: '#1E7A57' },
    { label: 'Page Views', value: formatNumber(stats.pageViews.value), change: stats.pageViews.change, icon: <Eye size={20} />, color: '#C6A15B' },
    { label: 'Sessions', value: formatNumber(stats.sessions.value), change: stats.sessions.change, icon: <MousePointerClick size={20} />, color: '#38BDF8' },
    { label: 'Avg. Duration', value: formatDuration(avgDuration), change: 0, icon: <Clock size={20} />, color: '#F472B6' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* ─── HEADER WITH SHARED DATE RANGE ────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visitor & website behavior analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex-wrap">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === opt.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        /* ─── LOADING SKELETON ──────────────────────────────────────── */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[350px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[350px]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]" />
          </div>
        </>
      ) : (
        <>
          {/* ─── STAT CARDS ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {stat.change >= 0 ? '+' : ''}{stat.change}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ─── ROW 1: VISITOR TREND + AVG SESSION DURATION ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Visitor Trend */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Visitor Trend</h3>
              <div className="h-[280px]">
                {trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <Tooltip
                        labelFormatter={(label: any) => formatDate(String(label))}
                        formatter={(value: any, name: any) => [formatNumber(Number(value)), name === 'uniqueVisitors' ? 'Unique Visitors' : 'Returning Visitors']}
                      />
                      <Area type="monotone" dataKey="uniqueVisitors" stroke="#1E7A57" fill="#1E7A5720" strokeWidth={2} name="uniqueVisitors" />
                      <Area type="monotone" dataKey="returningVisitors" stroke="#C6A15B" fill="#C6A15B20" strokeWidth={2} name="returningVisitors" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No data available for this period
                  </div>
                )}
              </div>
            </div>

            {/* Avg Session Duration */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Avg. Session Duration</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">Minutes per visit</span>
              </div>
              {dailyAvgDuration.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dailyAvgDuration} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      itemStyle={{ color: '#C6A15B' }}
                      formatter={(value: any) => [`${value} min`, 'Duration']}
                    />
                    <Bar dataKey="minutes" fill="#C6A15B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                  No session data available
                </div>
              )}
            </div>
          </div>

          {/* ─── SECOND ROW: PAGES, TRAFFIC, DEVICES ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top Pages */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Decorative purple analytics background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute top-0 left-0 w-full h-32 opacity-[0.06]" viewBox="0 0 800 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="topPagesBg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                      <stop offset="30%" stopColor="#8B5CF6" stopOpacity="1" />
                      <stop offset="70%" stopColor="#A78BFA" stopOpacity="1" />
                      <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 C100,40 200,90 300,60 C400,30 500,70 600,45 C700,20 750,55 800,40 L800,0 L0,0 Z" fill="url(#topPagesBg)" />
                </svg>
                <svg className="absolute top-0 right-0 w-48 h-32 opacity-[0.07]" viewBox="0 0 200 120">
                  <rect x="140" y="50" width="14" height="70" rx="3" fill="#8B5CF6" />
                  <rect x="160" y="30" width="14" height="90" rx="3" fill="#A78BFA" />
                  <rect x="180" y="60" width="14" height="60" rx="3" fill="#C4B5FD" />
                </svg>
              </div>

              <div className="relative p-5 pb-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10">
                      <FileText size={20} className="text-violet-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Pages</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Most visited pages on your store</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Last {period === 'today' ? 'today' : period === 'yesterday' ? 'yesterday' : period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : 'year'}
                    </span>
                    <button
                      onClick={() => setShowAllPages(true)}
                      className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                      View all pages <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[40px_1fr_80px_1fr] sm:grid-cols-[40px_1fr_100px_140px] gap-3 px-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">#</span>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Page</span>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Views</span>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block">Share</span>
                </div>

                {/* Page rows */}
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {topPages.length > 0 ? topPages.slice(0, 5).map((page, i) => {
                    const maxViews = Math.max(...topPages.slice(0, 5).map(p => p.views));
                    const sharePct = maxViews > 0 ? Math.round((page.views / maxViews) * 100) : 0;
                    return (
                      <div key={page.path + i} className="grid grid-cols-[40px_1fr_80px_1fr] sm:grid-cols-[40px_1fr_100px_140px] gap-3 items-center py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                        {/* Rank */}
                        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">{i + 1}</span>

                        {/* Page info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                            {getPageIcon(page.path)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{page.path}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getPageName(page.path, page.title)}</p>
                          </div>
                        </div>

                        {/* Views */}
                        <p className="text-sm font-bold text-gray-900 dark:text-white text-right">{formatNumber(page.views)}</p>

                        {/* Traffic share bar */}
                        <div className="hidden sm:flex items-center gap-2.5">
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                              style={{ width: `${sharePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">{sharePct}%</span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-8 text-center">
                      <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400 dark:text-gray-500">No page data yet</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {topPages.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                      View all pages <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
              <div className="h-[250px]">
                {trafficSources.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="70%">
                      <PieChart>
                        <Pie
                          data={trafficSources.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="sessions"
                          nameKey="source"
                          stroke="none"
                        >
                          {trafficSources.slice(0, 6).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} sessions`, 'Sessions']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {trafficSources.slice(0, 4).map((s, i) => (
                        <div key={s.source} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          {s.source} ({s.sessions})
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No traffic data yet
                  </div>
                )}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Devices</h3>
              <div className="space-y-4">
                {devices.length > 0 ? devices.map((d) => {
                  const total = devices.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                  return (
                    <div key={d.device}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {deviceIcon(d.device)}
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{d.device}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[devices.indexOf(d) % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-gray-400 text-center py-4">No device data yet</p>
                )}
              </div>

              {/* Browser breakdown */}
              {browsers.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Browsers</h4>
                  <div className="space-y-2">
                    {browsers.slice(0, 4).map((b) => {
                      const total = browsers.reduce((s, x) => s + x.count, 0);
                      const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
                      return (
                        <div key={b.browser} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{b.browser}</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── THIRD ROW: COUNTRIES ──────────────────────────────────── */}
          {countries.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {countries.slice(0, 10).map((c, i) => {
                  const total = countries.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                  return (
                    <div key={c.country} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.country}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{c.count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pct}% of visitors</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── SESSION QUALITY ──────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Session Quality</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bounce Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{bounceRate}%</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${bounceRate}%`, backgroundColor: bounceRate > 50 ? '#F87171' : '#1E7A57' }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Session Duration</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatDuration(avgDuration)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sessions per Visitor</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats && stats.visitors.value > 0
                    ? (stats.sessions.value / stats.visitors.value).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── VIEW ALL PAGES MODAL ──────────────────────────────────── */}
      {showAllPages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAllPages(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

          {/* Modal card */}
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden animate-[scaleIn_0.25s_ease-out]">
            {/* Decorative purple analytics background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg className="absolute top-0 left-0 w-full h-40 opacity-[0.05]" viewBox="0 0 800 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="modalTopPagesBg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                    <stop offset="30%" stopColor="#8B5CF6" stopOpacity="1" />
                    <stop offset="70%" stopColor="#A78BFA" stopOpacity="1" />
                    <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 C100,40 200,90 300,60 C400,30 500,70 600,45 C700,20 750,55 800,40 L800,0 L0,0 Z" fill="url(#modalTopPagesBg)" />
              </svg>
              <svg className="absolute top-0 right-0 w-64 h-40 opacity-[0.06]" viewBox="0 0 260 120">
                <rect x="180" y="40" width="16" height="80" rx="4" fill="#8B5CF6" />
                <rect x="204" y="20" width="16" height="100" rx="4" fill="#A78BFA" />
                <rect x="228" y="50" width="16" height="70" rx="4" fill="#C4B5FD" />
              </svg>
            </div>

            {/* Sticky header */}
            <div className="relative sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10">
                    <FileText size={20} className="text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Pages</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topPages.length} pages · Last {period === 'today' ? 'today' : period === 'yesterday' ? 'yesterday' : period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : 'year'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllPages(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="relative overflow-y-auto max-h-[calc(85vh-72px)]">
              {/* Table header */}
              <div className="sticky top-0 z-[5] bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm grid grid-cols-[40px_1fr_90px_100px] sm:grid-cols-[48px_1fr_110px_160px] gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">#</span>
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Page</span>
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Views</span>
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block">Share</span>
              </div>

              {/* Page rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {topPages.length > 0 ? topPages.map((page, i) => {
                  const maxViews = Math.max(...topPages.map(p => p.views));
                  const sharePct = maxViews > 0 ? Math.round((page.views / maxViews) * 100) : 0;
                  return (
                    <div key={page.path + i} className="grid grid-cols-[40px_1fr_90px_100px] sm:grid-cols-[48px_1fr_110px_160px] gap-3 items-center py-3.5 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      {/* Rank */}
                      <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">{i + 1}</span>

                      {/* Page info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                          {getPageIcon(page.path)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{page.path}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getPageName(page.path, page.title)}</p>
                        </div>
                      </div>

                      {/* Views */}
                      <p className="text-sm font-bold text-gray-900 dark:text-white text-right">{formatNumber(page.views)}</p>

                      {/* Traffic share bar */}
                      <div className="hidden sm:flex items-center gap-2.5">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                            style={{ width: `${sharePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">{sharePct}%</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-16 text-center">
                    <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No page data yet</p>
                  </div>
                )}
              </div>

              {/* Total row */}
              {topPages.length > 0 && (
                <div className="sticky bottom-0 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm grid grid-cols-[40px_1fr_90px_100px] sm:grid-cols-[48px_1fr_110px_160px] gap-3 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <span />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white text-right">{formatNumber(topPages.reduce((sum, p) => sum + p.views, 0))}</p>
                  <div className="hidden sm:block" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

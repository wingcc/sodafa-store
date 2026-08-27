// Analytic - shared types
export type Period = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'year';

export interface StatValue {
  value: number;
  change: number;
}

export interface SummaryStats {
  visitors: StatValue;
  pageViews: StatValue;
  sessions: StatValue;
  orders: StatValue;
}

export interface TrendPoint {
  date: string;
  uniqueVisitors: number;
  returningVisitors: number;
  pageViews: number;
  sessions: number;
}

export interface PageInfo {
  path: string;
  title: string;
  type: string;
  views: number;
  uniqueVisitors: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
}

export interface DeviceInfo {
  device: string;
  count: number;
}

export interface BrowserInfo {
  browser: string;
  count: number;
}

export interface CountryInfo {
  country: string;
  count: number;
}

export const COLORS = ['#1E7A57', '#C6A15B', '#38BDF8', '#F472B6', '#FB923C', '#4ADE80', '#FBBF24', '#C084FC', '#F87171', '#22D3EE'];

export const periodOptions: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'year', label: 'This Year' },
];

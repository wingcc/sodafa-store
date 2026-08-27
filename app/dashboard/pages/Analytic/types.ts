// Analytic - shared types
export type Period = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'year' | 'custom';

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

export const periodOptions: { value: Period; label: string; labelAr: string }[] = [
  { value: 'today', label: 'Today', labelAr: 'اليوم' },
  { value: 'yesterday', label: 'Yesterday', labelAr: 'الأمس' },
  { value: '7d', label: '7 Days', labelAr: '7 أيام' },
  { value: '30d', label: '30 Days', labelAr: '30 يوم' },
  { value: '90d', label: '90 Days', labelAr: '90 يوم' },
  { value: 'year', label: 'This Year', labelAr: 'هذه السنة' },
  { value: 'custom', label: 'Custom Range', labelAr: 'تاريخ مخصص' },
];

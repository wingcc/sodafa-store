'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Period, SummaryStats, TrendPoint, PageInfo, TrafficSource, DeviceInfo, BrowserInfo, CountryInfo } from '../types';

export function useAnalyticsData(period: Period) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  return { loading, refreshing, stats, trend, topPages, trafficSources, devices, browsers, countries, bounceRate, avgDuration, dailyAvgDuration, fetchData };
}

"use client";

/**
 * StoreSettingsContext
 *
 * Centralized store settings provider that:
 * 1. Fetches site config from /api/store-config (Supabase)
 * 2. Caches in localStorage for instant access
 * 3. Refreshes when data is stale or explicitly requested
 *
 * No hardcoded data, no config.json — only database.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { SiteConfig } from "../sections/common/types";

const CACHE_KEY = "sodfa_store_config";
const CACHE_VERSION_KEY = "sodfa_store_config_version";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface StoreSettingsContextType {
  siteConfig: SiteConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

function readCache(): { config: SiteConfig | null; timestamp: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const ts = localStorage.getItem(CACHE_VERSION_KEY);
    if (!raw) return null;
    return {
      config: JSON.parse(raw) as SiteConfig,
      timestamp: ts ? parseInt(ts, 10) : 0,
    };
  } catch {
    return null;
  }
}

function writeCache(config: SiteConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(CACHE_VERSION_KEY, String(Date.now()));
  } catch {
    // Storage full or unavailable — ignore
  }
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async (skipCache = false) => {
    try {
      // Check cache first (unless skipCache)
      if (!skipCache) {
        const cached = readCache();
        if (cached && cached.config && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
          setSiteConfig(cached.config);
          setLoading(false);
          setError(null);
          return;
        }
      }

      const res = await fetch("/api/store-config", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const config = (data?.data ?? data) as SiteConfig | null;

      if (config) {
        setSiteConfig(config);
        writeCache(config);
      }
      setError(null);
    } catch (err) {
      console.error("[StoreSettings] Failed to fetch config:", err);
      // Try stale cache as fallback
      const cached = readCache();
      if (cached?.config) {
        setSiteConfig(cached.config);
      } else {
        setError("Failed to load store settings");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConfig(false);
  }, [fetchConfig]);

  // Listen for storage events (cross-tab updates)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CACHE_VERSION_KEY) {
        fetchConfig(true);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchConfig]);

  const refresh = useCallback(async () => {
    await fetchConfig(true);
  }, [fetchConfig]);

  return (
    <StoreSettingsContext.Provider value={{ siteConfig, loading, error, refresh }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): StoreSettingsContextType {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    return { siteConfig: null, loading: true, error: null, refresh: async () => {} };
  }
  return context;
}

/**
 * Convenience hook: get just the site config
 */
export function useSiteConfig(): SiteConfig | null {
  const { siteConfig } = useStoreSettings();
  return siteConfig;
}

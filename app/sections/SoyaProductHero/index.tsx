"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "../Hero";
import type { HeroConfig, SiteConfig } from "../common/types";

interface SodfaConfig {
  hero: HeroConfig;
  site: SiteConfig;
}

export const SoyaProductHero = () => {
  const [config, setConfig] = useState<SodfaConfig | null>(null);

  useEffect(() => {
    fetch("/json/config.json")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to load config in SoyaProductHero wrapper:", err));
  }, []);

  if (!config) return null;

  return <HeroSection hero={config.hero} site={config.site} />;
};
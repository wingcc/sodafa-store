// SODFA MARKETPLACE - Interactive Morocco Delivery Map (dependency-free SVG)
//
// Renders a lightweight SVG map of Morocco. City locations use real WGS84
// coordinates; delivery STATUS is always derived from the live `zones`
// (shipping_zones + methods) passed in from the store, so the map reflects
// the real Supabase state — never hard-coded.

'use client';

import React, { useState, useMemo, useRef } from 'react';
import { ShippingZone, ShippingMethod } from '../types';
import {
  MOROCCAN_CITIES,
  MOROCCO_BORDER,
  projectLatLon,
  normalizeCity,
} from '../data/moroccoCities';
import Badge from './ui/Badge';

export type CityStatus = 'configured' | 'partial' | 'none';

export interface CityRecord {
  name: string;
  lat: number;
  lng: number;
  region: string;
  zone: ShippingZone | null;
  status: CityStatus;
  standard: ShippingMethod | null;
  express: ShippingMethod | null;
}

export interface MoroccoMapProps {
  zones: ShippingZone[];
  selectedCity: string | null;
  onSelectCity: (name: string) => void;
  /** Reduced chrome (no zoom/legend) for embedding in a summary card. */
  compact?: boolean;
  className?: string;
}

const STATUS_COLOR: Record<CityStatus, string> = {
  configured: '#10b981', // emerald-500  🟢
  partial: '#f59e0b', // amber-500     🟠
  none: '#ef4444', // red-500         🔴
};

function findZoneForCity(name: string, zones: ShippingZone[]): ShippingZone | null {
  const target = normalizeCity(name);
  for (const zone of zones) {
    if (zone.cities.some((c) => normalizeCity(c) === target)) return zone;
  }
  return null;
}

function findMethod(zone: ShippingZone | null, keyword: string): ShippingMethod | null {
  if (!zone) return null;
  return zone.methods.find((m) => m.name.toLowerCase().includes(keyword)) ?? null;
}

export default function MoroccoMap({
  zones,
  selectedCity,
  onSelectCity,
  compact = false,
  className = '',
}: MoroccoMapProps) {
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<CityRecord | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const cities: CityRecord[] = useMemo(() => {
    return MOROCCAN_CITIES.map((c) => {
      const zone = findZoneForCity(c.name, zones);
      const methodCount = zone ? zone.methods.length : 0;
      const status: CityStatus = !zone ? 'none' : methodCount >= 2 ? 'configured' : 'partial';
      return {
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        region: c.region,
        zone,
        status,
        standard: findMethod(zone, 'standard'),
        express: findMethod(zone, 'express'),
      };
    });
  }, [zones]);

  const counts = useMemo(() => {
    const c: Record<CityStatus, number> = { configured: 0, partial: 0, none: 0 };
    for (const city of cities) c[city.status] += 1;
    return c;
  }, [cities]);

  // Wheel-to-zoom (clamped)
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((k) => Math.min(4, Math.max(0.8, k * (1 - e.deltaY * 0.0015))));
  };

  const zoomIn = () => setZoom((k) => Math.min(4, k * 1.4));
  const zoomOut = () => setZoom((k) => Math.max(0.8, k / 1.4));
  const reset = () => setZoom(1);

  // Keyboard accessibility: arrow keys nudge, +/- zoom
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== svgRef.current) return;
    if (e.key === '=') { e.preventDefault(); zoomIn(); }
    if (e.key === '-') { e.preventDefault(); zoomOut(); }
    if (e.key === '0') { e.preventDefault(); reset(); }
  };

  const cx = 520;
  const cy = 560;
  const groupTransform = `translate(${cx},${cy}) scale(${zoom}) translate(${-cx},${-cy})`;

  return (
    <div
      className={`relative w-full bg-gradient-to-b from-sky-50 to-sky-100/40 rounded-2xl border border-stone-200 overflow-hidden ${className}`}
      data-testid="morocco-map"
    >
      <svg
        ref={svgRef}
        tabIndex={0}
        viewBox="0 0 1040 1120"
        role="img"
        aria-label="Morocco delivery map"
        className="w-full h-full block"
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      >
        {/* Morocco outline */}
        <g transform={groupTransform}>
          <polygon
            points={MOROCCO_BORDER.map(([lat, lng]) => {
              const p = projectLatLon(lat, lng);
              return `${p.x},${p.y}`;
            }).join(' ')}
            className="fill-amber-50/60 stroke-amber-800/70"
            strokeWidth="1.5"
          />

          {/* City markers (projected to SVG coordinates) */}
          {cities.map((city) => {
            const p = projectLatLon(city.lat, city.lng);
            const isSelected = selectedCity === city.name;
            const color = STATUS_COLOR[city.status];
            const r = Math.max(4, Math.min(11, 9 / zoom));
            const ring = isSelected ? '#d97706' : '#ffffff';
            const ringWidth = isSelected ? 3 : 1.5;
            return (
              <g key={city.name} transform={`translate(${p.x},${p.y})`}>
                <circle
                  r={r + ringWidth + 1}
                  fill="none"
                  stroke={ring}
                  strokeWidth={ringWidth}
                  className="transition-all duration-200"
                />
                <circle
                  r={r}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1.2}
                  className="cursor-pointer transition-all duration-200 hover:brightness-110"
                  onClick={() => onSelectCity(city.name)}
                  onMouseEnter={() => setHovered(city)}
                  onMouseLeave={() => setHovered(null)}
                />
                {/* Label for the selected / hovered city */}
                {(isSelected || hovered === city) && (
                  <text
                    x={r + ringWidth + 6}
                    y={-r - ringWidth - 4}
                    className="fill-stone-800 text-[10px] font-semibold"
                  >
                    {city.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Zoom controls */}
        {!compact && (
          <g
            className="absolute top-3 right-3 flex flex-col gap-1"
            style={{ top: 12, right: 12, position: 'absolute', zIndex: 5 }}
          >
            <button
              type="button"
              onClick={zoomIn}
              className="w-8 h-8 rounded-lg bg-white/90 border border-stone-200 text-stone-700 hover:bg-stone-50 shadow grid place-items-center"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className="w-8 h-8 rounded-lg bg-white/90 border border-stone-200 text-stone-700 hover:bg-stone-50 shadow grid place-items-center"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-8 h-8 rounded-lg bg-white/90 border border-stone-200 text-stone-700 hover:bg-stone-50 shadow grid place-items-center text-[10px]"
              aria-label="Reset view"
            >
              ⌂
            </button>
          </g>
        )}
      </svg>

      {/* Legend (full mode only) */}
      {!compact && (
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 bg-white/90 rounded-xl px-2.5 py-1.5 border border-stone-200 shadow">
          <span className="text-[10px] font-semibold text-stone-500">Legend</span>
          <span className="h-4 w-px bg-stone-200" />
          <Badge variant="success" dot>
            {counts.configured} configured
          </Badge>
          <Badge variant="warning" dot>
            {counts.partial} partial
          </Badge>
          <Badge variant="danger" dot>
            {counts.none} no delivery
          </Badge>
        </div>
      )}

      {/* Hovered city tooltip */}
      {hovered && (
        <div
          className="absolute bg-stone-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{ left: 16, bottom: 16, maxWidth: 240 }}
        >
          <div className="font-bold">{hovered.name}</div>
          <div className="text-stone-300">{hovered.region}</div>
          <div className="mt-1 text-stone-300">
            Zone: {hovered.zone?.name ?? '—'}
          </div>
        </div>
      )}
    </div>
  );
}

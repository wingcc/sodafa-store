// SODFA MARKETPLACE - Interactive Morocco Delivery Map (mapcn + MapLibre)
//
// Replaces the previous Leaflet implementation with mapcn's declarative
// React components built on MapLibre GL JS. Must only be loaded client-side —
// the wrapper in MoroccoMap.tsx pulls this chunk in with next/dynamic({ ssr: false }).

'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
  useMap,
} from '@/components/ui/map';
import { ShippingZone, ShippingCity, ShippingMethod } from '../types';
import { MOROCCAN_CITIES } from '../data/moroccoCities';

export type CityStatus = 'configured' | 'partial' | 'none' | 'disabled';

export interface CityRecord {
  name: string;
  lat: number;
  lng: number;
  region: string;
  zone: ShippingZone | null;
  city: ShippingCity | null;
  status: CityStatus;
  standard: ShippingMethod | null;
  express: ShippingMethod | null;
}

export interface DroppedPin {
  lat: number;
  lng: number;
}

export interface MoroccoMapProps {
  zones: ShippingZone[];
  selectedCity: string | null;
  onSelectCity: (name: string) => void;
  /** When true, clicking the map fires onMapClick instead of selecting a city. */
  dropPinMode?: boolean;
  /** Coordinates of a temporarily dropped pin (Add City flow). */
  droppedPin?: DroppedPin | null;
  /** Fired when the user clicks the map in drop-pin mode. */
  onMapClick?: (lng: number, lat: number) => void;
  /** Reduced chrome (no zoom/legend) for embedding in a summary card. */
  compact?: boolean;
  className?: string;
}

const STATUS_COLOR: Record<CityStatus, string> = {
  configured: '#10b981',
  partial: '#f59e0b',
  none: '#ef4444',
  disabled: '#6b7280',
};

function normalizeCity(name: string): string {
  return name.trim().toLowerCase();
}

function findCityInZones(name: string, zones: ShippingZone[]): { zone: ShippingZone; city: ShippingCity } | null {
  const target = normalizeCity(name);
  for (const zone of zones) {
    const city = zone.cities.find((c) => normalizeCity(c.name) === target);
    if (city) return { zone, city };
  }
  return null;
}

/** Listens for map clicks and forwards them to the parent — only active in drop-pin mode. */
function MapClickHandler({
  active,
  onClick,
}: {
  active: boolean;
  onClick?: (lng: number, lat: number) => void;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || !active || !onClick) return;

    const handler = (e: { lngLat: { lng: number; lat: number } }) => {
      onClick(e.lngLat.lng, e.lngLat.lat);
    };

    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [isLoaded, map, active, onClick]);

  return null;
}

function MoroccoLeafletMap({
  zones,
  selectedCity,
  onSelectCity,
  dropPinMode = false,
  droppedPin = null,
  onMapClick,
  compact = false,
  className = '',
}: MoroccoMapProps) {
  const cities: CityRecord[] = useMemo(() => {
    return MOROCCAN_CITIES.map((c) => {
      const result = findCityInZones(c.name, zones);
      const zone = result?.zone ?? null;
      const city = result?.city ?? null;
      const methodCount = city ? city.methods.length : 0;
      let status: CityStatus;
      if (!city || city.isActive === false) status = 'disabled';
      else if (methodCount === 0) status = 'none';
      else status = methodCount >= 2 ? 'configured' : 'partial';
      const standard = city ? (city.methods.find((m) => m.name.toLowerCase().includes('standard')) ?? null) : null;
      const express = city ? (city.methods.find((m) => m.name.toLowerCase().includes('express')) ?? null) : null;
      return {
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        region: c.region,
        zone,
        city,
        status,
        standard,
        express,
      };
    });
  }, [zones]);

  const selected = cities.find((c) => c.name === selectedCity) ?? null;

  const mapCenter = useMemo(() => {
    if (droppedPin) return [droppedPin.lng, droppedPin.lat] as [number, number];
    if (selected) return [selected.lng, selected.lat] as [number, number];
    return [-7.0926, 31.7917] as [number, number];
  }, [selected, droppedPin]);

  const mapZoom = useMemo(() => {
    if (droppedPin) return 10;
    if (selected) return 8;
    return 5.6;
  }, [selected, droppedPin]);

  const handleMapClick = useCallback(
    (lng: number, lat: number) => {
      onMapClick?.(lng, lat);
    },
    [onMapClick],
  );

  return (
    <div
      className={`relative w-full h-full rounded-2xl border border-stone-200 overflow-hidden ${className}`}
      style={{ background: '#eef4f6' }}
      data-testid="morocco-map"
    >
      <Map center={mapCenter} zoom={mapZoom} minZoom={4} maxZoom={12}>
        {/* Click handler — only active in drop-pin mode */}
        <MapClickHandler active={dropPinMode} onClick={handleMapClick} />

        {!compact && (
          <MapControls
            position="top-right"
            showZoom
            showCompass
            showLocate
            showFullscreen
          />
        )}

        {/* City markers */}
        {cities.map((city) => {
          const isSelected = selectedCity === city.name;
          const color = STATUS_COLOR[city.status];
          const size = isSelected ? 18 : 12;

          return (
            <MapMarker
              key={city.name}
              longitude={city.lng}
              latitude={city.lat}
              onClick={() => onSelectCity(city.name)}
            >
              <MarkerContent>
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: 9999,
                    background: color,
                    border: `${isSelected ? 3 : 2}px solid ${isSelected ? '#d97706' : '#ffffff'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,.35)',
                    transition: 'all .2s',
                    transform: isSelected ? 'scale(1.25)' : undefined,
                    cursor: dropPinMode ? 'not-allowed' : 'pointer',
                    opacity: dropPinMode ? 0.5 : 1,
                  }}
                />
              </MarkerContent>
              {!dropPinMode && <MarkerTooltip>{city.name}</MarkerTooltip>}
              {!dropPinMode && (
                <MarkerPopup>
                  <div className="min-w-[170px]">
                    <div className="font-semibold text-gray-900">{city.name}</div>
                    <div className="text-xs text-gray-500 mb-1.5">{city.region}</div>
                    <div
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                      style={{
                        background: `${color}18`,
                        borderColor: `${color}55`,
                        color: color,
                      }}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: color }}
                      />
                      {city.status === 'disabled'
                        ? 'Disabled'
                        : city.status === 'none'
                          ? 'No delivery'
                          : city.status === 'partial'
                            ? 'Partial'
                            : 'Configured'}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Zone: {city.zone?.name ?? '—'}</div>
                    {(city.standard || city.express) && (
                      <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                        {city.standard && (
                          <div>
                            Standard:{' '}
                            <span className="font-medium text-gray-700">
                              {Number(city.standard.price)} MAD
                            </span>
                          </div>
                        )}
                        {city.express && (
                          <div>
                            Express:{' '}
                            <span className="font-medium text-gray-700">
                              {Number(city.express.price)} MAD
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </MarkerPopup>
              )}
            </MapMarker>
          );
        })}

        {/* Dropped pin marker (Add City flow) */}
        {droppedPin && (
          <MapMarker longitude={droppedPin.lng} latitude={droppedPin.lat}>
            <MarkerContent>
              <div className="relative">
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 9999,
                    background: '#3b82f6',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 12px rgba(59,130,246,.5)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    border: '2px solid rgba(59,130,246,.3)',
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
              </div>
            </MarkerContent>
            <MarkerPopup closeButton={false}>
              <div className="text-xs text-gray-600">
                <span className="font-medium text-gray-900">New city location</span>
                <br />
                {droppedPin.lat.toFixed(4)}°N, {Math.abs(droppedPin.lng).toFixed(4)}°W
              </div>
            </MarkerPopup>
          </MapMarker>
        )}
      </Map>

      {/* Drop-pin mode banner */}
      {dropPinMode && !droppedPin && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Click on the map to place a city
        </div>
      )}
    </div>
  );
}

export default MoroccoLeafletMap;

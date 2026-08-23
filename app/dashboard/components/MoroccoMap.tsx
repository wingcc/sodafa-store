// SODFA MARKETPLACE - Interactive Morocco Delivery Map
//
// Thin client-only wrapper around MoroccoLeafletMap (mapcn + MapLibre GL).
// MapLibre touches `window` at import time, so the heavy chunk is loaded
// with ssr:false — required because /dashboard is statically prerendered.
//
// The public props contract is unchanged from the previous SVG version.

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { MoroccoMapProps } from './MoroccoLeafletMap';

export type { CityStatus, CityRecord, DroppedPin, MoroccoMapProps } from './MoroccoLeafletMap';

const LeafletMap = dynamic(() => import('./MoroccoLeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      className="relative w-full rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 items-center justify-center flex"
      data-testid="morocco-map-loading"
    >
      <div className="flex flex-col items-center gap-3 py-10 text-stone-400">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#cda552]" />
        <span className="text-xs">Loading map…</span>
      </div>
    </div>
  ),
});

export default function MoroccoMap(props: MoroccoMapProps) {
  return <LeafletMap {...props} />;
}

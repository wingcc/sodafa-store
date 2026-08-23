// SODFA MARKETPLACE - Cities tab
//
// Searchable Morocco city coverage list + map + per-city delivery detail.
// Includes "Add City" flow: drop a pin on the map, fill the form, save.

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { MapPin, Truck, Zap, Pencil, Loader2, Plus, X } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import SearchInput from '../../../components/ui/SearchInput';
import RefreshButton from '../../../components/ui/RefreshButton';
import MoroccoMap from '../../../components/MoroccoMap';
import type { DroppedPin } from '../../../components/MoroccoMap';
import type { ShippingZone, ShippingCity, ShippingMethod } from '../../../types';
import type { CityStatus, EnrichedCity } from '../types';
import { MOROCCAN_CITIES } from '../../../data/moroccoCities';
import { fmtPrice } from '../utils';

interface CitiesTabProps {
  zones: ShippingZone[];
  filteredCities: EnrichedCity[];
  statusCounts: Record<CityStatus, number>;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  citySearch: string;
  onCitySearchChange: (value: string) => void;
  selectedCityDetails: EnrichedCity | null;
  onEditZone: (zone: ShippingZone) => void;
  onRefresh: () => void;
  isLoading: boolean;
  addCity: (city: { name: string; name_ar?: string; zone_id: string; latitude: number; longitude: number }) => Promise<{ success: boolean; error?: string; data?: ShippingCity }>;
}

const STATUS_META: Record<CityStatus, { label: string; variant: 'success' | 'warning' | 'danger'; dot: string }> = {
  configured: { label: 'Configured', variant: 'success', dot: 'bg-emerald-500' },
  partial: { label: 'Partial', variant: 'warning', dot: 'bg-amber-500' },
  none: { label: 'Not configured', variant: 'danger', dot: 'bg-red-500' },
  disabled: { label: 'Disabled', variant: 'danger', dot: 'bg-gray-400' },
};

const MethodRow = ({ method, icon }: { method: ShippingMethod; icon: React.ReactNode }) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
    <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
      {icon}
      {method.name}
    </span>
    <span className="text-right">
      <span className="block text-sm font-bold text-[#0b2e22]">{fmtPrice(method.price)}</span>
      <span className="block text-[11px] text-stone-400">{method.estimatedDays} day(s)</span>
    </span>
  </div>
);

const CitiesTab = ({
  zones,
  filteredCities,
  statusCounts,
  selectedCity,
  onSelectCity,
  citySearch,
  onCitySearchChange,
  selectedCityDetails,
  onEditZone,
  onRefresh,
  isLoading,
  addCity,
}: CitiesTabProps) => {
  // ─── Add City flow state ──────────────────────────────────────────
  const [dropPinMode, setDropPinMode] = useState(false);
  const [droppedPin, setDroppedPin] = useState<DroppedPin | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    nameAr: '',
    zoneId: '',
  });


  // ─── Drop-pin handlers ────────────────────────────────────────────
  const enterDropPinMode = useCallback(() => {
    setDropPinMode(true);
    setDroppedPin(null);
    setCreateForm({ name: '', nameAr: '', zoneId: zones[0]?.id ?? '' });
  }, [zones]);

  const cancelDropPin = useCallback(() => {
    setDropPinMode(false);
    setDroppedPin(null);
  }, []);

  const handleMapClick = useCallback(
    (lng: number, lat: number) => {
      if (dropPinMode && !droppedPin) {
        setDroppedPin({ lat, lng });
      }
    },
    [dropPinMode, droppedPin],
  );

  const handleSaveCity = useCallback(async () => {
    if (!droppedPin || !createForm.name.trim() || !createForm.zoneId) return;
    setIsSaving(true);
    try {
      const result = await addCity({
        name: createForm.name.trim(),
        name_ar: createForm.nameAr.trim(),
        zone_id: createForm.zoneId,
        latitude: droppedPin.lat,
        longitude: droppedPin.lng,
      });
      if (result.success) {
        setDropPinMode(false);
        setDroppedPin(null);
        setCreateForm({ name: '', nameAr: '', zoneId: '' });
        onSelectCity(result.data?.name ?? createForm.name.trim());
        onRefresh();
      }
    } finally {
      setIsSaving(false);
    }
  }, [droppedPin, createForm, addCity, onSelectCity, onRefresh]);

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex items-center flex-wrap gap-2">
        <Badge variant="success" dot>{statusCounts.configured} configured</Badge>
        <Badge variant="warning" dot>{statusCounts.partial} partial</Badge>
        <Badge variant="danger" dot>{statusCounts.none} not configured</Badge>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />
          {statusCounts.disabled} disabled
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Map ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 p-4">
          {/* Map header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {dropPinMode ? (
                <>
                  <h3 className="font-bold text-sm text-stone-900">Cities &amp; Delivery Map</h3>
                  <span className="text-xs text-stone-500">Click anywhere on the map to place a new city pin</span>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-sm text-stone-900">Coverage map</h3>
                  <span className="text-xs text-stone-500">{filteredCities.length} cities shown</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {dropPinMode ? (
                <button
                  type="button"
                  onClick={cancelDropPin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <X size={13} />
                  Cancel Drop Pin
                </button>
              ) : (
                <>
                  {/* Add City */}
                  <button
                    type="button"
                    onClick={enterDropPinMode}
                    className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-xl text-xs font-semibold bg-[#0b2e22] text-white hover:bg-[#123f30] transition-colors"
                  >
                    <Plus size={13} />
                    Add City
                  </button>

                  {/* Refresh */}
                  <RefreshButton onRefresh={onRefresh} isLoading={isLoading} size="sm" />
                </>
              )}
            </div>
          </div>

          {/* Map container */}
          <div className="relative h-[420px]">
            <MoroccoMap
              zones={zones}
              selectedCity={selectedCity}
              onSelectCity={onSelectCity}
              dropPinMode={dropPinMode}
              droppedPin={droppedPin}
              onMapClick={handleMapClick}
            />

            {/* City creation form overlay */}
            {dropPinMode && droppedPin && (
              <div className="absolute top-2 right-2 z-[600] w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
                {/* Form header */}
                <div className="bg-[#0b2e22] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">New City Location</span>
                  </div>
                  <button
                    type="button"
                    onClick={cancelDropPin}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Coordinates display */}
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <span className="text-xs font-mono text-blue-700">
                    {droppedPin.lat.toFixed(4)}°N | {Math.abs(droppedPin.lng).toFixed(4)}°W
                  </span>
                </div>

                {/* Form fields */}
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Casablanca"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/30 focus:border-[#d97706]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Arabic Name
                    </label>
                    <input
                      type="text"
                      value={createForm.nameAr}
                      onChange={(e) => setCreateForm((f) => ({ ...f, nameAr: e.target.value }))}
                      placeholder="الدار البيضاء"
                      dir="rtl"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/30 focus:border-[#d97706]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.zoneId}
                      onChange={(e) => setCreateForm((f) => ({ ...f, zoneId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#d97706]/30 focus:border-[#d97706]/40"
                    >
                      <option value="">Select a zone…</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={cancelDropPin}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCity}
                    disabled={isSaving || !createForm.name.trim() || !createForm.zoneId}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#0b2e22] text-white hover:bg-[#123f30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> Saving…
                      </span>
                    ) : (
                      'Save City'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── City list ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-stone-100 bg-stone-50/50">
            <SearchInput
              value={citySearch}
              onChange={onCitySearchChange}
              placeholder="Search cities…"
              size="sm"
            />
          </div>
          <div className="flex-1 max-h-[380px] overflow-y-auto divide-y divide-stone-50 relative">
            {filteredCities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                <MapPin size={28} className="mb-2 opacity-40" />
                <span className="text-sm">No cities match &quot;{citySearch}&quot;</span>
              </div>
            ) : (
              filteredCities.map((city) => {
                const meta = STATUS_META[city.status];
                const isSelected = selectedCity === city.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => onSelectCity(isSelected ? null : city.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-[#0b2e22]/5' : 'hover:bg-stone-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-stone-900 truncate">{city.name}</span>
                      <span className="block text-[11px] text-stone-400 truncate">
                        {city.zone ? city.zone.name : 'No zone'}
                      </span>
                    </span>
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                  </button>
                );
              })
            )}
            {isLoading && (
              <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[11px] text-stone-400 bg-white/90 px-2 py-1 rounded-full border border-stone-100">
                <Loader2 size={12} className="animate-spin" /> Syncing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Selected city detail ── */}
      {selectedCityDetails ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <MapPin size={18} className="text-[#cda552]" />
                {selectedCityDetails.name}
                {selectedCityDetails.nameAr && (
                  <span className="text-sm font-normal text-stone-400">{selectedCityDetails.nameAr}</span>
                )}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedCityDetails.region}
                {selectedCityDetails.zone && (
                  <>
                    {' · '}Zone:{' '}
                    <span className="font-medium text-[#0b2e22]">
                      {selectedCityDetails.zone.name}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_META[selectedCityDetails.status].variant} dot size="md">
                {STATUS_META[selectedCityDetails.status].label}
              </Badge>
              {selectedCityDetails.zone && (
                <button
                  type="button"
                  onClick={() => onEditZone(selectedCityDetails.zone!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0b2e22] text-white hover:bg-[#123f30] transition-colors"
                >
                  <Pencil size={13} />
                  Edit Zone
                </button>
              )}
            </div>
          </div>

          {selectedCityDetails.standard || selectedCityDetails.express ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCityDetails.standard && (
                <MethodRow method={selectedCityDetails.standard} icon={<Truck size={15} className="text-sky-600" />} />
              )}
              {selectedCityDetails.express && (
                <MethodRow method={selectedCityDetails.express} icon={<Zap size={15} className="text-purple-600" />} />
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-red-200 bg-red-50/60 p-4 text-sm text-red-600">
              No delivery methods configured for this city yet.
              {selectedCityDetails.zone && ' Use "Edit Zone" to add Standard / Express delivery.'}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-400">
          Select a city on the map or from the list to see its delivery configuration.
        </div>
      )}
    </div>
  );
};

export default CitiesTab;

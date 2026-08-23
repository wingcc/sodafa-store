// Zones tab — expandable zone cards with city badges, delivery stats, and professional expanded view.

import { useState } from 'react';
import { Package, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Power, MapPin, Loader2, Clock } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { fmtPrice, cityStatus } from '../utils';
import type { ShippingZone, ShippingCity } from '../../../types';

// ─── City status dot color ──────────────────────────────────────────────────
function cityDotColor(city: ShippingCity): string {
  const s = cityStatus(city);
  if (s === 'configured') return 'bg-emerald-500';
  if (s === 'partial') return 'bg-amber-500';
  return 'bg-red-400';
}

// ─── Zone card (collapsible) ────────────────────────────────────────────────
interface ZoneCardProps {
  zone: ShippingZone;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function ZoneCard({ zone, onEdit, onDelete, onToggleActive }: ZoneCardProps) {
  const [expanded, setExpanded] = useState(false);
  const totalMethods = zone.cities.reduce((sum, c) => sum + c.methods.length, 0);
  const citiesWithDelivery = zone.cities.filter((c) => c.methods.length > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-shadow hover:shadow-sm">
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          {/* Name + active badge */}
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900">{zone.name}</h3>
            <Badge variant={zone.isActive ? 'success' : 'danger'} dot>
              {zone.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-500 mt-0.5">
            {zone.description || 'No description'}
          </p>

          {/* Stats line */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-stone-400" />
              {zone.cities.length} cit{zone.cities.length !== 1 ? 'ies' : 'y'}
            </span>
            <span className="text-stone-300">|</span>
            <span>
              {citiesWithDelivery} with delivery
            </span>
          </div>

          {/* City badges */}
          {zone.cities.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {zone.cities.map((city) => (
                <span
                  key={city.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-stone-100 bg-stone-50 text-xs text-stone-600"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cityDotColor(city)}`} />
                  {city.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleActive}
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              zone.isActive
                ? 'text-green-600 hover:bg-green-50'
                : 'text-stone-400 hover:bg-stone-100'
            }`}
            title={zone.isActive ? 'Deactivate zone' : 'Activate zone'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={onEdit}
            type="button"
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-[#cda552]"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            type="button"
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button type="button" className="p-1.5 text-stone-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100">
          {zone.cities.length === 0 ? (
            <p className="text-xs text-stone-400 py-3">No cities in this zone yet. Add a city in the Cities tab.</p>
          ) : (
            <div className="pt-3 space-y-2">
              {/* Summary row */}
              <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                <span className="font-medium text-stone-700">{zone.cities.length} cities</span>
                <span className="text-stone-300">|</span>
                <span>{citiesWithDelivery} with delivery methods</span>
                <span className="text-stone-300">|</span>
                <span>{totalMethods} total method{totalMethods !== 1 ? 's' : ''}</span>
              </div>

              {/* Cities table */}
              <div className="bg-stone-50/50 rounded-xl border border-stone-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-stone-500 border-b border-stone-100">
                      <th className="px-3 py-2 font-medium">City</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Methods</th>
                      <th className="px-3 py-2 font-medium">Standard Price</th>
                      <th className="px-3 py-2 font-medium">Express Price</th>
                      <th className="px-3 py-2 font-medium">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zone.cities.map((city) => {
                      const standard = city.methods.find((m) => m.slug === 'standard');
                      const express = city.methods.find((m) => m.slug === 'express');
                      const status = cityStatus(city);
                      return (
                        <tr key={city.id} className="border-b border-stone-100 last:border-0 hover:bg-white transition-colors">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cityDotColor(city)}`} />
                              <div>
                                <span className="font-semibold text-stone-800">{city.name}</span>
                                {city.nameAr && (
                                  <span className="text-stone-400 ml-1">{city.nameAr}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={status === 'configured' ? 'success' : status === 'partial' ? 'warning' : 'danger'}
                              dot
                            >
                              {status === 'configured' ? 'Configured' : status === 'partial' ? 'Partial' : status === 'disabled' ? 'Disabled' : 'No methods'}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-stone-700">{city.methods.length}</td>
                          <td className="px-3 py-2 text-stone-700">{standard ? fmtPrice(standard.price) : '—'}</td>
                          <td className="px-3 py-2 text-stone-700">{express ? fmtPrice(express.price) : '—'}</td>
                          <td className="px-3 py-2">
                            {standard ? (
                              <span className="flex items-center gap-1 text-stone-600">
                                <Clock size={11} className="text-stone-400" />
                                {standard.estimatedDays}d
                                {standard.estimatedHours ? ` ${standard.estimatedHours}h` : ''}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ───────────────────────────────────────────────────────────────
interface ZonesTabProps {
  zones: ShippingZone[];
  onAdd: () => void;
  onEdit: (zone: ShippingZone) => void;
  onDelete: (zone: ShippingZone) => void;
  onToggleActive: (zone: ShippingZone) => void;
}

const ZonesTab = ({ zones, onAdd, onEdit, onDelete, onToggleActive }: ZonesTabProps) => {
  const [search, setSearch] = useState('');

  const filtered = zones.filter((z) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      z.name.toLowerCase().includes(q) ||
      z.description.toLowerCase().includes(q) ||
      z.cities.some((c) => c.name.toLowerCase().includes(q))
    );
  });

  const totalCities = zones.reduce((sum, z) => sum + z.cities.length, 0);
  const totalWithDelivery = zones.reduce(
    (sum, z) => sum + z.cities.filter((c) => c.methods.length > 0).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Shipping zones</h2>
          <p className="text-sm text-stone-500">
            Manage delivery zones and their city coverage
            {zones.length > 0 && (
              <span className="ml-2 text-stone-400">
                &middot; {zones.length} zone{zones.length !== 1 ? 's' : ''}
                &middot; {totalCities} {totalCities !== 1 ? 'cities' : 'city'}
                &middot; {totalWithDelivery} with delivery
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl shadow transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
        >
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {/* Search */}
      {zones.length > 0 && (
        <div className="relative max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search zones..."
            className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
          />
        </div>
      )}

      {/* Zone cards */}
      <div className="space-y-3">
        {zones.length === 0 ? (
          <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200">
            <Package size={40} className="mx-auto mb-3 text-stone-300" />
            <p>No shipping zones yet. Create one to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200">
            <Package size={40} className="mx-auto mb-3 text-stone-300" />
            <p>No zones match your search.</p>
          </div>
        ) : (
          filtered.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onEdit={() => onEdit(zone)}
              onDelete={() => onDelete(zone)}
              onToggleActive={() => onToggleActive(zone)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ZonesTab;

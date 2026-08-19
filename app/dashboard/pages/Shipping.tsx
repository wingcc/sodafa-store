// SODFA MARKETPLACE - Delivery & Shipping Manager (tabbed)
//
// Tab-based manager for the shipping system. All data is read from / written
// to the live Supabase `shipping_zones` / `shipping_methods` tables via the
// store -> /api/shipping routes. The same `shippingZones` cache feeds every
// tab AND the Morocco map, so edits made in one tab are reflected everywhere
// (including the storefront checkout, which also hits /api/shipping).

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Package,
  MapPin,
  Truck,
  Clock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '@/lib/toast';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import StatCard from '../components/ui/StatCard';
import MoroccoMap from '../components/MoroccoMap';
import { MOROCCAN_CITIES, normalizeCity } from '../data/moroccoCities';
import type { ShippingZone, ShippingMethod } from '../types';

type Tab = 'overview' | 'zones' | 'cities' | 'delivery' | 'settings';

// Local payload shapes (structurally compatible with the store's ShippingZoneInput)
type MethodPayload = { id?: string; name: string; price?: number; estimatedDays?: string; freeShippingThreshold?: number | null };
type ZonePayload = { name: string; cities: string[]; methods: MethodPayload[] };

type CityStatus = 'configured' | 'partial' | 'none';

type EnrichedCity = {
  name: string;
  lat: number;
  lng: number;
  region: string;
  zone: ShippingZone | null;
  status: CityStatus;
  standard: ShippingMethod | null;
  express: ShippingMethod | null;
};

// ─── Pure helpers (derived from the cache — no shipping logic duplicated) ──
function cityZone(name: string, zones: ShippingZone[]): ShippingZone | null {
  const target = normalizeCity(name);
  return zones.find((z) => z.cities.some((c) => normalizeCity(c) === target)) ?? null;
}
function zoneStatus(zone: ShippingZone | null): CityStatus {
  if (!zone) return 'none';
  const n = zone.methods.length;
  return n >= 2 ? 'configured' : n === 1 ? 'partial' : 'none';
}
function methodOf(zone: ShippingZone | null, keyword: string): ShippingMethod | null {
  if (!zone) return null;
  return zone.methods.find((m) => m.name.toLowerCase().includes(keyword)) ?? null;
}
function fmtPrice(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return `${isFinite(v) ? v.toFixed(2) : '0.00'} MAD`;
}

// ─── Zone editor form state ────────────────────────────────────────────────
interface MethodForm {
  id?: string;
  name: string;
  price: string;
  estimatedDays: string;
  freeShippingThreshold: string; // empty string => null
}
interface ZoneForm {
  name: string;
  cities: string; // comma-separated for the input
  methods: MethodForm[];
}
const DEFAULT_METHODS: MethodForm[] = [
  { name: 'Standard Delivery', price: '30', estimatedDays: '2-3 days', freeShippingThreshold: '500' },
  { name: 'Express Delivery', price: '50', estimatedDays: '1 day', freeShippingThreshold: '' },
];

function toZoneInput(form: ZoneForm): ZonePayload {
  return {
    name: form.name.trim(),
    cities: form.cities
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    methods: form.methods.map((m) => ({
      ...(m.id ? { id: m.id } : {}),
      name: m.name.trim(),
      price: m.price === '' ? 0 : Number(m.price),
      estimatedDays: m.estimatedDays.trim() || '3-5 days',
      freeShippingThreshold: m.freeShippingThreshold === '' ? null : Number(m.freeShippingThreshold),
    })),
  };
}

function zoneToForm(zone: ShippingZone | null): ZoneForm {
  const methods = (zone?.methods ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    price: String(m.price ?? 0),
    estimatedDays: m.estimatedDays ?? '',
    freeShippingThreshold: m.freeShippingThreshold != null ? String(m.freeShippingThreshold) : '',
  }));
  return {
    name: zone?.name ?? '',
    cities: (zone?.cities ?? []).join(', '),
    methods: methods.length ? methods : DEFAULT_METHODS,
  };
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
  { id: 'zones', label: 'Zones', icon: <Package size={16} /> },
  { id: 'cities', label: 'Cities', icon: <MapPin size={16} /> },
  { id: 'delivery', label: 'Delivery Methods', icon: <Truck size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

// ─── Zone editor modal ────────────────────────────────────────────────────
interface ZoneModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: ZonePayload) => Promise<void>;
  title: string;
  initial: ZoneForm | null;
  isSaving: boolean;
}

function ZoneModal({ open, onClose, onSave, title, initial, isSaving }: ZoneModalProps) {
  const [form, setForm] = useState<ZoneForm>(initial ?? { name: '', cities: '', methods: DEFAULT_METHODS });

  // Re-initialise local state when a new `initial` is passed while the modal
  // is already open (e.g. quick add -> edit without closing).
  if (initial && initial.name !== form.name) {
    setForm(initial);
  }

  const onMethodChange = (idx: number, field: keyof MethodForm, value: string) => {
    setForm((f) => {
      const methods = [...f.methods];
      (methods[idx] as MethodForm)[field] = value;
      return { ...f, methods };
    });
  };
  const addMethod = () =>
    setForm((f) => ({ ...f, methods: [...f.methods, { name: '', price: '', estimatedDays: '', freeShippingThreshold: '' }] }));
  const removeMethod = (idx: number) => setForm((f) => ({ ...f, methods: f.methods.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(toZoneInput(form));
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-500">
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto p-5 space-y-5 flex-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Zone name</label>
              <input
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#cda552]/30 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Cities <span className="text-stone-400 font-normal">(comma separated)</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#cda552]/30 text-sm"
                value={form.cities}
                onChange={(e) => setForm({ ...form, cities: e.target.value })}
                placeholder="Casablanca, Rabat, Marrakech"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-700">Delivery methods</label>
                <button
                  type="button"
                  onClick={addMethod}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0b2e22] hover:text-[#cda552]"
                >
                  <Plus size={14} /> Add method
                </button>
              </div>
              <div className="space-y-3">
                {form.methods.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <label className="text-[10px] text-stone-500 mb-0.5 block">Name</label>
                      <input
                        className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-sm"
                        value={m.name}
                        onChange={(e) => onMethodChange(i, 'name', e.target.value)}
                        placeholder="Standard Delivery"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-stone-500 mb-0.5 block">Price (MAD)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-sm"
                        value={m.price}
                        onChange={(e) => onMethodChange(i, 'price', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-stone-500 mb-0.5 block">Est. days</label>
                      <input
                        className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-sm"
                        value={m.estimatedDays}
                        onChange={(e) => onMethodChange(i, 'estimatedDays', e.target.value)}
                        placeholder="2-3 days"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-stone-500 mb-0.5 block">Free over (MAD)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-sm"
                        value={m.freeShippingThreshold}
                        onChange={(e) => onMethodChange(i, 'freeShippingThreshold', e.target.value)}
                        placeholder="500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeMethod(i)}
                        className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 p-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-bold text-white rounded-lg shadow transition-colors disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────
interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  subject: string;
  isDeleting: boolean;
}
function DeleteConfirm({ open, onClose, onConfirm, title, subject, isDeleting }: DeleteConfirmProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">
          Are you sure you want to delete <span className="font-semibold">&ldquo;{subject}&rdquo;</span>? This action
          cannot be undone.
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CityStatus }) {
  const cfg: Record<CityStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default' }> = {
    configured: { label: 'Configured', variant: 'success' },
    partial: { label: 'Partial', variant: 'warning' },
    none: { label: 'No delivery', variant: 'danger' },
  };
  return (
    <Badge variant={cfg[status].variant} dot size="sm">
      {cfg[status].label}
    </Badge>
  );
}

function MethodLine({ label, method }: { label: string; method: ShippingMethod | null }) {
  if (!method) {
    return (
      <div className="flex justify-between text-xs">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-400">Not available</span>
      </div>
    );
  }
  const free =
    method.freeShippingThreshold != null ? ` &middot; free &ge; ${method.freeShippingThreshold} MAD` : '';
  return (
    <div className="flex justify-between text-xs">
      <span className="text-stone-500">{label}</span>
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `${fmtPrice(method.price)} &middot; ${method.estimatedDays}${free}`,
        }}
      />
    </div>
  );
}

// ─── Selected city details (right sidebar on the Cities tab) ─────────────
interface CityDetailsProps {
  city: EnrichedCity | null;
  onEditZone: (zone: ShippingZone) => void;
}
function CityDetails({ city, onEditZone }: CityDetailsProps) {
  if (!city) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center text-sm text-stone-500">
        <MapPin size={24} className="mx-auto mb-2 text-stone-300" />
        <p>Select a city on the map to view its delivery configuration.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-stone-400" />
        <h3 className="font-bold text-stone-900">{city.name}</h3>
        <StatusBadge status={city.status} />
      </div>
      <p className="text-xs text-stone-500">{city.region}</p>

      {city.zone ? (
        <>
          <div className="text-sm text-stone-600">
            Zone: <span className="font-medium text-stone-900">{city.zone.name}</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-stone-200">
            <MethodLine label="Standard Delivery" method={city.standard} />
            <MethodLine label="Express Delivery" method={city.express} />
          </div>
          <button
            onClick={() => onEditZone(city.zone!)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#0b2e22] hover:text-[#cda552]"
          >
            <Edit size={13} /> Edit zone
          </button>
        </>
      ) : (
        <p className="text-xs text-stone-500">
          No delivery zone assigned yet. Create a zone in the Zones tab to cover this city.
        </p>
      )}
    </div>
  );
}

// ─── Delivery-method editor (Delivery tab) ────────────────────────────────
interface MethodEditorProps {
  zone: ShippingZone;
  onSave: (methods: MethodForm[]) => Promise<void>;
  isSaving: boolean;
}
function MethodEditor({ zone, onSave, isSaving }: MethodEditorProps) {
  const [methods, setMethods] = useState<MethodForm[]>(() =>
    zone.methods.map((m) => ({
      id: m.id,
      name: m.name,
      price: String(m.price ?? 0),
      estimatedDays: m.estimatedDays ?? '',
      freeShippingThreshold: m.freeShippingThreshold != null ? String(m.freeShippingThreshold) : '',
    }))
  );

  const update = (idx: number, field: keyof MethodForm, value: string) =>
    setMethods((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  const add = () =>
    setMethods([...methods, { id: '', name: '', price: '', estimatedDays: '', freeShippingThreshold: '' }]);
  const remove = (idx: number) => setMethods(methods.filter((_, i) => i !== idx));

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">Zone: {zone.name}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1 text-xs font-medium text-[#0b2e22] hover:text-[#cda552]"
          >
            <Plus size={14} /> Add method
          </button>
          <button
            type="button"
            onClick={() => onSave(methods)}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-500 border-b border-stone-200">
              <th className="py-2">Name</th>
              <th className="py-2">Price (MAD)</th>
              <th className="py-2">Est. days</th>
              <th className="py-2">Free over (MAD)</th>
              <th className="py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {methods.map((m, i) => (
              <tr key={m.id || `new-${i}`} className="border-b border-stone-100">
                <td className="py-1.5">
                  <input
                    className="w-full px-2 py-1 rounded border border-stone-200 text-sm"
                    value={m.name}
                    onChange={(e) => update(i, 'name', e.target.value)}
                    placeholder="Standard Delivery"
                  />
                </td>
                <td className="py-1.5">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-20 px-2 py-1 rounded border border-stone-200 text-sm"
                    value={m.price}
                    onChange={(e) => update(i, 'price', e.target.value)}
                  />
                </td>
                <td className="py-1.5">
                  <input
                    className="w-28 px-2 py-1 rounded border border-stone-200 text-sm"
                    value={m.estimatedDays}
                    onChange={(e) => update(i, 'estimatedDays', e.target.value)}
                    placeholder="2-3 days"
                  />
                </td>
                <td className="py-1.5">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-24 px-2 py-1 rounded border border-stone-200 text-sm"
                    value={m.freeShippingThreshold}
                    onChange={(e) => update(i, 'freeShippingThreshold', e.target.value)}
                    placeholder="500"
                  />
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-1 rounded text-stone-400 hover:text-red-600"
                    title="Remove method"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings tab ──────────────────────────────────────────────────────────
function SettingsTab({ zones }: { zones: ShippingZone[] }) {
  const totalCities = new Set<string>();
  zones.forEach((z) => z.cities.forEach((c) => totalCities.add(c)));
  const thresholds = new Set(
    zones.flatMap((z) => z.methods.map((m) => m.freeShippingThreshold).filter((t): t is number => t != null))
  );
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <h3 className="text-lg font-bold text-stone-900">General shipping configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Currency</label>
            <p className="text-stone-900 font-bold">MAD (Dirham)</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Global free-shipping threshold</label>
            <p className="text-stone-900 font-bold">500 MAD</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Mirrored in store_settings (free_shipping_threshold)</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Delivery zones</label>
            <p className="text-stone-900 font-bold">{zones.length} zone(s)</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Covered cities</label>
            <p className="text-stone-900 font-bold">{totalCities.size} city(s)</p>
          </div>
        </div>
        <div className="text-[11px] text-stone-400">
          Per-method free-shipping thresholds in use: {Array.from(thresholds).map(String).join(', ') || '—'}
        </div>
      </div>
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs">
        <AlertCircle size={14} className="inline mr-1" />
        Additional checkout & shipping settings are stored in the &ldquo;store_settings&rdquo; table and
        applied at checkout time.
      </div>
    </div>
  );
}

// ─── Zone row ──────────────────────────────────────────────────────────────
interface ZoneRowProps {
  zone: ShippingZone;
  onEdit: () => void;
  onDelete: () => void;
}
function ZoneRow({ zone, onEdit, onDelete }: ZoneRowProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900">{zone.name}</h3>
            <Badge variant="info" dot>
              {zone.methods.length} methods
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {zone.cities.length} cities &middot; {zone.cities.join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-[#0b2e22]"
            title="Edit"
            type="button"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-red-600"
            title="Delete"
            type="button"
          >
            <Trash2 size={16} />
          </button>
          <button className="p-1.5 text-stone-400" type="button">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-stone-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-stone-500">
                <th className="py-1.5">Method</th>
                <th className="py-1.5">Price</th>
                <th className="py-1.5">Est. days</th>
                <th className="py-1.5">Free over</th>
              </tr>
            </thead>
            <tbody>
              {zone.methods.map((m) => (
                <tr key={m.id} className="border-t border-stone-100">
                  <td className="py-1.5 text-stone-900">{m.name}</td>
                  <td className="py-1.5">{fmtPrice(m.price)}</td>
                  <td className="py-1.5">{m.estimatedDays}</td>
                  <td className="py-1.5">{m.freeShippingThreshold != null ? `${m.freeShippingThreshold} MAD` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
const Shipping: React.FC = () => {
  const {
    shippingZones,
    isLoadingShipping,
    shippingError,
    fetchShippingZones,
    addShippingZone,
    updateShippingZone,
    deleteShippingZone,
  } = useStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<ShippingZone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchShippingZones();
  }, []);

  const refresh = () => fetchShippingZones();

  // ─── Derived: enriched city list for the map & city table ─────────────
  const cityIndex = useMemo<EnrichedCity[]>(() => {
    return MOROCCAN_CITIES.map((c) => {
      const zone = cityZone(c.name, shippingZones);
      return {
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        region: c.region,
        zone,
        status: zoneStatus(zone),
        standard: methodOf(zone, 'standard'),
        express: methodOf(zone, 'express'),
      };
    });
  }, [shippingZones]);

  const statusCounts = useMemo(() => {
    const c: Record<CityStatus, number> = { configured: 0, partial: 0, none: 0 };
    for (const city of cityIndex) c[city.status] += 1;
    return c;
  }, [cityIndex]);

  const selectedZone = useMemo(() => {
    if (!selectedCity) return shippingZones[0] ?? null;
    return cityZone(selectedCity, shippingZones) ?? shippingZones[0] ?? null;
  }, [selectedCity, shippingZones]);

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cityIndex;
    return cityIndex.filter((c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
  }, [cityIndex, citySearch]);

  const openZoneModal = (zone: ShippingZone | null) => {
    setEditingZone(zone);
    setZoneModalOpen(true);
  };
  const closeZoneModal = () => {
    setZoneModalOpen(false);
    setEditingZone(null);
  };

  const handleSaveZone = async (input: ZonePayload) => {
    setIsSaving(true);
    try {
      if (editingZone) {
        await updateShippingZone(editingZone.id, input);
        addToast('success', 'Zone updated', { title: 'Success' });
      } else {
        const res = await addShippingZone(input);
        if (res.success) {
          addToast('success', 'Zone created', { title: 'Success' });
        } else {
          addToast('error', res.error ?? 'Could not create zone', { title: 'Error' });
        }
      }
      closeZoneModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!zoneToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteShippingZone(zoneToDelete.id);
      if (res.success) {
        addToast('success', 'Zone deleted', { title: 'Success' });
      } else {
        addToast('error', res.error ?? 'Could not delete zone', { title: 'Error' });
      }
      if (selectedCity === zoneToDelete.name) setSelectedCity(null);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setZoneToDelete(null);
    }
  };

  const handleSaveMethods = async (methods: MethodForm[]) => {
    if (!selectedZone) return;
    setIsSaving(true);
    try {
      const payload = methods.map((m) => ({
        ...(m.id ? { id: m.id } : {}),
        name: m.name,
        price: Number(m.price),
        estimatedDays: m.estimatedDays,
        freeShippingThreshold: m.freeShippingThreshold === '' ? null : Number(m.freeShippingThreshold),
      }));
      await updateShippingZone(selectedZone.id, { methods: payload });
      addToast('success', 'Delivery methods saved', { title: 'Success' });
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Could not save methods', { title: 'Error' });
    } finally {
      setIsSaving(false);
    }
  };

  const standardTotal = useMemo(() => cityIndex.filter((c) => c.standard).length, [cityIndex]);
  const expressTotal = useMemo(() => cityIndex.filter((c) => c.express).length, [cityIndex]);

  // ─── Overview stats ────────────────────────────────────────────────────
  const overviewStats = useMemo(() => {
    const totalZones = shippingZones.length;
    const totalCities = new Set<string>();
    shippingZones.forEach((z) => z.cities.forEach((c) => totalCities.add(c)));
    return {
      totalZones,
      totalCities: totalCities.size,
      configured: statusCounts.configured,
      partial: statusCounts.partial,
      none: statusCounts.none,
    };
  }, [shippingZones, statusCounts]);

  return (
    <div className="space-y-5 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900" style={{ color: '#0b2e22' }}>
            Delivery & Shipping Manager
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Morocco coverage &middot; zones & delivery methods &middot; checkout prices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={refresh} isLoading={isLoadingShipping} variant="gradient" />
        </div>
      </div>

      {shippingError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
          <AlertCircle size={16} />
          <span className="text-sm">{shippingError}</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="border-b border-stone-200">
        <nav className="flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-[#0b2e22] text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tabs content */}
      {isLoadingShipping && shippingZones.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-stone-500">
          <Loader2 size={32} className="animate-spin text-[#cda552] mr-3" />
          <span>Loading shipping configuration…</span>
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Delivery Zones"
                  value={String(overviewStats.totalZones)}
                  icon={<Package size={20} className="text-[#cda552]" />}
                  iconBg="bg-[#cda552]/10"
                  iconColor="text-[#cda552]"
                />
                <StatCard
                  title="Cities Covered"
                  value={String(overviewStats.totalCities)}
                  icon={<MapPin size={20} className="text-emerald-600" />}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  title="Configured"
                  value={String(overviewStats.configured)}
                  icon={<CheckCircle2 size={20} className="text-emerald-600" />}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  title="Not Configured"
                  value={String(overviewStats.none)}
                  icon={<AlertCircle size={20} className="text-red-600" />}
                  iconBg="bg-red-50"
                  iconColor="text-red-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Standard Delivery"
                  value={`${overviewStats.configured} cities`}
                  icon={<Truck size={20} className="text-sky-600" />}
                  iconBg="bg-sky-50"
                  iconColor="text-sky-600"
                />
                <StatCard
                  title="Express Delivery"
                  value={`${expressTotal} cities`}
                  icon={<Clock size={20} className="text-purple-600" />}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                />
                <StatCard
                  title="Partial Coverage"
                  value={`${overviewStats.partial} cities`}
                  icon={<MapPin size={20} className="text-amber-600" />}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-stone-900">Coverage at a glance</h3>
                  <button
                    onClick={() => setActiveTab('cities')}
                    className="text-xs font-medium text-[#0b2e22] hover:text-[#cda552] inline-flex items-center gap-1"
                  >
                    Open full map <ExternalLink size={12} />
                  </button>
                </div>
                <div className="h-[320px]">
                  <MoroccoMap zones={shippingZones} selectedCity={selectedCity} onSelectCity={setSelectedCity} compact />
                </div>
              </div>
            </div>
          )}

          {/* ── ZONES ── */}
          {activeTab === 'zones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900">Shipping zones</h2>
                <button
                  type="button"
                  onClick={() => openZoneModal(null)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl shadow transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
                >
                  <Plus size={16} /> Add Zone
                </button>
              </div>

              <div className="space-y-3">
                {shippingZones.length === 0 ? (
                  <div className="text-center py-12 text-stone-500">
                    <Package size={40} className="mx-auto mb-3 text-stone-300" />
                    <p>No shipping zones yet. Create one to get started.</p>
                  </div>
                ) : (
                  shippingZones.map((zone) => (
                    <ZoneRow
                      key={zone.id}
                      zone={zone}
                      onEdit={() => openZoneModal(zone)}
                      onDelete={() => {
                        setZoneToDelete(zone);
                        setDeleteOpen(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── CITIES ── */}
          {activeTab === 'cities' && (
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900">Morocco delivery map</h2>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {statusCounts.configured} configured
                    <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" /> {statusCounts.partial} partial
                    <span className="w-2 h-2 rounded-full bg-red-500 ml-2" /> {statusCounts.none} no delivery
                    <RefreshButton onRefresh={refresh} isLoading={isLoadingShipping} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-3">
                  <MoroccoMap
                    zones={shippingZones}
                    selectedCity={selectedCity}
                    onSelectCity={setSelectedCity}
                  />
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#cda552]/30"
                  />
                </div>

                <div className="space-y-1 text-xs text-stone-500">
                  <div className="grid grid-cols-3 gap-1 font-medium text-stone-600">
                    <span>City</span>
                    <span>Status</span>
                    <span className="text-right">Std / Expr</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto border-t border-stone-200">
                    {filteredCities.map((c) => {
                      const stdPrice = c.standard ? fmtPrice(c.standard.price) : '—';
                      const exprPrice = c.express ? fmtPrice(c.express.price) : '—';
                      const isSelected = selectedCity === c.name;
                      const showSlash = stdPrice !== '—' && exprPrice !== '—';
                      return (
                        <button
                          key={c.name}
                          onClick={() => setSelectedCity(c.name)}
                          className={`w-full grid grid-cols-3 gap-1 items-center px-2 py-1.5 rounded-lg text-left hover:bg-stone-50 ${
                            isSelected ? 'bg-[#0b2e22]/5 border border-[#cda552]/30' : ''
                          }`}
                        >
                          <span className="text-stone-900 font-medium truncate">{c.name}</span>
                          <StatusBadge status={c.status} />
                          <span className="text-right text-stone-600">
                            {showSlash ? `${stdPrice} / ${exprPrice}` : exprPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <CityDetails city={selectedCity ? cityIndex.find((c) => c.name === selectedCity) ?? null : null} onEditZone={openZoneModal} />
              </div>
            </div>
          )}

          {/* ── DELIVERY METHODS ── */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Delivery methods</h2>
                  <p className="text-sm text-stone-500">
                    Editing zone &ldquo;{selectedZone?.name ?? '—'}&rdquo;
                    {selectedCity && (
                      <span>
                        {' '}· selected city: <span className="font-semibold">{selectedCity}</span>
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('cities')}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
                >
                  Change city <ExternalLink size={12} />
                </button>
              </div>

              {!selectedZone ? (
                <div className="text-center py-10 text-stone-500 bg-white rounded-2xl border border-stone-200">
                  <Truck size={36} className="mx-auto mb-2 text-stone-300" />
                  <p>No zone selected. Pick a city in the Cities tab to start editing delivery methods.</p>
                </div>
              ) : (
                <MethodEditor key={selectedZone.id} zone={selectedZone} onSave={handleSaveMethods} isSaving={isSaving} />
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && <SettingsTab zones={shippingZones} />}
        </>
      )}

      {/* Modals */}
      <ZoneModal
        open={zoneModalOpen}
        onClose={closeZoneModal}
        onSave={handleSaveZone}
        title={editingZone ? `Edit &ldquo;${editingZone.name}&rdquo;` : 'Add Shipping Zone'}
        initial={editingZone ? zoneToForm(editingZone) : { name: '', cities: '', methods: DEFAULT_METHODS }}
        isSaving={isSaving}
      />
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete shipping zone"
        subject={zoneToDelete?.name ?? ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Shipping;

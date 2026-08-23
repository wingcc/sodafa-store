// Advanced Zone editor modal — full city + method management with professional UI.

import { useState } from 'react';
import { X, Plus, Trash2, MapPin, Truck, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { ShippingZone } from '../../../types';

interface MethodData {
  id?: string;
  name: string;
  slug: string;
  price: number;
  estimatedDays: number;
  estimatedHours: number | null;
  description: string;
}

interface CityData {
  id: string;
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  methods: MethodData[];
}

interface AdvancedZoneModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: {
    name: string;
    description: string;
    cities: {
      id: string;
      name: string;
      name_ar: string;
      latitude: number;
      longitude: number;
      methods: {
        id?: string;
        name: string;
        slug: string;
        price: number;
        estimated_days: number;
        estimated_hours: number | null;
        description: string;
      }[];
    }[];
  }) => Promise<void>;
  zone: ShippingZone;
  isSaving: boolean;
}

const EMPTY_METHOD: MethodData = {
  name: '',
  slug: 'standard',
  price: 0,
  estimatedDays: 2,
  estimatedHours: null,
  description: '',
};

function fmtPrice(n: number): string {
  return n === 0 ? 'Free' : `${n.toLocaleString()} MAD`;
}

// ─── City Card ──────────────────────────────────────────────────────────────
interface CityCardProps {
  city: CityData;
  onUpdate: (id: string, updates: Partial<CityData>) => void;
  onRemove: (id: string) => void;
  onAddMethod: (cityId: string) => void;
  onUpdateMethod: (cityId: string, methodIdx: number, updates: Partial<MethodData>) => void;
  onRemoveMethod: (cityId: string, methodIdx: number) => void;
}

function CityCard({ city, onUpdate, onRemove, onAddMethod, onUpdateMethod, onRemoveMethod }: CityCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden transition-shadow hover:shadow-sm">
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#0b2e22]/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-[#0b2e22]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-stone-900 truncate">{city.name}</h4>
              {city.nameAr && (
                <span className="text-xs text-stone-400 truncate">{city.nameAr}</span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {city.methods.length} method{city.methods.length !== 1 ? 's' : ''} &middot; {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onRemove(city.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Remove city"
          >
            <Trash2 size={15} />
          </button>
          <button type="button" className="p-1.5 text-stone-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100 space-y-4 pt-3">
          {/* City fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1 block">Name</label>
              <input
                type="text"
                value={city.name}
                onChange={(e) => onUpdate(city.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1 block">Arabic Name</label>
              <input
                type="text"
                value={city.nameAr}
                onChange={(e) => onUpdate(city.id, { nameAr: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1 block">Latitude</label>
              <input
                type="number"
                step="any"
                value={city.latitude}
                onChange={(e) => onUpdate(city.id, { latitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1 block">Longitude</label>
              <input
                type="number"
                step="any"
                value={city.longitude}
                onChange={(e) => onUpdate(city.id, { longitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
          </div>

          {/* Delivery methods */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Delivery Methods</label>
              <button
                type="button"
                onClick={() => onAddMethod(city.id)}
                className="flex items-center gap-1 text-xs font-semibold text-[#0b2e22] hover:text-[#cda552] transition-colors"
              >
                <Plus size={13} /> Add method
              </button>
            </div>

            {city.methods.length === 0 ? (
              <p className="text-xs text-stone-400 py-2">No methods configured.</p>
            ) : (
              <div className="space-y-2">
                {city.methods.map((m, mIdx) => (
                  <div key={mIdx} className="bg-stone-50 rounded-lg border border-stone-100 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={13} className={m.slug === 'express' ? 'text-purple-500' : 'text-[#0b2e22]'} />
                        <span className="text-xs font-semibold text-stone-700">
                          {m.name || `Method ${mIdx + 1}`}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          m.slug === 'express' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'
                        }`}>
                          {m.slug}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveMethod(city.id, mIdx)}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 mb-0.5 block">Name</label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => onUpdateMethod(city.id, mIdx, { name: e.target.value })}
                          placeholder="Standard Delivery"
                          className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0b2e22]/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 mb-0.5 block">Slug</label>
                        <select
                          value={m.slug}
                          onChange={(e) => onUpdateMethod(city.id, mIdx, { slug: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0b2e22]/20"
                        >
                          <option value="standard">standard</option>
                          <option value="express">express</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 mb-0.5 block">Price (MAD)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={m.price}
                          onChange={(e) => onUpdateMethod(city.id, mIdx, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0b2e22]/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 mb-0.5 block">Est. Days</label>
                        <input
                          type="number"
                          min={0}
                          value={m.estimatedDays}
                          onChange={(e) => onUpdateMethod(city.id, mIdx, { estimatedDays: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0b2e22]/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 mb-0.5 block">Est. Hours</label>
                        <input
                          type="number"
                          min={0}
                          value={m.estimatedHours ?? ''}
                          onChange={(e) => onUpdateMethod(city.id, mIdx, { estimatedHours: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                          placeholder="—"
                          className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0b2e22]/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 mb-0.5 block">Description</label>
                        <input
                          type="text"
                          value={m.description}
                          onChange={(e) => onUpdateMethod(city.id, mIdx, { description: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0b2e22]/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────
const AdvancedZoneModal = ({ open, onClose, onSave, zone, isSaving }: AdvancedZoneModalProps) => {
  const [name, setName] = useState(zone.name);
  const [description, setDescription] = useState(zone.description);
  const [cities, setCities] = useState<CityData[]>(
    zone.cities.map((c) => ({
      id: c.id,
      name: c.name,
      nameAr: c.nameAr,
      latitude: c.latitude,
      longitude: c.longitude,
      methods: c.methods.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        price: m.price,
        estimatedDays: m.estimatedDays,
        estimatedHours: m.estimatedHours,
        description: m.description,
      })),
    }))
  );

  const updateCity = (id: string, updates: Partial<CityData>) => {
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const addMethod = (cityId: string) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId
          ? { ...c, methods: [...c.methods, { ...EMPTY_METHOD }] }
          : c
      )
    );
  };

  const updateMethod = (cityId: string, methodIdx: number, updates: Partial<MethodData>) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId
          ? {
              ...c,
              methods: c.methods.map((m, i) => (i === methodIdx ? { ...m, ...updates } : m)),
            }
          : c
      )
    );
  };

  const removeMethod = (cityId: string, methodIdx: number) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId
          ? { ...c, methods: c.methods.filter((_, i) => i !== methodIdx) }
          : c
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      description: description.trim(),
      cities: cities.map((c) => ({
        id: c.id,
        name: c.name,
        name_ar: c.nameAr,
        latitude: c.latitude,
        longitude: c.longitude,
        methods: c.methods.map((m) => ({
          ...(m.id ? { id: m.id } : {}),
          name: m.name,
          slug: m.slug,
          price: m.price,
          estimated_days: m.estimatedDays,
          estimated_hours: m.estimatedHours,
          description: m.description,
        })),
      })),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-200 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Advanced Settings</h3>
              <p className="text-xs text-stone-500 mt-0.5">Edit cities, coordinates, and delivery methods</p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-500">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto p-5 space-y-5 flex-1 min-h-0">
            {/* Zone basics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>

            {/* Cities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-stone-700">
                  Cities ({cities.length})
                </label>
              </div>

              {cities.length === 0 ? (
                <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <MapPin size={28} className="mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">No cities in this zone.</p>
                  <p className="text-xs text-stone-400 mt-1">Go back and add cities first.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cities.map((city) => (
                    <CityCard
                      key={city.id}
                      city={city}
                      onUpdate={updateCity}
                      onRemove={removeCity}
                      onAddMethod={addMethod}
                      onUpdateMethod={updateMethod}
                      onRemoveMethod={removeMethod}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-stone-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50 transition-colors"
              style={{ background: 'linear-gradient(135deg, #0b2e22 0%, #061c16 100%)' }}
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Save All Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedZoneModal;

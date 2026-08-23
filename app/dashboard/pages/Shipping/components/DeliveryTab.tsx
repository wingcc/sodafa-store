// Delivery methods tab — card/table toggle view with search, filters, add/edit modal.

import { useState, useMemo } from 'react';
import {
  Search, Plus, Power, Pencil, Trash2, X, Clock,
  Truck, ChevronDown, ChevronUp, Loader2, RotateCcw,
  LayoutGrid, List,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { fmtPrice } from '../utils';
import type { ShippingZone, ShippingMethod } from '../../../types';

// ─── Flat method row (enriched with city/zone names) ───────────────────────
interface MethodRow extends ShippingMethod {
  cityName: string;
  zoneName: string;
}

interface AddMethodFormData {
  cityId: string;
  name: string;
  slug: string;
  price: string;
  estimatedDays: string;
  estimatedHours: string;
  description: string;
  isActive: boolean;
}

const EMPTY_FORM: AddMethodFormData = {
  cityId: '',
  name: '',
  slug: 'standard',
  price: '',
  estimatedDays: '2',
  estimatedHours: '',
  description: '',
  isActive: true,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtDeliveryTime(m: { estimatedDays: number; estimatedHours: number | null }): string {
  const d = m.estimatedDays ?? 0;
  const h = m.estimatedHours ?? 0;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d} day${d !== 1 ? 's' : ''}`);
  if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(', ') : '—';
}

// ─── Method card (collapsible) ──────────────────────────────────────────────
interface MethodCardProps {
  method: MethodRow;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function MethodCard({ method, onEdit, onDelete, onToggleActive }: MethodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isExpress = method.slug === 'express';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-shadow hover:shadow-sm">
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-stone-900">{method.name}</h3>
            <Badge variant={isExpress ? 'purple' : 'info'} dot>
              {isExpress ? 'Express' : 'Standard'}
            </Badge>
            {!method.isActive && (
              <Badge variant="danger" dot>Inactive</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              {method.cityName}
            </span>
            <span className="text-stone-300">|</span>
            <span>{method.zoneName}</span>
            <span className="text-stone-300">|</span>
            <span className="font-medium text-stone-700">{fmtPrice(method.price)}</span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-stone-400" />
              {fmtDeliveryTime(method)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleActive}
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              method.isActive
                ? 'text-green-600 hover:bg-green-50'
                : 'text-stone-400 hover:bg-stone-100'
            }`}
            title={method.isActive ? 'Deactivate' : 'Activate'}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">City</p>
              <p className="text-sm font-semibold text-stone-800">{method.cityName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">Zone</p>
              <p className="text-sm font-semibold text-stone-800">{method.zoneName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">Price</p>
              <p className="text-sm font-semibold text-stone-800">{fmtPrice(method.price)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">Delivery Time</p>
              <p className="text-sm font-semibold text-stone-800">{fmtDeliveryTime(method)}</p>
            </div>
          </div>
          {method.description && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-stone-600">{method.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit Method Modal ────────────────────────────────────────────────
interface MethodModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AddMethodFormData) => Promise<void>;
  isSaving: boolean;
  mode: 'add' | 'edit';
  initial?: AddMethodFormData;
  zones: ShippingZone[];
}

function MethodModal({ open, onClose, onSave, isSaving, mode, initial, zones }: MethodModalProps) {
  const [form, setForm] = useState<AddMethodFormData>(initial ?? EMPTY_FORM);
  const set = (k: keyof AddMethodFormData, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-lg font-bold text-stone-900">
            {mode === 'add' ? 'Add Delivery Method' : 'Edit Delivery Method'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
            <select
              value={form.cityId}
              onChange={(e) => set('cityId', e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
            >
              <option value="">Select a city</option>
              {zones.map((z) => (
                <optgroup key={z.id} label={z.name}>
                  {z.cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Method Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g., Standard Delivery"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
            <select
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
            >
              <option value="standard">Standard Delivery</option>
              <option value="express">Express Delivery</option>
            </select>
          </div>

          {/* Price + Est. Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price (MAD)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Est. Days</label>
              <input
                type="number"
                min={0}
                value={form.estimatedDays}
                onChange={(e) => set('estimatedDays', e.target.value)}
                placeholder="2"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
          </div>

          {/* Est. Hours + Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Est. Hours</label>
              <input
                type="number"
                min={0}
                value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)}
                placeholder="24"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-stone-700">Active</span>
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? 'bg-[#0b2e22]' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={isSaving || !form.cityId || !form.name}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: 'linear-gradient(135deg, #0b2e22 0%, #061c16 100%)' }}
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'add' ? 'Add Method' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab ───────────────────────────────────────────────────────────────
interface DeliveryTabProps {
  zones: ShippingZone[];
  onAddMethod: (m: { city_id: string; zone_id: string; name: string; slug: string; price: number; estimated_days: number; estimated_hours: number | null; description: string }) => Promise<{ success: boolean; error?: string }>;
  onUpdateMethod: (id: string, updates: Partial<{ name: string; slug: string; price: number; estimated_days: number; estimated_hours: number | null; description: string; is_active: boolean }>) => Promise<{ success: boolean; error?: string }>;
  onDeleteMethod: (id: string) => Promise<{ success: boolean; error?: string }>;
  isSaving: boolean;
}

const DeliveryTab = ({ zones, onAddMethod, onUpdateMethod, onDeleteMethod, isSaving }: DeliveryTabProps) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'standard' | 'express'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MethodRow | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Flatten all methods into rows
  const allMethods = useMemo<MethodRow[]>(() => {
    return zones.flatMap((z) =>
      z.cities.flatMap((c) =>
        c.methods.map((m) => ({
          ...m,
          cityName: c.name,
          zoneName: z.name,
        }))
      )
    );
  }, [zones]);

  // Filter
  const filtered = useMemo(() => {
    let list = allMethods;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.cityName.toLowerCase().includes(q) ||
          m.zoneName.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') list = list.filter((m) => m.slug === typeFilter);
    if (statusFilter !== 'all') list = list.filter((m) => (statusFilter === 'active' ? m.isActive : !m.isActive));
    return list;
  }, [allMethods, search, typeFilter, statusFilter]);

  // Group by slug type
  const grouped = useMemo(() => {
    const standard = filtered.filter((m) => m.slug === 'express' ? false : true);
    const express = filtered.filter((m) => m.slug === 'express');
    return { standard, express };
  }, [filtered]);

  const handleAdd = async (data: AddMethodFormData) => {
    if (!data.cityId || !data.name) return;
    const city = zones.flatMap((z) => z.cities.map((c) => ({ ...c, zoneId: z.id }))).find((c) => c.id === data.cityId);
    if (!city) return;
    const res = await onAddMethod({
      city_id: data.cityId,
      zone_id: city.zoneId,
      name: data.name,
      slug: data.slug,
      price: parseFloat(data.price) || 0,
      estimated_days: parseInt(data.estimatedDays, 10) || 2,
      estimated_hours: parseInt(data.estimatedHours, 10) || null,
      description: data.description,
    });
    if (res.success) setAddModalOpen(false);
  };

  const handleEdit = async (data: AddMethodFormData) => {
    if (!editTarget) return;
    const res = await onUpdateMethod(editTarget.id, {
      name: data.name,
      slug: data.slug,
      price: parseFloat(data.price) || 0,
      estimated_days: parseInt(data.estimatedDays, 10) || 2,
      estimated_hours: parseInt(data.estimatedHours, 10) || null,
      description: data.description,
      is_active: data.isActive,
    });
    if (res.success) setEditTarget(null);
  };

  const handleToggleActive = async (m: MethodRow) => {
    await onUpdateMethod(m.id, { is_active: !m.isActive });
  };

  const handleDelete = async (m: MethodRow) => {
    if (!confirm(`Delete "${m.name}" for ${m.cityName}?`)) return;
    await onDeleteMethod(m.id);
  };

  const editInitial: AddMethodFormData | undefined = editTarget
    ? {
        cityId: editTarget.cityId,
        name: editTarget.name,
        slug: editTarget.slug,
        price: String(editTarget.price ?? ''),
        estimatedDays: String(editTarget.estimatedDays ?? ''),
        estimatedHours: editTarget.estimatedHours != null ? String(editTarget.estimatedHours) : '',
        description: editTarget.description ?? '',
        isActive: editTarget.isActive,
      }
    : undefined;

  const totalMethods = allMethods.length;
  const activeCount = allMethods.filter((m) => m.isActive).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Delivery Methods</h2>
          <p className="text-sm text-stone-500">
            Manage Standard and Express delivery across all cities
            {totalMethods > 0 && (
              <span className="ml-2 text-stone-400">
                &middot; {totalMethods} method{totalMethods !== 1 ? 's' : ''} &middot; {activeCount} active
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-2 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#0b2e22] text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'
              }`}
              title="Card view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#0b2e22] text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'
              }`}
              title="Table view"
            >
              <List size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl shadow transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
          >
            <Plus size={16} /> Add Method
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search methods..."
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
        >
          <option value="all">All Types</option>
          <option value="standard">Standard Delivery</option>
          <option value="express">Express Delivery</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Method view */}
      {viewMode === 'cards' ? (
        /* ─── Card View ──────────────────────────────────────────── */
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200">
              <Truck size={40} className="mx-auto mb-3 text-stone-300" />
              <p>No delivery methods found.</p>
              <p className="text-xs text-stone-400 mt-1">Add a method or adjust your filters.</p>
            </div>
          ) : (
            <>
              {grouped.standard.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                    Standard Delivery ({grouped.standard.length})
                  </h3>
                  <div className="space-y-2">
                    {grouped.standard.map((m) => (
                      <MethodCard
                        key={m.id}
                        method={m}
                        onEdit={() => setEditTarget(m)}
                        onDelete={() => handleDelete(m)}
                        onToggleActive={() => handleToggleActive(m)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {grouped.express.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                    Express Delivery ({grouped.express.length})
                  </h3>
                  <div className="space-y-2">
                    {grouped.express.map((m) => (
                      <MethodCard
                        key={m.id}
                        method={m}
                        onEdit={() => setEditTarget(m)}
                        onDelete={() => handleDelete(m)}
                        onToggleActive={() => handleToggleActive(m)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ─── Table View ─────────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Truck size={40} className="mx-auto mb-3 text-stone-300" />
              <p>No delivery methods found.</p>
              <p className="text-xs text-stone-400 mt-1">Add a method or adjust your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-stone-500 border-b border-stone-200 bg-stone-50/50">
                    <th className="px-4 py-3 font-medium">METHOD</th>
                    <th className="px-4 py-3 font-medium">CITY</th>
                    <th className="px-4 py-3 font-medium">ZONE</th>
                    <th className="px-4 py-3 font-medium">PRICE</th>
                    <th className="px-4 py-3 font-medium">DELIVERY TIME</th>
                    <th className="px-4 py-3 font-medium">STATUS</th>
                    <th className="px-4 py-3 font-medium text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              m.slug === 'express' ? 'bg-purple-100' : 'bg-[#0b2e22]/10'
                            }`}
                          >
                            <Truck size={18} className={m.slug === 'express' ? 'text-purple-600' : 'text-[#0b2e22]'} />
                          </div>
                          <div>
                            <div className="font-medium text-stone-900">{m.name}</div>
                            <div className="text-xs text-stone-500 capitalize">{m.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{m.cityName}</td>
                      <td className="px-4 py-3 text-stone-700">{m.zoneName}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">{fmtPrice(m.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-stone-600">
                          <Clock size={14} className="text-stone-400" />
                          {(() => {
                            const d = m.estimatedDays ?? 0;
                            const h = m.estimatedHours ?? 0;
                            const parts: string[] = [];
                            if (d > 0) parts.push(`${d} day${d !== 1 ? 's' : ''}`);
                            if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
                            return parts.length > 0 ? parts.join(', ') : '—';
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            m.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-green-500' : 'bg-stone-400'}`} />
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(m)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              m.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-stone-400 hover:bg-stone-100'
                            }`}
                            title={m.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTarget(m)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#cda552] hover:bg-[#cda552]/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <MethodModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAdd}
        isSaving={isSaving}
        mode="add"
        zones={zones}
      />

      {/* Edit Modal */}
      <MethodModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        isSaving={isSaving}
        mode="edit"
        initial={editInitial}
        zones={zones}
      />
    </div>
  );
};

export default DeliveryTab;

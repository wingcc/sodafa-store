// SODFA MARKETPLACE - Delivery & Shipping Manager (tabbed)
//
// Tab-based manager for the shipping system. All data is read from / written
// to the live Supabase `delivery_zones` / `delivery_cities` / `delivery_methods`
// tables via the store -> /api/shipping routes.

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Package,
  MapPin,
  Truck,
  Settings as SettingsIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useToast } from '@/lib/toast';
import OverviewTab from './components/OverviewTab';
import ZonesTab from './components/ZonesTab';
import CitiesTab from './components/CitiesTab';
import DeliveryTab from './components/DeliveryTab';
import SettingsTab from './components/SettingsTab';
import ZoneModal from './components/ZoneModal';
import AdvancedZoneModal from './components/AdvancedZoneModal';
import DeleteConfirm from './components/DeleteConfirm';
import { cityZone, findCity, zoneStatus } from './utils';
import type {
  Tab,
  CityStatus,
  EnrichedCity,
} from './types';
import { MOROCCAN_CITIES } from '../../data/moroccoCities';
import type { ShippingZone } from '../../types';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
  { id: 'zones', label: 'Zones', icon: <Package size={16} /> },
  { id: 'cities', label: 'Cities', icon: <MapPin size={16} /> },
  { id: 'delivery', label: 'Delivery Methods', icon: <Truck size={16} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
];

// ─── Main page ─────────────────────────────────────────────────────────────
const Shipping: React.FC = () => {
  const {
    shippingZones,
    isLoadingShipping,
    shippingError,
    fetchShippingZones,
    addShippingZone,
    addCity,
    updateShippingZone,
    deleteShippingZone,
    addDeliveryMethod,
    updateDeliveryMethod,
    deleteDeliveryMethod,
  } = useStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
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
      const city = findCity(c.name, shippingZones);
      // Match status logic in MoroccoLeafletMap: no DB record → disabled
      let status: CityStatus;
      if (!city || city.isActive === false) status = 'disabled';
      else if (city.methods.length === 0) status = 'none';
      else status = city.methods.length >= 2 ? 'configured' : 'partial';
      return {
        name: c.name,
        nameAr: city?.nameAr ?? '',
        lat: c.lat,
        lng: c.lng,
        region: c.region,
        zone,
        city,
        status,
        standard: city ? (city.methods.find((m) => m.name.toLowerCase().includes('standard')) ?? null) : null,
        express: city ? (city.methods.find((m) => m.name.toLowerCase().includes('express')) ?? null) : null,
      };
    });
  }, [shippingZones]);

  const statusCounts = useMemo(() => {
    const c: Record<CityStatus, number> = { configured: 0, partial: 0, none: 0, disabled: 0 };
    for (const city of cityIndex) c[city.status] += 1;
    return c;
  }, [cityIndex]);

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

  const openAdvancedModal = () => {
    setZoneModalOpen(false);
    setAdvancedModalOpen(true);
  };

  const closeAdvancedModal = () => {
    setAdvancedModalOpen(false);
    setEditingZone(null);
  };

  const handleSaveAdvanced = async (input: {
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
  }) => {
    setIsSaving(true);
    try {
      if (editingZone) {
        await updateShippingZone(editingZone.id, {
          name: input.name,
          description: input.description,
          cities: input.cities,
        });
        addToast('success', 'Zone updated', { title: 'Success' });
      }
      closeAdvancedModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveZone = async (input: { name: string; description: string; city_ids: string[] }) => {
    setIsSaving(true);
    try {
      if (editingZone) {
        await updateShippingZone(editingZone.id, {
          name: input.name,
          description: input.description,
          city_ids: input.city_ids,
        });
        addToast('success', 'Zone updated', { title: 'Success' });
      } else {
        const res = await addShippingZone({
          name: input.name,
          description: input.description,
          city_ids: input.city_ids,
        });
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

  const expressTotal = useMemo(() => cityIndex.filter((c) => c.express).length, [cityIndex]);

  // ─── Overview stats ────────────────────────────────────────────────────
  const overviewStats = useMemo(() => {
    const totalZones = shippingZones.length;
    const totalCities = new Set<string>();
    shippingZones.forEach((z) => z.cities.forEach((c) => totalCities.add(c.name)));
    return {
      totalZones,
      totalCities: totalCities.size,
      configured: statusCounts.configured,
      partial: statusCounts.partial,
      none: statusCounts.none,
      disabled: statusCounts.disabled,
    };
  }, [shippingZones, statusCounts]);

  const initialForm: { name: string; description: string; cities: { id: string; name: string; nameAr: string }[] } | null = editingZone
    ? {
        name: editingZone.name,
        description: editingZone.description,
        cities: editingZone.cities.map((c) => ({ id: c.id, name: c.name, nameAr: c.nameAr })),
      }
    : null;

  // All cities across all zones for the autocomplete
  const allCities = useMemo(
    () => shippingZones.flatMap((z) => z.cities),
    [shippingZones],
  );

  return (
    <div className="space-y-5 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900" style={{ color: '#0b2e22' }}>
            Delivery &amp; Shipping Manager
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Morocco coverage &middot; zones &amp; delivery methods &middot; checkout prices
          </p>
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
        <nav className="flex gap-0 overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
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
          {activeTab === 'overview' && (
            <OverviewTab
              zones={shippingZones}
              statusCounts={statusCounts}
              overviewStats={overviewStats}
              expressTotal={expressTotal}
              onEdit={(zone) => openZoneModal(zone)}
              onDelete={(zone) => {
                setZoneToDelete(zone);
                setDeleteOpen(true);
              }}
              onToggleActive={async (zone) => {
                await updateShippingZone(zone.id, { isActive: !zone.isActive });
              }}
            />
          )}

          {activeTab === 'zones' && (
            <ZonesTab
              zones={shippingZones}
              onAdd={() => openZoneModal(null)}
              onEdit={(zone) => openZoneModal(zone)}
              onDelete={(zone) => {
                setZoneToDelete(zone);
                setDeleteOpen(true);
              }}
              onToggleActive={async (zone) => {
                await updateShippingZone(zone.id, { isActive: !zone.isActive });
              }}
            />
          )}

          {activeTab === 'cities' && (
            <CitiesTab
              zones={shippingZones}
              filteredCities={filteredCities}
              statusCounts={statusCounts}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              citySearch={citySearch}
              onCitySearchChange={setCitySearch}
              selectedCityDetails={
                selectedCity ? cityIndex.find((c) => c.name === selectedCity) ?? null : null
              }
              onEditZone={(zone) => openZoneModal(zone)}
              onRefresh={refresh}
              isLoading={isLoadingShipping}
              addCity={addCity}
            />
          )}

          {activeTab === 'delivery' && (
            <DeliveryTab
              zones={shippingZones}
              onAddMethod={addDeliveryMethod}
              onUpdateMethod={updateDeliveryMethod}
              onDeleteMethod={deleteDeliveryMethod}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'settings' && <SettingsTab zones={shippingZones} />}
        </>
      )}

      {/* Modals */}
      <ZoneModal
        open={zoneModalOpen}
        onClose={closeZoneModal}
        onSave={handleSaveZone}
        onAdvanced={openAdvancedModal}
        title={editingZone ? `Edit "${editingZone.name}"` : 'Add Shipping Zone'}
        initial={initialForm}
        isSaving={isSaving}
        allCities={allCities}
      />
      {editingZone && (
        <AdvancedZoneModal
          open={advancedModalOpen}
          onClose={closeAdvancedModal}
          onSave={handleSaveAdvanced}
          zone={editingZone}
          isSaving={isSaving}
        />
      )}
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

// Overview tab — stat cards, coverage progress, zones health table.

import { Package, MapPin, CheckCircle2, AlertCircle, Truck, Clock, Power, Pencil, Trash2 } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import { MOROCCAN_CITIES } from '../../../data/moroccoCities';
import type { ShippingZone } from '../../../types';
import type { CityStatus } from '../types';

interface OverviewStats {
  totalZones: number;
  totalCities: number;
  configured: number;
  partial: number;
  none: number;
  disabled: number;
}

interface OverviewTabProps {
  zones: ShippingZone[];
  statusCounts: Record<CityStatus, number>;
  overviewStats: OverviewStats;
  expressTotal: number;
  onEdit: (zone: ShippingZone) => void;
  onDelete: (zone: ShippingZone) => void;
  onToggleActive: (zone: ShippingZone) => void;
}

const OverviewTab = ({
  zones,
  statusCounts,
  overviewStats,
  expressTotal,
  onEdit,
  onDelete,
  onToggleActive,
}: OverviewTabProps) => {
  return (
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
        <StatCard
          title="Disabled"
          value={String(overviewStats.disabled)}
          icon={<AlertCircle size={20} className="text-gray-400" />}
          iconBg="bg-gray-50"
          iconColor="text-gray-400"
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

      {/* ── Coverage progress ── */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-stone-900">Coverage progress</h3>
          <span className="text-xs font-medium text-stone-500">
            {overviewStats.configured} / {MOROCCAN_CITIES.length} cities
            <span className="ml-1 text-stone-400">
              ({MOROCCAN_CITIES.length ? Math.round((overviewStats.configured / MOROCCAN_CITIES.length) * 100) : 0}%)
            </span>
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${MOROCCAN_CITIES.length ? Math.round((overviewStats.configured / MOROCCAN_CITIES.length) * 100) : 0}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
            }}
          />
        </div>
        <div className="flex gap-3 mt-2 text-xs text-stone-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {overviewStats.configured} configured
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> {overviewStats.partial} partial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> {overviewStats.none} not configured
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> {overviewStats.disabled} disabled
          </span>
        </div>
      </div>

      {/* ── Zones overview table ── */}
      {zones.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/50">
            <h3 className="font-bold text-sm text-stone-900">Zones overview</h3>
            <p className="text-xs text-stone-500">Health per zone — cities &amp; method coverage at a glance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-stone-500 border-b border-stone-200 bg-stone-50/50">
                  <th className="px-4 py-3 font-medium">ZONE</th>
                  <th className="px-4 py-3 font-medium">CITIES</th>
                  <th className="px-4 py-3 font-medium">CONFIGURED</th>
                  <th className="px-4 py-3 font-medium">STANDARD</th>
                  <th className="px-4 py-3 font-medium">EXPRESS</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => {
                  const totalCities = zone.cities.length;
                  const citiesWithStandard = zone.cities.filter((c) =>
                    c.methods.some((m) => m.slug === 'standard')
                  ).length;
                  const citiesWithExpress = zone.cities.filter((c) =>
                    c.methods.some((m) => m.slug === 'express')
                  ).length;
                  const configuredCount = zone.cities.filter((c) =>
                    c.methods.length >= 2 || (c.methods.length >= 1 && c.methods.some((m) => m.slug === 'standard'))
                  ).length;
                  const isDisabled = zone.isActive === false;

                  return (
                    <tr key={zone.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-stone-900">{zone.name}</td>
                      <td className="px-4 py-3 text-stone-700">{totalCities}</td>
                      <td className="px-4 py-3 text-stone-700">{configuredCount} / {totalCities}</td>
                      <td className="px-4 py-3">
                        {citiesWithStandard > 0 ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {citiesWithExpress > 0 ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isDisabled ? (
                          <Badge variant="danger" dot>Inactive</Badge>
                        ) : (
                          <Badge variant="success" dot>Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onToggleActive(zone)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              zone.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-stone-400 hover:bg-stone-100'
                            }`}
                            title={zone.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(zone)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#cda552] hover:bg-[#cda552]/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(zone)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
  );
};

export default OverviewTab;

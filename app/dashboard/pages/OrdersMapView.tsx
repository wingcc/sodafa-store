'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Map as MapcnMap,
  MapMarker,
  MapPopup,
  MapArc,
  MapControls,
  MarkerContent,
  MarkerLabel,
  type MapArcDatum,
} from '@/components/ui/map';
import { MOROCCAN_CITIES, normalizeCity } from '../data/moroccoCities';
import {
  MapPin,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';
import type { Order } from '../types';

interface OrderArcDatum extends MapArcDatum {
  orderId: string;
  orderNumber: string;
  customerName: string;
  city: string;
  status: string;
}

interface CityGroup {
  lat: number;
  lng: number;
  cityName: string;
  orders: Order[];
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#a855f7',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusIconComponents: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  pending: AlertCircle,
  confirmed: RefreshCw,
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

function getStatusIcon(status: string, size: number = 10, color?: string) {
  const Icon = statusIconComponents[status] ?? AlertCircle;
  return <Icon size={size} style={color ? { color } : undefined} />;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MA', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(amount) + ' MAD';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface OrdersMapViewProps {
  orders: Order[];
  storeCity: string;
  onStoreCityChange: (city: string) => void;
  onOrderSelect: (order: Order) => void;
}

export default function OrdersMapView({
  orders,
  storeCity,
  onStoreCityChange,
  onOrderSelect,
}: OrdersMapViewProps) {
  const [hoveredArc, setHoveredArc] = useState<OrderArcDatum | null>(null);
  const [hoveredPopupCoords, setHoveredPopupCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CityGroup | null>(null);

  const storeCoords = useMemo(() => {
    const normalized = normalizeCity(storeCity);
    const match = MOROCCAN_CITIES.find((c) => normalizeCity(c.name) === normalized);
    return match ?? { name: storeCity, lat: 31.63, lng: -7.99 };
  }, [storeCity]);

  const ordersWithCoords = useMemo(() => {
    return orders
      .map((order) => {
        const rawCity = order.shippingAddress.city;
        const normalized = normalizeCity(rawCity);
        const match = MOROCCAN_CITIES.find(
          (c) => normalizeCity(c.name) === normalized,
        );
        if (!match) return null;
        return {
          order,
          lat: match.lat,
          lng: match.lng,
          cityName: match.name,
        };
      })
      .filter(Boolean) as Array<{
      order: Order;
      lat: number;
      lng: number;
      cityName: string;
    }>;
  }, [orders]);

  const cityGroups = useMemo<CityGroup[]>(() => {
    const groups = new Map<string, CityGroup>();
    for (const item of ordersWithCoords) {
      const key = normalizeCity(item.cityName);
      if (!groups.has(key)) {
        groups.set(key, {
          lat: item.lat,
          lng: item.lng,
          cityName: item.cityName,
          orders: [],
        });
      }
      groups.get(key)!.orders.push(item.order);
    }
    return Array.from(groups.values());
  }, [ordersWithCoords]);

  const arcs = useMemo<OrderArcDatum[]>(() => {
    return ordersWithCoords
      .filter(
        (o) =>
          o.order.orderStatus === 'processing' ||
          o.order.orderStatus === 'shipped',
      )
      .map((o) => ({
        id: o.order.id,
        from: [storeCoords.lng, storeCoords.lat] as [number, number],
        to: [o.lng, o.lat] as [number, number],
        orderId: o.order.id,
        orderNumber: o.order.orderNumber,
        customerName: o.order.customerName,
        city: o.cityName,
        status: o.order.orderStatus,
      }));
  }, [ordersWithCoords, storeCoords]);

  const handleLocate = useCallback(
    (coords: { longitude: number; latitude: number }) => {
      let nearest = MOROCCAN_CITIES[0];
      let minDist = Infinity;
      for (const city of MOROCCAN_CITIES) {
        const d = Math.hypot(
          city.lng - coords.longitude,
          city.lat - coords.latitude,
        );
        if (d < minDist) {
          minDist = d;
          nearest = city;
        }
      }
      if (nearest) {
        onStoreCityChange(nearest.name);
      }
    },
    [onStoreCityChange],
  );

  const mapCenter: [number, number] = [storeCoords.lng, storeCoords.lat];

  return (
    <div className="relative w-full h-[600px] rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
      <MapcnMap
        center={mapCenter}
        zoom={7}
        minZoom={4}
        maxZoom={15}
        className="w-full h-full"
      >
        <MapControls
          position="bottom-right"
          showZoom
          showFullscreen
          showLocate
          onLocate={handleLocate}
        />

        {/* Dotted arcs: processing + shipped orders */}
        <MapArc<OrderArcDatum>
          data={arcs}
          curvature={0.15}
          paint={{
            'line-width': 2.5,
            'line-opacity': 0.8,
            'line-color': [
              'match',
              ['get', 'status'],
              'processing',
              '#a855f7',
              'shipped',
              '#6366f1',
              '#888888',
            ] as any,
            'line-dasharray': [4, 3],
          }}
          hoverPaint={{
            'line-width': 4,
            'line-opacity': 1,
          }}
          onHover={(e) => {
            if (e) {
              setHoveredArc(e.arc);
              setHoveredPopupCoords({ lng: e.longitude, lat: e.latitude });
            } else {
              setHoveredArc(null);
              setHoveredPopupCoords(null);
            }
          }}
        />

        {/* Store marker — star shape with amber color */}
        <MapMarker longitude={storeCoords.lng} latitude={storeCoords.lat}>
          <MarkerContent>
            <div className="relative cursor-pointer group">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="drop-shadow-lg group-hover:scale-110 transition-transform"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(217,119,6,0.4))',
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                {storeCoords.name}
              </div>
            </div>
          </MarkerContent>
        </MapMarker>

        {/* Order city markers */}
        {cityGroups.map((group: CityGroup) => {
          const count = group.orders.length;
          // Find the most common status in this group for the dot color
          const statusCounts: Record<string, number> = {};
          for (const o of group.orders) {
            statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
          }
          const dominantStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'pending';
          const dotColor = statusColors[dominantStatus] ?? '#0a2c23';
          const dotSize = count > 5 ? 44 : count > 2 ? 36 : 28;
          const iconSize = count > 5 ? 18 : count > 2 ? 14 : 11;

          return (
            <MapMarker
              key={group.cityName}
              longitude={group.lng}
              latitude={group.lat}
              onClick={() => setSelectedGroup(group)}
            >
              <MarkerContent>
                <div className="relative group cursor-pointer">
                  <div
                    className="rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 flex items-center justify-center"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: dotColor,
                    }}
                  >
                    {getStatusIcon(dominantStatus, iconSize, '#ffffff')}
                  </div>
                  {count > 1 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[8px] font-bold text-gray-800 flex items-center justify-center shadow-md border border-gray-200">
                      {count}
                    </div>
                  )}
                </div>
              </MarkerContent>
              <MarkerLabel
                position="top"
                className="bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-sm border border-gray-200"
              >
                {group.cityName}
              </MarkerLabel>
            </MapMarker>
          );
        })}

        {/* Arc hover tooltip */}
        {hoveredArc && hoveredPopupCoords && (
          <MapPopup
            longitude={hoveredPopupCoords.lng}
            latitude={hoveredPopupCoords.lat}
            offset={12}
            closeButton={false}
          >
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs">
              {getStatusIcon(hoveredArc.status, 12, statusColors[hoveredArc.status] ?? '#888')}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    statusColors[hoveredArc.status] ?? '#888',
                }}
              />
              <span className="font-medium text-gray-900">
                {storeCoords.name} &rarr; {hoveredArc.city}
              </span>
              <span className="text-gray-400 border-l border-gray-200 pl-2 ml-1">
                {hoveredArc.orderNumber}
              </span>
            </div>
          </MapPopup>
        )}

        {/* City group popup — shows all orders in clicked city */}
        {selectedGroup && (
          <MapPopup
            longitude={selectedGroup.lng}
            latitude={selectedGroup.lat}
            offset={20}
            closeButton
            onClose={() => setSelectedGroup(null)}
          >
            <div className="w-72 max-h-80 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedGroup.cityName}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {selectedGroup.orders.length} order
                  {selectedGroup.orders.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Order list */}
              <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                {selectedGroup.orders.map((order) => {
                  const color = statusColors[order.orderStatus] ?? '#888';
                  const label = statusLabels[order.orderStatus] ?? order.orderStatus;
                  return (
                    <div
                      key={order.id}
                      className="px-3 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-semibold text-gray-900 truncate">
                              {order.orderNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                            {order.customerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-medium text-gray-700">
                              {formatCurrency(order.total)}
                            </span>
                            <span className="text-gray-300">·</span>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              {getStatusIcon(order.orderStatus, 10, color)}
                              <span className="text-[10px] text-gray-500">
                                {label}
                              </span>
                            </div>
                            <span className="text-gray-300">·</span>
                            <span className="text-[10px] text-gray-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onOrderSelect(order)}
                          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          <Eye size={10} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </MapPopup>
        )}
      </MapcnMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
        <div className="flex items-center gap-3 text-[10px] text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="#d97706"
              stroke="#ffffff"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Store</span>
          </div>
          <div className="h-3 w-px bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0a2c23]" />
            <span>Orders</span>
          </div>
          <div className="h-3 w-px bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed border-[#a855f7]" />
            <Clock size={10} className="text-[#a855f7]" />
            <span>Processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed border-[#6366f1]" />
            <Truck size={10} className="text-[#6366f1]" />
            <span>Shipped</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {ordersWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-20">
          <div className="text-center">
            <Package size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              No orders to display
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Orders need a matching city in the reference data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

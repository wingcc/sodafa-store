// Shared types & form models for the Shipping page split.

import type { ShippingZone, ShippingCity, ShippingMethod } from '../../types';

export type Tab = 'overview' | 'zones' | 'cities' | 'delivery' | 'settings';

export type MethodPayload = {
  id?: string;
  city_id?: string;
  name: string;
  slug?: string;
  price?: number;
  estimated_days?: number;
  estimated_hours?: number | null;
  description?: string;
  isActive?: boolean;
};

export type CityPayload = {
  id?: string;
  name: string;
  name_ar?: string;
  latitude?: number;
  longitude?: number;
  methods?: MethodPayload[];
};

export type ZonePayload = {
  name: string;
  description?: string;
  cities: CityPayload[];
};

export type CityStatus = 'configured' | 'partial' | 'none' | 'disabled';

export type EnrichedCity = {
  name: string;
  nameAr: string;
  lat: number;
  lng: number;
  region: string;
  zone: ShippingZone | null;
  city: ShippingCity | null;
  status: CityStatus;
  standard: ShippingMethod | null;
  express: ShippingMethod | null;
};

export interface MethodForm {
  id?: string;
  name: string;
  slug: string;
  price: string;
  estimatedDays: string;
  estimatedHours: string;
  description: string;
}

export interface ZoneForm {
  name: string;
  description: string;
  cities: CityForm[];
}

export interface CityForm {
  id?: string;
  name: string;
  nameAr: string;
  latitude: string;
  longitude: string;
  methods: MethodForm[];
}

export const DEFAULT_METHODS: MethodForm[] = [
  { name: 'Standard Delivery', slug: 'standard', price: '30', estimatedDays: '2', estimatedHours: '', description: 'Standard home delivery' },
  { name: 'Express Delivery', slug: 'express', price: '50', estimatedDays: '1', estimatedHours: '24', description: 'Fast express delivery' },
];

export const DEFAULT_CITY: CityForm = {
  name: '',
  nameAr: '',
  latitude: '',
  longitude: '',
  methods: DEFAULT_METHODS,
};

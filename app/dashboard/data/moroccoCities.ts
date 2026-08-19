// SODFA MARKETPLACE - Morocco geographic reference data (coordinates only)
//
// NOTE: This file stores only GEOGRAPHIC coordinates (lat/lng) of real Moroccan
// cities and the country outline. It is NOT shipping/delivery data.
// Delivery STATUS is always derived at runtime from the live `shipping_zones`
// and `shipping_methods` rows served from Supabase — never hard-coded here.

export interface MoroccanCity {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

/**
 * Major Moroccan urban centres (cities appear on the delivery map).
 * Coordinates are real WGS84 latitude/longitude values.
 */
export const MOROCCAN_CITIES: MoroccanCity[] = [
  { name: 'Tangier', lat: 35.7598, lng: -5.834, region: 'Tanger-Tetouan-Al Hoceima' },
  { name: 'Tetouan', lat: 35.5764, lng: -5.3671, region: 'Tanger-Tetouan-Al Hoceima' },
  { name: 'Fnideq', lat: 35.6744, lng: -5.5261, region: 'Tanger-Tetouan-Al Hoceima' },
  { name: 'Chefchaouen', lat: 35.1397, lng: -5.2702, region: 'Tanger-Tetouan-Al Hoceima' },
  { name: 'Larache', lat: 35.2018, lng: -6.147, region: 'Tanger-Tetouan-Al Hoceima' },
  { name: 'Nador', lat: 35.1650, lng: -3.9100, region: 'Oriental' },
  { name: 'Oujda', lat: 34.9156, lng: -1.8912, region: 'Oriental' },
  { name: 'Al Hoceima', lat: 35.2470, lng: -3.9550, region: 'Oriental' },
  { name: 'Rabat', lat: 34.2889, lng: -6.5712, region: 'Rabat-Sale-Kenitra' },
  { name: 'Sale', lat: 34.0467, lng: -6.5947, region: 'Rabat-Sale-Kenitra' },
  { name: 'Kenitra', lat: 34.2613, lng: -6.5860, region: 'Rabat-Sale-Kenitra' },
  { name: 'Temara', lat: 34.0400, lng: -6.8384, region: 'Rabat-Sale-Kenitra' },
  { name: 'Casablanca', lat: 31.6300, lng: -7.9900, region: 'Casablanca-Settat' },
  { name: 'Mohammedia', lat: 31.6420, lng: -8.0741, region: 'Casablanca-Settat' },
  { name: 'Settat', lat: 33.0079, lng: -7.0271, region: 'Casablanca-Settat' },
  { name: 'El Jadida', lat: 31.9459, lng: -8.6497, region: 'Casablanca-Settat' },
  { name: 'Marrakech', lat: 31.6300, lng: -8.0183, region: 'Marrakech-Safi' },
  { name: 'Essaouira', lat: 31.5147, lng: -9.7627, region: 'Marrakech-Safi' },
  { name: 'Safi', lat: 32.2987, lng: -9.2483, region: 'Marrakech-Safi' },
  { name: 'Agadir', lat: 30.4270, lng: -9.5878, region: 'Souss-Massa' },
  { name: 'Inezgane', lat: 30.4469, lng: -9.5855, region: 'Souss-Massa' },
  { name: 'Taroudant', lat: 30.9215, lng: -8.0936, region: 'Souss-Massa' },
  { name: 'Tarfaya', lat: 27.9256, lng: -11.0616, region: 'Souss-Massa' },
  { name: 'Guelmine', lat: 28.0387, lng: -10.3676, region: 'Guelmine-Oued Noun' },
  { name: 'Ouarzazate', lat: 30.7900, lng: -6.9100, region: 'Drâa-Tafilalet' },
  { name: 'Laayoune', lat: 27.1256, lng: -13.2126, region: 'Laâd Dakhla' },
  { name: 'Dakhla', lat: 23.9330, lng: -15.9500, region: 'Dakhla-Oued Ad-Dahab' },
  { name: 'Fez', lat: 34.0184, lng: -5.0099, region: 'Fès-Meknès' },
  { name: 'Meknes', lat: 33.4712, lng: -5.5383, region: 'Fès-Meknès' },
  { name: 'Taza', lat: 34.1961, lng: -5.4244, region: 'Taza' },
  { name: 'Beni Mellal', lat: 32.3069, lng: -6.1728, region: 'Béni Mellal-Khénifra' },
  { name: 'Khouribga', lat: 32.2934, lng: -6.6477, region: 'Béni Mellal-Khénifra' },
];

/** Morocco (incl. Western Sahara) border as a clockwise ring of [lat, lng]. */
export const MOROCCO_BORDER: [number, number][] = [
  [35.9, -5.3],
  [35.6, -4.3],
  [35.4, -2.6],
  [35.1, -1.8],
  [34.7, -1.3],
  [33.8, -1.1],
  [32.0, -1.05],
  [30.0, -1.1],
  [28.0, -1.4],
  [26.5, -2.2],
  [25.2, -4.2],
  [24.5, -7.8],
  [24.8, -10.5],
  [25.6, -12.4],
  [26.8, -13.1],
  [28.0, -12.8],
  [30.2, -11.5],
  [31.2, -10.0],
  [31.6, -9.5],
  [32.0, -8.8],
  [32.4, -8.0],
  [32.8, -7.2],
  [33.2, -6.4],
  [33.5, -5.7],
  [34.0, -5.2],
  [34.5, -5.0],
  [35.2, -5.2],
  [35.9, -5.3],
];

// ─── Map projection (equirectangular → SVG viewBox) ─────────────────────────
export const MAP_BOUNDS = {
  latMin: 23.2,
  latMax: 36.2,
  lngMin: -16.6,
  lngMax: -0.8,
};
export const MAP_VIEWBOX_W = 1040;
export const MAP_VIEWBOX_H = 1120;
const MARGIN = 44;

export function projectLatLon(lat: number, lng: number) {
  const { latMin, latMax, lngMin, lngMax } = MAP_BOUNDS;
  const plotW = MAP_VIEWBOX_W - 2 * MARGIN;
  const plotH = MAP_VIEWBOX_H - 2 * MARGIN;
  const x = MARGIN + ((lng - lngMin) / (lngMax - lngMin)) * plotW;
  const y = MARGIN + (1 - (lat - latMin) / (latMax - latMin)) * plotH;
  return { x, y };
}

/**
 * Normalize a city name so that spelling variants (accents, "Tanger" vs
 * "Tangier", case, …) compare equal. Applied to BOTH the DB zone cities and
 * the map city list so matches are robust.
 */
const CITY_ALIASES: Record<string, string> = {
  tanger: 'tangier',
  meknas: 'meknes',
};

export function normalizeCity(name: string): string {
  const key = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return CITY_ALIASES[key] ?? key;
}

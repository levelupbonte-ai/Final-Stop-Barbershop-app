/**
 * Centralized Mapbox Token resolution supporting all common environment variable names
 * (VITE_MAPBOX_TOKEN, VITE_MAPBOX_ACCESS_TOKEN, MAPBOX_ACCESS_TOKEN)
 * with robust, zero-error fallback basemap.
 */

// Elegant high-contrast dark raster style requiring zero authentication or API tokens
export const CARTO_DARK_MAP_STYLE: any = {
  version: 8,
  name: 'Carto Dark Matte',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export function getMapboxToken(): string {
  let token = '';

  // Check Vite client-exposed variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    token =
      import.meta.env.VITE_MAPBOX_TOKEN ||
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
      (import.meta.env as any).MAPBOX_ACCESS_TOKEN ||
      '';
  }

  // Check process.env (e.g. if injected via build/Vercel)
  if (!token && typeof process !== 'undefined' && process.env) {
    token =
      process.env.VITE_MAPBOX_TOKEN ||
      process.env.VITE_MAPBOX_ACCESS_TOKEN ||
      process.env.MAPBOX_ACCESS_TOKEN ||
      '';
  }

  // Check localStorage if custom token was saved
  if (!token && typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('finalstop_mapbox_token') || '';
  }

  token = String(token).trim();

  // Exclude revoked / expired demo keys
  if (
    token === 'pk.eyJ1IjoibGV2ZWx1cC1lY28iLCJhIjoiY21lcTllbDZpMG56bjJzcTM3Y2k0aWoxdSJ9.wX6p-oIugm-R5B_X_aE1ug' ||
    token === 'YOUR_MAPBOX_ACCESS_TOKEN' ||
    token === 'undefined' ||
    token === 'null'
  ) {
    return '';
  }

  return token;
}

/**
 * Checks if a real, properly formatted Mapbox public token is available
 */
export function hasValidMapboxToken(): boolean {
  const token = getMapboxToken();
  return Boolean(
    token &&
    token.startsWith('pk.') &&
    token.split('.').length === 3 &&
    token.length > 30
  );
}

/**
 * Map style resolution:
 * Uses custom barbershop Mapbox Studio style only if a valid Mapbox token is provided.
 * Otherwise, seamlessly defaults to CARTO_DARK_MAP_STYLE without any 401 errors.
 */
export function getMapboxStyle(): any {
  if (hasValidMapboxToken()) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_STYLE) {
      return String(import.meta.env.VITE_MAPBOX_STYLE).trim();
    }
    return 'mapbox://styles/levelup23h/cmtqfuyka00g001slhswg1pfv';
  }
  return CARTO_DARK_MAP_STYLE;
}

/**
 * Configure mapboxgl safely before map creation to prevent unauthorized API requests
 */
export function setupMapboxGl(mapboxgl: any): void {
  if (!mapboxgl) return;

  if (hasValidMapboxToken()) {
    mapboxgl.accessToken = getMapboxToken();
    try {
      if (mapboxgl.config) {
        mapboxgl.config.REQUIRE_ACCESS_TOKEN = true;
      }
    } catch (_) {}
  } else {
    mapboxgl.accessToken = '';
    try {
      if (mapboxgl.config) {
        mapboxgl.config.REQUIRE_ACCESS_TOKEN = false;
      }
    } catch (_) {}
  }
}



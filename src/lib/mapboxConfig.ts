/**
 * Centralized Mapbox Token resolution and style fallback.
 * If no valid token is provided in environment variables (VITE_MAPBOX_TOKEN / MAPBOX_ACCESS_TOKEN),
 * the app cleanly falls back to a dark map style with zero external token requirements,
 * completely preventing Mapbox 401 token authentication errors.
 */

export function getMapboxToken(): string {
  let token = '';

  // Check Vite client-exposed variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    token = (import.meta.env.VITE_MAPBOX_TOKEN as string)
      || (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string)
      || ((import.meta.env as any).MAPBOX_ACCESS_TOKEN as string)
      || '';
  }

  // Check process.env (e.g. if injected via build)
  if (!token && typeof process !== 'undefined' && process.env) {
    token = process.env.VITE_MAPBOX_TOKEN
      || process.env.VITE_MAPBOX_ACCESS_TOKEN
      || process.env.MAPBOX_ACCESS_TOKEN
      || '';
  }

  token = String(token).trim();

  // If token is empty, an invalid dummy, or the expired test token, do not return it
  if (!token || !token.startsWith('pk.') || token.length < 35 || token.includes('pk.eyJ1IjoibGV2ZWx1cC1lY28i')) {
    return '';
  }

  return token;
}

export function hasValidMapboxToken(): boolean {
  return Boolean(getMapboxToken());
}

/**
 * Clean, high-contrast dark map style using free Carto Dark Matter raster tiles.
 * Works 100% reliably worldwide without any Mapbox account or token credentials.
 */
export const FALLBACK_DARK_MAP_STYLE: any = {
  version: 8,
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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
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

export function getMapStyle(): string | any {
  const token = getMapboxToken();
  if (token) {
    return 'mapbox://styles/mapbox/dark-v11';
  }
  return FALLBACK_DARK_MAP_STYLE;
}


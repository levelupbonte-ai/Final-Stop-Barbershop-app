/**
 * Centralized Mapbox Token resolution supporting all common environment variable names
 * (VITE_MAPBOX_TOKEN, VITE_MAPBOX_ACCESS_TOKEN, MAPBOX_ACCESS_TOKEN)
 * with graceful fallback.
 */

export function getMapboxToken(): string {
  // Check Vite client-exposed variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_MAPBOX_TOKEN) {
      return String(import.meta.env.VITE_MAPBOX_TOKEN).trim();
    }
    if (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
      return String(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN).trim();
    }
    if ((import.meta.env as any).MAPBOX_ACCESS_TOKEN) {
      return String((import.meta.env as any).MAPBOX_ACCESS_TOKEN).trim();
    }
  }

  // Check process.env (e.g. if injected via build/Vercel)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_MAPBOX_TOKEN) {
      return String(process.env.VITE_MAPBOX_TOKEN).trim();
    }
    if (process.env.VITE_MAPBOX_ACCESS_TOKEN) {
      return String(process.env.VITE_MAPBOX_ACCESS_TOKEN).trim();
    }
    if (process.env.MAPBOX_ACCESS_TOKEN) {
      return String(process.env.MAPBOX_ACCESS_TOKEN).trim();
    }
  }

  // Fallback demo public key if none provided
  return 'pk.eyJ1IjoibGV2ZWx1cC1lY28iLCJhIjoiY21lcTllbDZpMG56bjJzcTM3Y2k0aWoxdSJ9.wX6p-oIugm-R5B_X_aE1ug';
}

/**
 * Custom Mapbox map style URL
 * Defaults to the custom elite barbershop style provided by user:
 * mapbox://styles/levelup23h/cmtqfuyka00g001slhswg1pfv
 */
export function getMapboxStyle(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_MAPBOX_STYLE) {
      return String(import.meta.env.VITE_MAPBOX_STYLE).trim();
    }
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_MAPBOX_STYLE) {
      return String(process.env.VITE_MAPBOX_STYLE).trim();
    }
    if (process.env.MAPBOX_STYLE) {
      return String(process.env.MAPBOX_STYLE).trim();
    }
  }
  return 'mapbox://styles/levelup23h/cmtqfuyka00g001slhswg1pfv';
}


// lib/mapLinks.ts

export const SHOP_COORDINATES = {
  lat: 32.7572493,
  lng: -117.0820005,
  name: "Final Stop Barber Shop",
  address: "5277 El Cajon Blvd, San Diego, CA 92115",
  phone: "+1 (619) 886-1267"
};

/**
 * Detects if the current user device is an Apple device (iPhone, iPad, Mac)
 */
export const isAppleDevice = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /iPad|iPhone|iPod|Macintosh|Mac OS X/i.test(ua);
};

/**
 * Detects if the current user device is Android
 */
export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;
  const ua = navigator.userAgent || '';
  return /Android/i.test(ua);
};

export type TravelMode = 'driving' | 'transit' | 'bicycling' | 'walking';

interface RouteOptions {
  originLat?: number;
  originLng?: number;
  originAddress?: string;
  mode?: TravelMode;
}

/**
 * Generates an Apple Maps direction URL
 */
export const getAppleMapsUrl = (options?: RouteOptions): string => {
  const { lat, lng, address } = SHOP_COORDINATES;
  let dirflg = 'd'; // driving default
  if (options?.mode === 'transit') dirflg = 'r';
  else if (options?.mode === 'walking') dirflg = 'w';
  else if (options?.mode === 'bicycling') dirflg = 'b';

  if (options?.originLat && options?.originLng) {
    return `https://maps.apple.com/?saddr=${options.originLat},${options.originLng}&daddr=${lat},${lng}&dirflg=${dirflg}`;
  }
  if (options?.originAddress) {
    return `https://maps.apple.com/?saddr=${encodeURIComponent(options.originAddress)}&daddr=${encodeURIComponent(address)}&dirflg=${dirflg}`;
  }
  return `https://maps.apple.com/?daddr=${encodeURIComponent(address)}&dirflg=${dirflg}`;
};

/**
 * Generates a Google Maps direction URL
 */
export const getGoogleMapsUrl = (options?: RouteOptions): string => {
  const { lat, lng, address } = SHOP_COORDINATES;
  let travelmode = 'driving';
  if (options?.mode === 'transit') travelmode = 'transit';
  else if (options?.mode === 'walking') travelmode = 'walking';
  else if (options?.mode === 'bicycling') travelmode = 'bicycling';

  if (options?.originLat && options?.originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${options.originLat},${options.originLng}&destination=${lat},${lng}&travelmode=${travelmode}`;
  }
  if (options?.originAddress) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(options.originAddress)}&destination=${encodeURIComponent(address)}&travelmode=${travelmode}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=${travelmode}`;
};

/**
 * Generates a Waze direction URL
 */
export const getWazeUrl = (): string => {
  const { lat, lng } = SHOP_COORDINATES;
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
};

/**
 * Intelligently returns the primary recommended map URL based on the user's OS:
 * Apple Maps on iOS/macOS, Google Maps on Android/Windows/Linux.
 */
export const getSmartMapsUrl = (options?: RouteOptions): { url: string; appName: 'Apple Maps' | 'Google Maps'; isApple: boolean } => {
  const isApple = isAppleDevice();
  if (isApple) {
    return {
      url: getAppleMapsUrl(options),
      appName: 'Apple Maps',
      isApple: true
    };
  }
  return {
    url: getGoogleMapsUrl(options),
    appName: 'Google Maps',
    isApple: false
  };
};

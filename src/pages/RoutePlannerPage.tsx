// pages/RoutePlannerPage.tsx
import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Car, 
  Compass, 
  ExternalLink, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  Bus,
  Train
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import CallShopModal from '../components/CallShopModal';
import { setupMapboxGl, getMapboxStyle, CARTO_DARK_MAP_STYLE } from '../lib/mapboxConfig';
import { getSmartMapsUrl } from '../lib/mapLinks';

interface RoutePlannerPageProps {
  onBackToHome: () => void;
}

interface AddressSuggestion {
  displayName: string;
  mainText: string;
  secondaryText: string;
  lat: number;
  lng: number;
}

const DESTINATION = {
  name: "Final Stop Barber Shop",
  address: "5277 El Cajon Blvd, San Diego, CA 92115",
  lat: 32.7572493,
  lng: -117.0820005,
};

const POPULAR_POINTS = [
  { label: 'Downtown / Gaslamp', lat: 32.7157, lng: -117.1611, desc: 'Downtown San Diego (92101)' },
  { label: 'SDSU Campus', lat: 32.7760, lng: -117.0713, desc: 'San Diego State University' },
  { label: 'SAN Airport', lat: 32.7338, lng: -117.1933, desc: 'San Diego Int. Airport' },
  { label: 'Pacific Beach', lat: 32.8025, lng: -117.2356, desc: 'Pacific Beach Coast' },
  { label: 'Chula Vista', lat: 32.6401, lng: -117.0842, desc: 'South Bay San Diego' },
  { label: 'La Jolla', lat: 32.8328, lng: -117.2713, desc: 'La Jolla / UTC Area' },
];

const MTS_TRANSIT_LINES = [
  {
    line: 'MTS Rapid 215',
    type: 'Rapid Bus',
    color: '#E11D48', // Red
    route: 'Downtown San Diego <-> SDSU via El Cajon Blvd',
    stop: '54th St & El Cajon Blvd (2 min walk to shop)',
    frequency: 'Every 10-15 minutes'
  },
  {
    line: 'MTS Bus Route 1',
    type: 'Local Bus',
    color: '#0284C7', // Sky Blue
    route: 'Fashion Valley Transit Center <-> La Mesa via El Cajon Blvd',
    stop: 'El Cajon Blvd & 52nd / 54th St',
    frequency: 'Every 15-20 minutes'
  },
  {
    line: 'MTS Bus Route 115',
    type: 'Local Bus',
    color: '#059669', // Emerald Green
    route: 'SDSU Transit Center <-> Grossmont Center',
    stop: 'Connect via El Cajon Blvd & College Ave',
    frequency: 'Every 30 minutes'
  },
  {
    line: 'MTS Trolley Orange & Green Lines',
    type: 'Light Rail',
    color: '#EA580C', // Orange
    route: 'Connect at SDSU Transit Center or 47th St Station',
    stop: 'Transfer to Rapid 215 straight down El Cajon Blvd',
    frequency: 'Every 15 minutes'
  }
];

export default function RoutePlannerPage({ onBackToHome }: RoutePlannerPageProps) {
  const [startAddress, setStartAddress] = useState('');
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'driving' | 'transit'>('driving');
  const [routeInfo, setRouteInfo] = useState<{
    distanceMiles: string;
    distanceKm: string;
    durationMin: number;
    steps: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Address selection flag to prevent dropdown from re-opening after selection
  const isAddressSelectedRef = useRef(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Free OpenStreetMap Autocomplete (Photon & Nominatim - 0 API Quota consumed)
  useEffect(() => {
    // If the address was just selected by the user, skip the query and keep dropdown hidden
    if (isAddressSelectedRef.current) {
      isAddressSelectedRef.current = false;
      return;
    }

    const query = startAddress.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lat=${DESTINATION.lat}&lon=${DESTINATION.lng}`;
        const res = await fetch(photonUrl);
        const data = await res.json();

        if (data.features && data.features.length > 0) {
          const list: AddressSuggestion[] = data.features.map((f: any) => {
            const p = f.properties;
            const main = [p.housenumber, p.street || p.name].filter(Boolean).join(' ') || p.name || 'Location';
            const secondary = [p.city, p.state, p.postcode].filter(Boolean).join(', ') || p.country || '';
            return {
              displayName: `${main}${secondary ? ', ' + secondary : ''}`,
              mainText: main,
              secondaryText: secondary,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            };
          });
          setSuggestions(list);
          setShowSuggestions(true);
        } else {
          // Fallback to Nominatim
          const nomQuery = query.toLowerCase().includes('san diego') ? query : `${query}, San Diego, CA`;
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nomQuery)}&limit=5&addressdetails=1`;
          const nRes = await fetch(nomUrl, { headers: { 'User-Agent': 'FinalStopBarbershop/1.0' } });
          const nData = await nRes.json();
          if (nData && nData.length > 0) {
            const list: AddressSuggestion[] = nData.map((item: any) => {
              const parts = item.display_name.split(',');
              return {
                displayName: item.display_name,
                mainText: parts[0]?.trim() || item.display_name,
                secondaryText: parts.slice(1, 4).join(',').trim(),
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              };
            });
            setSuggestions(list);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      } catch (err) {
        console.warn('Address autocomplete fetch error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [startAddress]);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainer.current) return;

    setupMapboxGl(mapboxgl);

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapboxStyle(),
      center: [DESTINATION.lng, DESTINATION.lat],
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    // Add Destination Marker (Gold)
    const destEl = document.createElement('div');
    destEl.className = 'w-9 h-9 rounded-full bg-black border-2 border-[#C5A059] flex items-center justify-center shadow-2xl cursor-pointer';
    destEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="3"></circle>
        <circle cx="6" cy="18" r="3"></circle>
        <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
        <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
        <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
      </svg>
    `;

    const destPopup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
      <div style="background:#151517;color:#fff;padding:8px 12px;font-family:sans-serif;font-size:12px;border:1px solid #C5A059;">
        <strong style="color:#C5A059;font-size:13px;display:block;margin-bottom:3px;">Final Stop Barber Shop</strong>
        <p style="margin:0;color:#aaa;font-size:11px;">5277 El Cajon Blvd, San Diego, CA</p>
        <span style="color:#4ade80;font-size:10px;display:block;margin-top:4px;">● Mon - Sat 10AM - 6PM</span>
      </div>
    `);

    destMarkerRef.current = new mapboxgl.Marker(destEl)
      .setLngLat([DESTINATION.lng, DESTINATION.lat])
      .setPopup(destPopup)
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Calculate route with OSRM
  const calculateRoute = async (origin: { lat: number; lng: number }, originLabel: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setStartCoords(origin);

    const map = mapRef.current;
    if (!map) return;

    try {
      // Add or move Start Marker (Cyan)
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
      }

      const startEl = document.createElement('div');
      startEl.className = 'w-8 h-8 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-lg';
      startEl.innerHTML = `<span style="color:#000;font-weight:bold;font-size:11px;">A</span>`;

      startMarkerRef.current = new mapboxgl.Marker(startEl)
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<div style="color:#000;padding:4px;font-size:11px;font-weight:bold;">Start: ${originLabel}</div>`))
        .addTo(map);

      // Call OSRM Driving routing API
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${DESTINATION.lng},${DESTINATION.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Unable to compute route');
      }

      const route = data.routes[0];
      const distanceMeters = route.distance;
      const durationSeconds = route.duration;

      const miles = (distanceMeters * 0.000621371).toFixed(1);
      const km = (distanceMeters / 1000).toFixed(1);
      const minutes = Math.round(durationSeconds / 60);

      const steps: string[] = [];
      if (route.legs && route.legs[0]?.steps) {
        const legSteps = route.legs[0].steps;
        legSteps.slice(0, 4).forEach((step: any) => {
          if (step.name && step.name.trim() !== '') {
            steps.push(`Take ${step.name}`);
          }
        });
      }
      if (steps.length === 0) {
        steps.push('Follow direct route along main boulevard');
      }

      setRouteInfo({
        distanceMiles: miles,
        distanceKm: km,
        durationMin: minutes,
        steps: steps.slice(0, 3)
      });

      // Draw route on map
      const geojson: any = {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      };

      if (map.getSource('route')) {
        (map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource('route', {
          type: 'geojson',
          data: geojson
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#C5A059',
            'line-width': 5,
            'line-opacity': 0.95
          }
        });
      }

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([DESTINATION.lng, DESTINATION.lat]);

      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 14,
        duration: 1000
      });

    } catch (err) {
      console.error(err);
      setErrorMessage("Could not compute the road route. Please verify your starting address.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GPS location
  const handleUseCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        isAddressSelectedRef.current = true;
        setStartAddress('My Current GPS Location');
        setSuggestions([]);
        setShowSuggestions(false);
        calculateRoute(userCoords, 'Current Location');
      },
      (err) => {
        setIsLoading(false);
        alert("Unable to retrieve your location. Please enter your address manually.");
      },
      { timeout: 10000 }
    );
  };

  // Handle Text Address Search via Nominatim or top suggestion
  const handleSearchAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!startAddress.trim()) return;

    setShowSuggestions(false);

    if (suggestions.length > 0) {
      const top = suggestions[0];
      isAddressSelectedRef.current = true;
      setStartAddress(top.displayName);
      setSuggestions([]);
      calculateRoute({ lat: top.lat, lng: top.lng }, top.mainText);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const query = startAddress.toLowerCase().includes('san diego') 
        ? startAddress 
        : `${startAddress}, San Diego, CA`;

      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(geocodeUrl);
      const data = await res.json();

      if (!data || data.length === 0) {
        throw new Error("Address not found");
      }

      const result = data[0];
      const coords = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };

      calculateRoute(coords, result.display_name.split(',')[0]);
    } catch (err) {
      setErrorMessage("Address not found. Please try entering a zip code or select one of the suggested landmarks below.");
      setIsLoading(false);
    }
  };

  // Smart Navigation URLs
  const smartMap = getSmartMapsUrl(startCoords ? { originLat: startCoords.lat, originLng: startCoords.lng } : undefined);

  const googleMapsDirectionsUrl = startCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${startCoords.lat},${startCoords.lng}&destination=${DESTINATION.lat},${DESTINATION.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESTINATION.address)}`;

  const appleMapsDirectionsUrl = startCoords
    ? `https://maps.apple.com/?saddr=${startCoords.lat},${startCoords.lng}&daddr=${DESTINATION.lat},${DESTINATION.lng}`
    : `https://maps.apple.com/?daddr=${encodeURIComponent(DESTINATION.address)}`;

  const transitDirectionsUrl = startCoords
    ? (smartMap.isApple
        ? `https://maps.apple.com/?saddr=${startCoords.lat},${startCoords.lng}&daddr=${DESTINATION.lat},${DESTINATION.lng}&dirflg=r`
        : `https://www.google.com/maps/dir/?api=1&origin=${startCoords.lat},${startCoords.lng}&destination=${DESTINATION.lat},${DESTINATION.lng}&travelmode=transit`)
    : (smartMap.isApple
        ? `https://maps.apple.com/?daddr=${encodeURIComponent(DESTINATION.address)}&dirflg=r`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESTINATION.address)}&travelmode=transit`);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col w-full overflow-x-hidden">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">
              5277 El Cajon Blvd, San Diego
            </span>
            <button
              type="button"
              onClick={() => setIsCallModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#151517] border border-gold/40 text-gold hover:bg-gold hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Shop</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        
        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold"></span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
              GPS Navigation & Transit Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
            Get Directions to the Shop
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Enter your starting address or use your device GPS to plan your drive or public transit route to <strong>Final Stop Barber Shop</strong>.
          </p>
        </div>

        {/* Transport Mode Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('driving')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'driving'
                ? 'bg-gold text-black shadow'
                : 'bg-[#151517] text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driving Route</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transit')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'transit'
                ? 'bg-gold text-black shadow'
                : 'bg-[#151517] text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus & Transit (MTS Lines)</span>
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-6">
            
            {activeTab === 'driving' ? (
              /* Search Input Card */
              <div className="bg-[#151517] border border-white/10 p-6 shadow-xl">
                
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <Navigation className="w-4 h-4 text-gold" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                    Your Starting Location
                  </h2>
                </div>

                <form onSubmit={handleSearchAddress} className="space-y-4">
                  <div className="relative">
                    <div className="mb-1.5">
                      <label className="text-[11px] uppercase font-mono text-gray-400 block">
                        Address, Street, or Zip Code
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={startAddress}
                        onChange={(e) => {
                          setStartAddress(e.target.value);
                          isAddressSelectedRef.current = false;
                        }}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        placeholder="e.g. 5th Ave, Downtown San Diego, 92101..."
                        className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors pr-10 font-mono"
                      />
                      {isSearchingSuggestions && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                      {!isSearchingSuggestions && startAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setStartAddress('');
                            setSuggestions([]);
                            setShowSuggestions(false);
                            isAddressSelectedRef.current = false;
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
                          title="Clear"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#121214] border border-gold/40 shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-white/5">
                        <div className="px-3 py-1.5 bg-black/70 text-[10px] font-mono uppercase tracking-wider text-gold flex items-center justify-between border-b border-white/5">
                          <span>Select Matching Address:</span>
                          <span className="text-[9px] text-gray-400">OpenStreetMap</span>
                        </div>
                        {suggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              // Immediately set flag to prevent re-opening and clear suggestions
                              isAddressSelectedRef.current = true;
                              setStartAddress(item.displayName);
                              setSuggestions([]);
                              setShowSuggestions(false);
                              calculateRoute({ lat: item.lat, lng: item.lng }, item.mainText);
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-gold/15 transition-colors flex items-start gap-2.5 group cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white group-hover:text-gold font-mono truncate">
                                {item.mainText}
                              </div>
                              {item.secondaryText && (
                                <div className="text-[11px] text-gray-400 truncate">
                                  {item.secondaryText}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="submit"
                      disabled={isLoading || !startAddress.trim()}
                      className="flex-1 bg-gold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                      <span>Calculate Route</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseCurrentPosition}
                      disabled={isLoading}
                      className="bg-[#1E1E22] hover:bg-white/10 text-gray-200 border border-white/15 text-xs font-medium py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      title="Use my GPS location"
                    >
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span className="whitespace-nowrap">GPS</span>
                    </button>
                  </div>
                </form>

                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Quick Suggestion Chips */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <span className="text-[10px] uppercase font-mono text-gray-500 font-bold block mb-2">
                    Popular Starting Points:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_POINTS.map((pt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          isAddressSelectedRef.current = true;
                          setStartAddress(pt.label);
                          setSuggestions([]);
                          setShowSuggestions(false);
                          calculateRoute({ lat: pt.lat, lng: pt.lng }, pt.label);
                        }}
                        className="text-[11px] bg-[#0A0A0B] hover:bg-gold hover:text-black border border-white/10 text-gray-300 px-2.5 py-1.5 transition-all cursor-pointer"
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* Public Transit (MTS) Guide Card */
              <div className="bg-[#151517] border border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Bus className="w-4 h-4 text-gold" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                    San Diego MTS Bus & Trolley Lines
                  </h2>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Final Stop Barber Shop is located directly along the main El Cajon Boulevard transit corridor, easily reachable via MTS lines:
                </p>

                <div className="space-y-3">
                  {MTS_TRANSIT_LINES.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-[#0A0A0B] border border-white/10 rounded space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="text-xs font-mono font-bold text-white">
                            {item.line}
                          </span>
                        </div>
                        <span 
                          className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                          style={{ 
                            color: item.color, 
                            backgroundColor: `${item.color}20`,
                            border: `1px solid ${item.color}50`
                          }}
                        >
                          {item.type}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-300">
                        {item.route}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1 border-t border-white/5">
                        <span>Stop: {item.stop}</span>
                        <span className="text-gold">{item.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href={transitDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1E1E22] hover:bg-gold hover:text-black border border-gold/40 text-gray-200 text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer no-underline"
                >
                  <Train className="w-4 h-4" />
                  <span>Open Transit Routes in {smartMap.appName}</span>
                </a>
              </div>
            )}

            {/* Trajectory Details Result */}
            {routeInfo ? (
              <div className="bg-[#151517] border border-gold/40 p-6 shadow-2xl animate-fadeIn">
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <span className="text-gold font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Route Calculated
                  </span>
                  <span className="text-gray-400 text-xs font-mono">By Car</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 bg-[#0A0A0B] border border-white/5 p-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Estimated Drive</span>
                    <p className="text-2xl font-serif font-bold text-gold mt-0.5">
                      ~ {routeInfo.durationMin} min
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Distance</span>
                    <p className="text-2xl font-serif font-bold text-white mt-0.5">
                      {routeInfo.distanceMiles} mi <span className="text-xs text-gray-400 font-sans font-normal">({routeInfo.distanceKm} km)</span>
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div className="mb-6">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block mb-2 font-bold">
                    Key Highway / Road Segments:
                  </span>
                  <ul className="space-y-1.5 text-xs text-gray-300 font-mono">
                    {routeInfo.steps.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-gold font-bold">&bull;</span>
                        <span>{step}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-gold font-bold">
                      <span>🏁</span>
                      <span>Arrive: Final Stop Barber Shop (5277 El Cajon Blvd)</span>
                    </li>
                  </ul>
                </div>

                {/* Smart OS-Aware Navigation Action Buttons */}
                <div className="space-y-2">
                  <a
                    href={smartMap.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer no-underline shadow"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in {smartMap.appName} Navigation</span>
                  </a>

                  <div className="flex gap-2">
                    <a
                      href={googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#1E1E22] hover:bg-white/10 border border-white/15 text-gray-300 text-[11px] font-mono py-2 px-3 flex items-center justify-center gap-1.5 transition-colors no-underline text-center"
                    >
                      <span>Google Maps</span>
                    </a>
                    <a
                      href={appleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#1E1E22] hover:bg-white/10 border border-white/15 text-gray-300 text-[11px] font-mono py-2 px-3 flex items-center justify-center gap-1.5 transition-colors no-underline text-center"
                    >
                      <span>Apple Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Destination Info Card */
              <div className="bg-[#151517] border border-white/10 p-6">
                <span className="text-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
                  Destination
                </span>
                <h3 className="text-lg font-serif font-bold text-white mb-2">
                  {DESTINATION.name}
                </h3>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{DESTINATION.address}</span>
                </p>

                <div className="p-3 bg-[#0A0A0B] border border-white/5 space-y-1 text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>Open Monday - Saturday &bull; 10:00 AM - 6:00 PM</span>
                  </div>
                  <p className="text-[11px] text-gray-500 pt-1 border-t border-white/5">
                    Free parking available along El Cajon Boulevard and in the dedicated rear parking lot.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                  <a
                    href={smartMap.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#1A1A20] hover:bg-[#222228] border border-gold/40 text-gold text-xs font-mono font-bold py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <span>Open {smartMap.appName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Map Column (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-[#151517] border border-white/15 p-2 shadow-2xl">
              
              <div className="h-[540px] w-full relative bg-[#0A0A0B] overflow-hidden">
                <div ref={mapContainer} className="w-full h-full" />
              </div>

              <div className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#38bdf8] inline-block border border-white"></span>
                    <span>Start</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#C5A059] inline-block border border-white"></span>
                    <span>Final Stop</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-1 bg-[#C5A059] inline-block"></span>
                    <span>Route</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Map powered by Mapbox</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Direct Call Modal */}
      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />

    </div>
  );
}

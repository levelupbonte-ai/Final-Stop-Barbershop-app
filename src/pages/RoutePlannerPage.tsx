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
  X
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import CallShopModal from '../components/CallShopModal';
import { setupMapboxGl, getMapboxStyle, CARTO_DARK_MAP_STYLE } from '../lib/mapboxConfig';

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

export default function RoutePlannerPage({ onBackToHome }: RoutePlannerPageProps) {
  const [startAddress, setStartAddress] = useState('');
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distanceMiles: string;
    distanceKm: string;
    durationMin: number;
    steps: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Free OpenStreetMap Autocomplete (Photon & Nominatim - 0 API Quota consumed)
  useEffect(() => {
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
      pitch: 30,
    });

    // Gracefully handle token or style load errors
    map.on('error', (e: any) => {
      const msg = String(e?.error?.message || '').toLowerCase();
      if (e?.error?.status === 401 || msg.includes('access token') || msg.includes('not authorized')) {
        console.warn('Mapbox style unauthorized, falling back cleanly to dark basemap.');
        try {
          map.setStyle(CARTO_DARK_MAP_STYLE);
        } catch (_) {}
      }
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    // Add Destination Marker (Gold)
    const destEl = document.createElement('div');
    destEl.className = 'w-9 h-9 rounded-full bg-black border-2 border-[#C5A059] flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.8)] cursor-pointer';
    destEl.innerHTML = `<span style="color:#C5A059;font-weight:900;font-size:12px;font-family:monospace;">FS</span>`;

    const destPopup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
      <div style="background:#151517;color:#fff;padding:10px;font-family:sans-serif;font-size:12px;border:1px solid #C5A059;">
        <strong style="color:#C5A059;font-size:13px;display:block;margin-bottom:4px;">${DESTINATION.name}</strong>
        <span>5277 El Cajon Blvd</span><br/>
        <span style="color:#888;font-size:10px;">San Diego, CA 92115</span>
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
        setStartAddress('My Current GPS Location');
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
      setStartAddress(top.displayName);
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

  const googleMapsDirectionsUrl = startCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${startCoords.lat},${startCoords.lng}&destination=${DESTINATION.lat},${DESTINATION.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESTINATION.address)}`;

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

          <div className="flex items-center cursor-pointer" onClick={onBackToHome}>
            <img 
              src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
              alt="Final Stop Barber Shop" 
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Direct Phone Assistance (Opens 2 lines modal) */}
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="text-xs font-mono text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            title="Call Shop (2 Numbers Available)"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">+1 (619) 886-1267</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 w-full max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-2">
            Location & Directions &bull; San Diego
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
            Directions & Route to the Shop
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Enter your starting address or use GPS location to preview your real-time drive to <strong>Final Stop Barber Shop</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Form Box */}
            <div className="bg-[#151517] border border-white/10 p-6 shadow-2xl">
              
              <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-5">
                <Navigation className="w-4 h-4 text-gold" />
                <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-white">
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
                      onChange={(e) => setStartAddress(e.target.value)}
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
                            setStartAddress(item.displayName);
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
                        setStartAddress(pt.label);
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

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1E1E22] hover:bg-gold hover:text-black border border-gold/40 text-gray-200 text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Maps GPS</span>
                </a>
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
                    Parking available along El Cajon Boulevard and in the rear lot.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Map Column (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-[#151517] border border-white/15 p-2 shadow-2xl">
              
              <div className="h-[520px] w-full relative bg-[#0A0A0B] overflow-hidden">
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

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Live Turn-by-Turn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 bg-[#0A0A0B] text-center text-xs text-gray-500 w-full mt-10">
        <p>&copy; {new Date().getFullYear()} Final Stop Barber Shop &bull; 5277 El Cajon Blvd, San Diego, CA 92115</p>
      </footer>

      {/* Direct Phone Assistance Modal with 2 Lines */}
      <CallShopModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

    </div>
  );
}

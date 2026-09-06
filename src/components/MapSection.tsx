import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, ExternalLink, Compass, Loader2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Feature, Geometry } from 'geojson';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const SHOP_LOCATION = { lat: 32.7572493, lng: -117.0820005 }; // 5277 El Cajon Blvd, San Diego, CA
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9";
const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=5277+El+Cajon+Blvd,+San+Diego,+CA+92115";

function MapboxView({ token }: { token: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [originQuery, setOriginQuery] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ duration: string; distance: string } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [SHOP_LOCATION.lng, SHOP_LOCATION.lat],
      zoom: 14.5,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    // Custom Gold Marker for Final Stop Barber Shop
    const el = document.createElement('div');
    el.className = 'w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg border-2 border-black cursor-pointer';
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>`;

    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
      <div style="color: #111; padding: 6px 8px; font-family: sans-serif;">
        <strong style="font-size: 12px; display: block; text-transform: uppercase;">Final Stop Barber Shop</strong>
        <span style="font-size: 11px; color: #555;">5277 El Cajon Blvd, San Diego</span>
      </div>
    `);

    new mapboxgl.Marker(el)
      .setLngLat([SHOP_LOCATION.lng, SHOP_LOCATION.lat])
      .setPopup(popup)
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [token]);

  const calculateRoute = async () => {
    if (!originQuery.trim() || !mapRef.current || !token) return;

    setLoadingRoute(true);
    setRouteError(null);

    try {
      // 1. Geocode the address
      const geocodeRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(originQuery)}.json?access_token=${token}&limit=1`
      );
      const geocodeData = await geocodeRes.json();

      if (!geocodeData.features || geocodeData.features.length === 0) {
        setRouteError('Adresse introuvable. Veuillez préciser votre ville.');
        setLoadingRoute(false);
        return;
      }

      const [startLng, startLat] = geocodeData.features[0].center;

      // 2. Query Mapbox Directions
      const directionsRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${SHOP_LOCATION.lng},${SHOP_LOCATION.lat}?geometries=geojson&overview=full&access_token=${token}`
      );
      const directionsData = await directionsRes.json();

      if (!directionsData.routes || directionsData.routes.length === 0) {
        setRouteError('Aucun itinéraire routier trouvé.');
        setLoadingRoute(false);
        return;
      }

      const route = directionsData.routes[0];
      const durationMin = Math.round(route.duration / 60);
      const distanceKm = (route.distance / 1000).toFixed(1);
      const distanceMiles = (route.distance * 0.000621371).toFixed(1);

      setRouteInfo({
        duration: durationMin >= 60 
          ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}min`
          : `${durationMin} min`,
        distance: `${distanceMiles} miles (${distanceKm} km)`
      });

      const map = mapRef.current;

      // Draw route on map
      const geojson: Feature<Geometry> = {
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
            'line-width': 4,
            'line-opacity': 0.9
          }
        });
      }

      // Update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userEl = document.createElement('div');
      userEl.className = 'w-4 h-4 rounded-full bg-white border-2 border-black shadow-md';
      userMarkerRef.current = new mapboxgl.Marker(userEl)
        .setLngLat([startLng, startLat])
        .addTo(map);

      // Fit map bounds
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([startLng, startLat]);
      bounds.extend([SHOP_LOCATION.lng, SHOP_LOCATION.lat]);
      map.fitBounds(bounds, { padding: 60, maxZoom: 15 });

    } catch (err) {
      console.error('Mapbox error:', err);
      setRouteError('Erreur lors du calcul du trajet Mapbox.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setRouteError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setLoadingRoute(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setOriginQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        try {
          const directionsRes = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${SHOP_LOCATION.lng},${SHOP_LOCATION.lat}?geometries=geojson&overview=full&access_token=${token}`
          );
          const directionsData = await directionsRes.json();

          if (directionsData.routes && directionsData.routes.length > 0) {
            const route = directionsData.routes[0];
            const durationMin = Math.round(route.duration / 60);
            const distanceMiles = (route.distance * 0.000621371).toFixed(1);
            const distanceKm = (route.distance / 1000).toFixed(1);

            setRouteInfo({
              duration: `${durationMin} min`,
              distance: `${distanceMiles} miles (${distanceKm} km)`
            });

            const map = mapRef.current;
            if (map) {
              const geojson: Feature<Geometry> = {
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
                  paint: {
                    'line-color': '#C5A059',
                    'line-width': 4
                  }
                });
              }

              if (userMarkerRef.current) userMarkerRef.current.remove();
              const userEl = document.createElement('div');
              userEl.className = 'w-4 h-4 rounded-full bg-white border-2 border-black shadow-md';
              userMarkerRef.current = new mapboxgl.Marker(userEl)
                .setLngLat([longitude, latitude])
                .addTo(map);

              const bounds = new mapboxgl.LngLatBounds();
              bounds.extend([longitude, latitude]);
              bounds.extend([SHOP_LOCATION.lng, SHOP_LOCATION.lat]);
              map.fitBounds(bounds, { padding: 60 });
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingRoute(false);
        }
      },
      (error) => {
        setLoadingRoute(false);
        setRouteError('Position inaccessible: ' + error.message);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Route Calculator Panel */}
      <div className="bg-[#151517] p-6 border border-white/10 shadow-2xl">
        <h3 className="text-xs uppercase tracking-widest font-black text-white mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-gold" />
            Itinéraire & Navigation Mapbox en Direct
          </span>
          <span className="text-[10px] text-gold/80 font-mono font-normal">Vector Map &bull; Live Routing</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ex: San Diego Downtown, Pacific Beach, El Cajon..."
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && calculateRoute()}
              className="w-full bg-[#0A0A0B] border border-white/15 px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <button
            onClick={calculateRoute}
            disabled={loadingRoute}
            className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingRoute ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            <span>Calculer</span>
          </button>
          <button
            onClick={handleUseGeolocation}
            disabled={loadingRoute}
            title="Utiliser ma position actuelle"
            className="bg-[#0A0A0B] hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white text-xs px-4 py-3 transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-gold" />
            <span className="hidden sm:inline">Ma position</span>
          </button>
        </div>

        {routeError && (
          <p className="mt-3 text-xs text-red-400 font-mono">{routeError}</p>
        )}

        {routeInfo && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Temps estimé</span>
                <span className="text-sm font-mono font-bold text-gold">{routeInfo.duration}</span>
              </div>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Distance</span>
                <span className="text-sm font-mono font-bold text-white">{routeInfo.distance}</span>
              </div>
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-wider text-gold hover:text-white font-mono flex items-center gap-1.5 transition-colors"
            >
              <span>Lancer dans Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Mapbox Vector Map Canvas */}
      <div className="relative border border-white/15 overflow-hidden shadow-2xl h-[460px]">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}

export default function MapSection() {
  return (
    <section id="contact" className="py-24 bg-dark-bg relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="text-center mb-12">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Localisation & Accès
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">Nous Trouver</h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Situé au cœur de San Diego, notre salon vous accueille dans un cadre raffiné pensé pour votre détente et votre confort.
          </p>
        </div>

        {/* Salon Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#151517] p-6 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-gold" />
            </div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Notre Adresse</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              5277 El Cajon Blvd<br />San Diego, CA 92115
            </p>
          </div>

          <div className="bg-[#151517] p-6 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-gold" />
            </div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Téléphone</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              <a href="tel:+16198861267" className="hover:text-gold transition-colors">
                +1 (619) 886-1267
              </a>
            </p>
          </div>

          <div className="bg-[#151517] p-6 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-4">
              <Navigation className="w-5 h-5 text-gold" />
            </div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Accès Direct</h4>
            <div className="flex flex-col gap-2 w-full mt-1">
              <a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[11px] text-gold hover:text-white uppercase tracking-wider font-bold transition-colors"
              >
                <span>Fiche Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Mapbox Mode OR Google Maps Interactive Live View */}
        {MAPBOX_TOKEN ? (
          <MapboxView token={MAPBOX_TOKEN} />
        ) : (
          <div className="space-y-4">
            {/* Live Interactive Google Maps Frame */}
            <div className="relative border border-white/10 overflow-hidden bg-[#151517] shadow-2xl">
              <div className="h-[420px] w-full">
                <iframe
                  title="Final Stop Barber Shop - Google Maps"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=Finalstopbarbershop+5277+El+Cajon+Blvd+San+Diego+CA&t=&z=15&ie=UTF8&iwloc=&output=embed"
                ></iframe>
              </div>

              {/* Quick Action Floating Bar */}
              <div className="p-4 bg-[#151517] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs text-gray-300 font-serif">Final Stop Barber Shop &bull; 5277 El Cajon Blvd</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gold hover:bg-gold-light text-black px-4 py-2 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Calculer l'itinéraire GPS</span>
                  </a>
                  <a
                    href={GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0A0A0B] hover:bg-white/10 text-white border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <span>Fiche Google</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gold" />
                  </a>
                </div>
              </div>
            </div>

            {/* Note on Mapbox Token */}
            <div className="bg-[#121214] border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-gold font-mono font-bold uppercase text-[10px] tracking-wider bg-gold/10 px-2 py-0.5 border border-gold/20">
                  Option Mapbox
                </span>
                <span className="text-[11px]">
                  Vous avez une clé Mapbox ? Donnez-la moi dans le chat ou ajoutez <code>VITE_MAPBOX_TOKEN</code> pour activer la carte vectorielle personnalisée avec calcul des trajets en direct.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

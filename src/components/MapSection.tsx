import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, ExternalLink, Clock } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { setupMapboxGl, getMapboxStyle, CARTO_DARK_MAP_STYLE } from '../lib/mapboxConfig';
import { getSmartMapsUrl, getAppleMapsUrl, getGoogleMapsUrl } from '../lib/mapLinks';

const SHOP_LOCATION = {
  lat: 32.7572493,
  lng: -117.0820005,
  name: "Final Stop Barber Shop",
  address: "5277 El Cajon Blvd, San Diego, CA 92115",
  phone: "+1 (619) 886-1267"
};

interface MapSectionProps {
  onNavigateToRoutePlanner?: () => void;
}

export default function MapSection({ onNavigateToRoutePlanner }: MapSectionProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [smartMap, setSmartMap] = useState({ url: getGoogleMapsUrl(), appName: 'Google Maps' as 'Apple Maps' | 'Google Maps', isApple: false });

  useEffect(() => {
    setSmartMap(getSmartMapsUrl());
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    // Safely configure access token and requirements
    setupMapboxGl(mapboxgl);

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapboxStyle(),
      center: [SHOP_LOCATION.lng, SHOP_LOCATION.lat],
      zoom: 15.2,
      attributionControl: true
    });

    // Gracefully handle any token unauthorized / style load issues
    map.on('error', (e: any) => {
      const msg = String(e?.error?.message || '').toLowerCase();
      if (e?.error?.status === 401 || msg.includes('access token') || msg.includes('not authorized')) {
        console.warn('Mapbox style unauthorized, falling back cleanly to dark basemap.');
        try {
          map.setStyle(CARTO_DARK_MAP_STYLE);
        } catch (_) {}
      }
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    // Custom Gold Barber Destination Marker
    const markerEl = document.createElement('div');
    markerEl.className = 'custom-gold-marker';
    markerEl.innerHTML = `
      <div style="background: #C5A059; border: 2.5px solid #000; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(197,160,89,0.85); cursor: pointer;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"></circle>
          <path d="M8.12 8.12 12 12"></path>
          <path d="M20 4 8.12 15.88"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <path d="M14.8 14.8 20 20"></path>
        </svg>
      </div>
    `;

    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
      .setHTML(`
        <div style="color: #000; font-family: sans-serif; padding: 6px 10px; text-align: center;">
          <strong style="font-size: 13px; text-transform: uppercase; color: #000; display: block; margin-bottom: 2px;">
            FINAL STOP BARBER SHOP
          </strong>
          <span style="font-size: 11px; color: #666; display: block;">
            5277 El Cajon Blvd, San Diego
          </span>
          <div style="margin-top: 6px;">
            <span style="display: inline-block; background: #C5A059; color: #000; font-size: 10px; font-weight: bold; padding: 2px 6px; text-transform: uppercase;">
              Open 10:00 AM - 6:00 PM
            </span>
          </div>
        </div>
      `);

    new mapboxgl.Marker({ element: markerEl })
      .setLngLat([SHOP_LOCATION.lng, SHOP_LOCATION.lat])
      .setPopup(popup)
      .addTo(map);

    mapRef.current = map;

    map.on('load', () => {
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section id="contact" className="py-24 bg-dark-bg relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-14">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Location & Access
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Visit Us in San Diego
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Conveniently situated on <strong className="text-white">El Cajon Boulevard</strong> in the College Area, our shop offers easy parking, central transit access, and a premium climate-controlled lounge.
          </p>
        </div>

        {/* Salon Contact Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#151517] p-6 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-4 text-gold">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Our Address</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              5277 El Cajon Blvd<br />San Diego, CA 92115
            </p>
          </div>

          <div className="bg-[#151517] p-6 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-4 text-gold">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Phone Lines (2 Direct)</h4>
            <div className="text-xs text-gray-300 font-mono space-y-1">
              <div>
                <a href="tel:16198861267" className="text-gold hover:underline font-bold block">+1 (619) 886-1267</a>
              </div>
              <div>
                <a href="tel:16199287084" className="text-gold hover:underline font-bold block">+1 (619) 928-7084</a>
              </div>
            </div>
            <span className="text-[11px] text-gray-500 mt-1">Direct Call / Text</span>
          </div>

          <div className="bg-[#151517] p-6 border border-white/5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-4 text-gold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Business Hours</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Monday - Saturday: 10:00 AM - 6:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>

        {/* Mapbox View & Direct Navigation */}
        <div className="relative border border-white/15 overflow-hidden bg-[#0A0A0B] shadow-2xl">
          {/* Action Bar Above Map */}
          <div className="bg-[#151517] p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-mono text-gray-300 font-bold">
                5277 El Cajon Blvd, San Diego, CA
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onNavigateToRoutePlanner}
                className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-2.5 px-5 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-black" />
                <span>View Map & Directions</span>
              </button>

              <a
                href={smartMap.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-gray-300 hover:text-gold transition-colors py-2 px-3 border border-white/15 bg-black/40"
                title={`Open in ${smartMap.appName}`}
              >
                <span>{smartMap.appName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gold" />
              </a>
            </div>
          </div>

          <div className="h-[460px] w-full relative">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>

      </div>
    </section>
  );
}

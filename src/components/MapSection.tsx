import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;
const SHOP_LOCATION = { lat: 32.7572493, lng: -117.0820005 };
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9";
const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=5277+El+Cajon+Blvd,+San+Diego,+CA+92115";

function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const placesLibrary = useMapsLibrary('places');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
  const [origin, setOrigin] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;
    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ['place_id', 'geometry', 'formatted_address']
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setOrigin(place.formatted_address);
      }
    });
  }, [placesLibrary]);

  const calculateRoute = () => {
    if (!directionsService || !directionsRenderer || !origin) return;

    directionsService.route(
      {
        origin: origin,
        destination: SHOP_LOCATION,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          directionsRenderer.setDirections(response);
          const leg = response.routes[0].legs[0];
          setDuration(leg.duration?.text || '');
          setDistance(leg.distance?.text || '');
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  return (
    <div className="bg-[#151517] p-6 border border-white/5 mt-8 shadow-xl max-w-2xl mx-auto z-10 relative">
      <h3 className="text-[12px] uppercase tracking-widest font-black text-white mb-4 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-gold" />
        Calculez votre itinéraire
      </h3>
      <div className="flex flex-col gap-4 mb-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Entrez votre adresse..."
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-[#0A0A0B] border border-white/10 px-4 py-3 text-[12px] text-white focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <button
          onClick={calculateRoute}
          className="w-full bg-gold hover:bg-gold-light text-black text-[11px] font-bold uppercase tracking-widest py-3 transition-colors"
        >
          Voir le trajet
        </button>
      </div>

      {duration && (
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-white/10 gap-2">
          <span className="text-[10px] font-bold uppercase text-gray-400">Temps de route estimé:</span>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-mono font-bold text-gold">{duration}</span>
            <span className="text-white/20">|</span>
            <span className="text-[12px] font-mono font-bold text-white">{distance}</span>
          </div>
        </div>
      )}
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
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Retrouvez votre barbershop d'exception à San Diego. Venez profiter d'un cadre soigné et d'un service sur-mesure.
          </p>
        </div>

        {/* Salon Contact Cards */}
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
                <span>Voir sur Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
        
        {MAPS_API_KEY && (
          <APIProvider apiKey={MAPS_API_KEY}>
            <Directions />
          </APIProvider>
        )}

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

      </div>
    </section>
  );
}

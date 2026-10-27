import { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useSiteData } from '../../lib/site/SiteDataProvider';

interface RoutePlannerPageProps {
  onBackToHome: () => void;
}

const QUICK_ORIGINS = [
  { label: 'Shop Pin (University Ave)', query: '' },
  { label: 'From Downtown SD', query: 'Downtown San Diego, CA' },
  { label: 'From SDSU Campus', query: 'San Diego State University, CA' },
  { label: 'From SAN Airport', query: 'San Diego International Airport, CA' },
  { label: 'From La Jolla', query: 'La Jolla, San Diego, CA' },
];

export default function RoutePlannerPage(_props: RoutePlannerPageProps) {
  const { site } = useSiteData();
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');

  const address = site.contact.address || '4748 University Ave, San Diego, CA 92105';
  const mapsDirectUrl =
    site.contact.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${address}`)}`;

  const googleMapsDirectionsUrl = selectedOrigin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(selectedOrigin)}&destination=${encodeURIComponent(address)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const embedUrl = selectedOrigin
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(selectedOrigin)}&daddr=${encodeURIComponent(address)}&t=m&z=13&ie=UTF8&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(`${site.name}, ${address}`)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 w-full max-w-6xl mx-auto relative">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <span className="text-gold text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-mono font-semibold block mb-3">
          Location &amp; Sanctuary &middot; San Diego
        </span>
        <h1
          className="font-sans font-black uppercase tracking-tight text-white leading-[0.98] mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
        >
          FIND US ON{' '}
          <span className="font-serif italic font-normal text-gold-gradient capitalize">
            University Ave
          </span>
        </h1>
        <div className="divider-gold-fade max-w-xs mx-auto mb-4" />
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          {address} &middot; Easy street parking &amp; central San Diego access
        </p>
      </div>

      {/* Sculpted Google Maps Pavilion */}
      <div className="card-luxury rounded-[2.75rem]! p-3 sm:p-5 md:p-6 border border-white/[0.1] shadow-[0_35px_100px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Top Route Filter Strip inside the Curved Pavilion */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-3 sm:px-4 pt-2 pb-5">
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            <span className="font-semibold text-white">{site.name}</span>
            <span className="text-white/25">&middot;</span>
            <span className="text-gray-400 hidden sm:inline">{address}</span>
          </div>

          {/* Quick Route View Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {QUICK_ORIGINS.map((item) => {
              const isActive = selectedOrigin === item.query;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedOrigin(item.query)}
                  className={`text-[11px] px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                    isActive
                      ? 'bg-gold text-black font-bold shadow-[0_4px_18px_rgba(197,160,89,0.35)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] text-gray-300 border border-white/[0.07]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Google Maps Frame */}
        <div className="relative w-full h-[460px] sm:h-[540px] rounded-[2.25rem] overflow-hidden border border-white/[0.1] bg-[#111015] shadow-inner">
          <iframe
            key={embedUrl}
            title="Final Stop Barber Shop & Salon Google Map"
            src={embedUrl}
            className="w-full h-full border-0"
            style={{ filter: 'contrast(1.03) saturate(0.95)' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          {/* Floating Curved Concierge Bar Over the Bottom of the Map */}
          <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 pointer-events-none flex justify-center">
            <div className="pointer-events-auto w-full max-w-4xl rounded-[2rem] bg-[#0B0A0E]/92 backdrop-blur-xl border border-white/[0.14] px-5 py-4 sm:px-7 sm:py-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <span>San Diego Flagship Lounge</span>
                </div>
                <a
                  href={mapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base font-bold text-white hover:text-gold transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <span>{address}</span>
                </a>
                <p className="text-xs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold/80" />
                    <span>Open Mon – Sat &middot; 10:00 AM – 6:00 PM</span>
                  </span>
                  <span className="text-white/20">&middot;</span>
                  <span>Street parking available along University Ave</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial btn-gold rounded-full! py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(197,160,89,0.35)]"
                >
                  <Navigation className="w-3.5 h-3.5 text-black" />
                  <span>Open Google Maps GPS</span>
                </a>

                <a
                  href={mapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-medium text-gray-200 hover:text-gold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Place Card</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

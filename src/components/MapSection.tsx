import { MapPin, Navigation, Phone, ExternalLink, Clock } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface MapSectionProps {
  onNavigateToRoutePlanner?: () => void;
}

export default function MapSection({ onNavigateToRoutePlanner }: MapSectionProps) {
  const { site } = useSiteData();
  const { contact, hours } = site;
  const GOOGLE_MAPS_LINK = contact.mapsUrl || undefined;
  const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contact.address)}`;
  const EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(`${site.name}, ${contact.address}`)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contact" className="py-24 bg-dark-bg relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Location &amp; Access
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Visit Us in San Diego
          </h2>
          <div className="divider-gold-fade max-w-xs mx-auto mb-6" />
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Conveniently situated on <strong className="text-white">University Avenue</strong> in San Diego, our shop offers easy parking, central transit access, and a premium climate-controlled lounge.
          </p>
        </div>

        {/* Sculpted Google Maps Pavilion */}
        <div className="card-luxury rounded-[2.75rem]! p-3 sm:p-5 border border-white/[0.1] shadow-[0_35px_90px_rgba(0,0,0,0.85)] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 pb-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="font-mono font-bold text-white">{contact.address}</span>
              <span className="text-white/20 hidden md:inline">&middot;</span>
              <span className="text-gray-400 hidden md:inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span>{hours.summary[0]}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {onNavigateToRoutePlanner ? (
                <button
                  type="button"
                  onClick={onNavigateToRoutePlanner}
                  className="w-full sm:w-auto btn-gold rounded-full! py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-black" />
                  <span>Directions &amp; Map</span>
                </button>
              ) : (
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto btn-gold rounded-full! py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-black" />
                  <span>Open in Google Maps</span>
                </a>
              )}

              <a
                href={GOOGLE_MAPS_LINK || DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-gray-300 hover:text-gold transition-colors py-2.5 px-4 rounded-full bg-white/[0.04] border border-white/10"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="h-[460px] w-full relative rounded-[2.25rem] overflow-hidden border border-white/10 bg-[#111015]">
            <iframe
              title="Final Stop Barber Shop Google Map"
              src={EMBED_URL}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="pt-4 px-4 pb-1 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>{contact.address}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {contact.phones.map((line) => (
                <a
                  key={line.tel}
                  href={`tel:${line.tel}`}
                  className="inline-flex items-center gap-1.5 text-gray-300 hover:text-gold transition-colors font-mono"
                >
                  <Phone className="w-3.5 h-3.5 text-gold" />
                  <span>{line.label}: {line.display}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

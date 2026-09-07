import { useState, useEffect } from 'react';
import {
  Scissors,
  MapPin,
  Info,
  Calendar,
  Image as ImageIcon,
  Phone,
  Clock,
  Navigation,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Coffee,
  Wifi,
  Car,
  ChevronRight,
  X,
  Share2,
  Lock
} from 'lucide-react';
import { ALL_SERVICES } from './MobilePricingModal';
import MapSection from './MapSection';
import AnnouncementBanner from './AnnouncementBanner';

interface MobilePwaAppProps {
  onNavigateToBooking: (serviceName?: string) => void;
  onNavigateToRoutePlanner: () => void;
  onOpenCheckStatus: () => void;
  onOpenCallModal: () => void;
  onOpenWaitlist: () => void;
  isWaitlistOpen: boolean;
  onSwitchToWebView: () => void;
  onOpenAdminPortal?: () => void;
}

export type MobileTab = 'prices' | 'maps' | 'infos' | 'book' | 'gallery';

const BARBERS = [
  {
    id: 'mika',
    name: 'Mika',
    role: 'Lead Master Barber & Fondateur',
    experience: '12 ans de métier',
    specialty: 'Skin fades chirurgicaux, contours rasoir droit, textured crops et barbes taillées au millimètre.',
    initials: 'MK',
    badge: 'Master Fade & Razor',
    tags: ['Skin Fade', 'Rasoir Droit', 'Styling Texturé']
  },
  {
    id: 'luska',
    name: 'Luska',
    role: 'Artisan Barbier & Grooming Traditionnel',
    experience: '8 ans de métier',
    specialty: 'Sculpture de barbe sur-mesure, rituel vapeur serviette chaude eucalyptus et soins réparateurs.',
    initials: 'LK',
    badge: 'Artisan Barbe & Spa',
    tags: ['Sculpture Barbe', 'Serviette Chaude', 'Soin Relaxant']
  }
];

const GALLERY_IMAGES = [
  {
    src: 'https://i.ibb.co/20Ns74Tz/Chat-GPT-Image-6-sept-2026-15-53-44.png',
    alt: 'Twisted Locs with High Taper Fade & Beard Lineup',
    title: 'Locs & Taper Fade',
    tag: 'Fades'
  },
  {
    src: 'https://i.ibb.co/xq8zMm2t/Chat-GPT-Image-6-sept-2026-15-55-41.png',
    alt: 'Swirl Cornrows & Geometric Spiral Braids',
    title: 'Designer Braids',
    tag: 'Tresses'
  },
  {
    src: 'https://i.ibb.co/cXxD5MpB/Chat-GPT-Image-6-sept-2026-15-56-42.png',
    alt: 'Waist-Length Knotless Box Braids',
    title: 'Protective Styling',
    tag: 'Tresses'
  },
  {
    src: 'https://i.ibb.co/zhXtNXB4/Chat-GPT-Image-Sep-6-2026-03-38-30-PM-1.png',
    alt: 'Burgundy Goddess Locs & Edge Styling',
    title: 'Locs & Coloration',
    tag: 'Locs'
  },
  {
    src: 'https://i.ibb.co/d4N6qCDJ/Chat-GPT-Image-Sep-6-2026-03-39-13-PM-1.png',
    alt: 'Sleek High Braided Ponytail & Cornrow Crown',
    title: 'Braided Updo',
    tag: 'Tresses'
  },
  {
    src: 'https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png',
    alt: 'Final Stop Barbershop • Storefront & Grooming Lounge',
    title: 'Le Salon & Lounge',
    tag: 'Salon'
  },
  {
    src: 'https://i.ibb.co/Y4yKyxRB/Chat-GPT-Image-Sep-6-2026-03-26-27-PM.png',
    alt: 'Final Stop Signature Cuts & Styling Masterpieces',
    title: 'Signature Collection',
    tag: 'Fades'
  }
];

export default function MobilePwaApp({
  onNavigateToBooking,
  onNavigateToRoutePlanner,
  onOpenCheckStatus,
  onOpenCallModal,
  onOpenWaitlist,
  isWaitlistOpen,
  onSwitchToWebView,
  onOpenAdminPortal
}: MobilePwaAppProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('prices');
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>('Tous');

  // Splash Screen timer (1.8s) with animated logo, 3 dots and "powered by Levelup"
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 1900);
    return () => clearTimeout(timer);
  }, []);

  const filteredGallery = galleryFilter === 'Tous'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(img => img.tag === galleryFilter);

  return (
    <div className="min-h-screen bg-[#0E0E10] text-gray-100 flex flex-col justify-between font-sans pb-24 relative select-none antialiased">
      {/* 1. SPLASH SCREEN ANIMATION (Logo + 3 animated dots + Powered by Levelup) */}
      {showSplashScreen && (
        <div 
          className="fixed inset-0 z-[99999] bg-[#0A0A0C] flex flex-col items-center justify-between p-8 animate-out fade-out duration-700 pointer-events-none"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)'
          }}
        >
          <div className="w-full flex justify-end">
            <span className="text-[10px] font-mono tracking-widest text-gold/60 uppercase">PWA Mobile</span>
          </div>

          {/* Centered Logo & 3 Animated Dots */}
          <div className="flex flex-col items-center text-center my-auto">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-gold/50 p-1 shadow-[0_0_30px_rgba(197,160,89,0.35)] animate-pulse">
                <img
                  src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png"
                  alt="Final Stop Barber Shop"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <h1 className="text-xl font-serif font-bold text-white tracking-widest uppercase mb-1">
              Final Stop
            </h1>
            <p className="text-xs font-mono tracking-[0.2em] text-gold uppercase mb-6">
              Barber Shop • San Diego
            </p>

            {/* 3 Animated Dots in Gold */}
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-gold animate-bounce" />
            </div>
          </div>

          {/* Bottom Branding: powered by Levelup */}
          <div className="text-center pb-4">
            <p className="text-[11px] font-mono tracking-[0.25em] text-gray-400 uppercase font-semibold">
              Powered by <span className="text-gold font-bold">Levelup</span>
            </p>
          </div>
        </div>
      )}

      {/* Live Announcement Banner */}
      <AnnouncementBanner />

      {/* 2. TOP HEADER: Salon Image + Welcome Description + Quick Action Pills */}
      <header className="relative w-full bg-[#141416] border-b border-white/10 shadow-lg overflow-hidden">
        {/* Salon Cover Photo with Safe Area height limit */}
        <div 
          className="relative w-full overflow-hidden"
          style={{ height: 'calc(11.5rem + env(safe-area-inset-top, 0px))' }}
        >
          <img
            src="https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png"
            alt="Final Stop Barber Shop Lounge"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Deep Dark Gradients for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/60 to-black/40" />

          {/* Top Floating Controls - Safely spaced below the mobile notch / status bar */}
          <div 
            className="absolute left-3 right-3 flex items-center justify-between z-10"
            style={{ top: 'max(env(safe-area-inset-top, 0px), 12px)' }}
          >
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold/40 text-gold text-[10px] font-mono font-bold tracking-wider shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              OUVERT 9H - 19H
            </div>

            <button
              type="button"
              onClick={onSwitchToWebView}
              className="text-[10px] font-mono uppercase tracking-wider text-gray-200 hover:text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 transition-colors shadow-md active:scale-95 cursor-pointer"
              title="Passer au site complet"
            >
              Mode Web PC
            </button>
          </div>
        </div>

        {/* Salon Info & Welcome Description */}
        <div className="px-4 pb-4 -mt-10 relative z-10">
          <div className="flex items-end gap-3 mb-2">
            <div className="w-16 h-16 rounded-xl border-2 border-gold/60 overflow-hidden bg-black shadow-xl flex-shrink-0">
              <img
                src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png"
                alt="Logo Final Stop"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-serif font-bold text-white tracking-wide">
                  Final Stop Barber Shop
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <span className="text-gold font-bold flex items-center gap-0.5">★ 4.9</span>
                <span>•</span>
                <span className="truncate">North Park, San Diego</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 mb-3">
            L'artisanat du barbier haut de gamme à San Diego. Fades millimétrés, rasoir droit traditionnel, tresses & rituels serviette chaude.
          </p>

          {/* Quick Action Pills: Check Statut + Call + Waitlist */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenCheckStatus}
              className="bg-white/5 hover:bg-white/10 active:scale-95 border border-gold/40 text-gold text-xs font-mono font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-gold" />
              <span>Check Statut RDV</span>
            </button>

            <button
              type="button"
              onClick={onOpenCallModal}
              className="bg-gold hover:bg-gold-light active:scale-95 text-black text-xs font-mono font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler le Salon</span>
            </button>
          </div>

          {isWaitlistOpen && (
            <button
              type="button"
              onClick={onOpenWaitlist}
              className="w-full mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>File Walk-in Ouverte • Rejoindre en direct</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN TAB CONTENT AREA */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {/* TAB 1: PRIX & SERVICES */}
        {activeTab === 'prices' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-gold" />
                  Tarifs & Prestations
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">Soins et coupes d'élite à la carte</p>
              </div>
              <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
                {ALL_SERVICES.length} Prestations
              </span>
            </div>

            <div className="space-y-2.5">
              {ALL_SERVICES.map((srv, idx) => (
                <div
                  key={idx}
                  className="bg-[#141417] border border-white/10 hover:border-gold/40 rounded-xl p-3.5 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white tracking-tight">{srv.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                        <Clock className="w-3 h-3 text-gold" />
                        <span>{srv.duration}</span>
                        <span>•</span>
                        <span className="text-gray-300">{srv.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold font-mono text-gold">{srv.price}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {srv.desc}
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigateToBooking(srv.name)}
                    className="w-full bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 text-xs font-mono font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Réserver ce soin ({srv.price})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MAPS & TRAJET */}
        {activeTab === 'maps' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-gold" />
                  Localisation & Trajet
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">Au cœur de North Park, San Diego</p>
              </div>
            </div>

            {/* Address Banner Card */}
            <div className="bg-[#141417] border border-gold/30 rounded-xl p-3.5 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white font-serif">Final Stop Barber Shop</h3>
                  <p className="text-xs text-gray-300 mt-0.5">4679 30th St, San Diego, CA 92116</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Face au quartier commerçant de North Park, parking disponible.
                  </p>
                </div>
              </div>

              {/* 1-Tap Native GPS Navigation Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                <a
                  href="https://maps.google.com/?q=4679+30th+St,+San+Diego,+CA+92116"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-center py-2 px-2 rounded border border-white/15 text-gray-200 flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold" />
                  <span>Google Maps</span>
                </a>

                <a
                  href="https://maps.apple.com/?address=4679+30th+St,+San+Diego,+CA+92116"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-center py-2 px-2 rounded border border-white/15 text-gray-200 flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-gold" />
                  <span>Apple Maps</span>
                </a>

                <a
                  href="https://waze.com/ul?q=4679+30th+St,+San+Diego,+CA+92116"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-center py-2 px-2 rounded border border-white/15 text-gray-200 flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <Car className="w-3.5 h-3.5 text-gold" />
                  <span>Waze GPS</span>
                </a>
              </div>
            </div>

            {/* Interactive Mapbox Section */}
            <div className="rounded-xl overflow-hidden border border-white/15 shadow-xl">
              <MapSection />
            </div>

            {/* Launch Full Route Planner Page */}
            <button
              type="button"
              onClick={onNavigateToRoutePlanner}
              className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Calculer mon itinéraire personnalisé</span>
            </button>
          </div>
        )}

        {/* TAB 3: INFOS & ÉQUIPE */}
        {activeTab === 'infos' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-gold" />
                  Contact, Équipe & Salon
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">Tout savoir sur votre barbier</p>
              </div>
            </div>

            {/* Direct Phone Lines Card */}
            <div className="bg-[#141417] border border-gold/30 rounded-xl p-3.5 shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold font-bold mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Lignes Téléphoniques Directes
              </h3>

              <div className="space-y-2">
                <a
                  href="tel:+16198861267"
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 active:scale-98 p-2.5 rounded-lg border border-white/10 transition-all text-white"
                >
                  <div>
                    <div className="text-xs font-bold font-mono text-gold">+1 (619) 886-1267</div>
                    <div className="text-[10px] text-gray-400">Ligne Principale • Prise directe</div>
                  </div>
                  <span className="bg-gold text-black text-[10px] font-bold uppercase px-2 py-1 rounded">
                    Appeler
                  </span>
                </a>

                <a
                  href="tel:+16192849356"
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 active:scale-98 p-2.5 rounded-lg border border-white/10 transition-all text-white"
                >
                  <div>
                    <div className="text-xs font-bold font-mono text-gold">+1 (619) 284-9356</div>
                    <div className="text-[10px] text-gray-400">Ligne Secondaire • Salon Lounge</div>
                  </div>
                  <span className="bg-gold text-black text-[10px] font-bold uppercase px-2 py-1 rounded">
                    Appeler
                  </span>
                </a>
              </div>
            </div>

            {/* Hours of Operation */}
            <div className="bg-[#141417] border border-white/10 rounded-xl p-3.5 shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold font-bold mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Horaires d'Ouverture
              </h3>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Lundi - Vendredi</span>
                  <span className="text-white font-bold">9:00 - 19:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Samedi</span>
                  <span className="text-white font-bold">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Dimanche</span>
                  <span className="text-amber-400 font-bold">10:00 - 17:00</span>
                </div>
              </div>
            </div>

            {/* Barbers / Coiffeurs */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" />
                L'Équipe des Barbiers
              </h3>

              {BARBERS.map((barber) => (
                <div
                  key={barber.id}
                  className="bg-[#141417] border border-white/10 rounded-xl p-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-serif font-bold text-sm">
                        {barber.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">{barber.name}</h4>
                        <p className="text-[10px] text-gold font-mono">{barber.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/10">
                      {barber.experience}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {barber.specialty}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {barber.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-black/40 text-gray-300 px-2 py-0.5 rounded border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToBooking(barber.name)}
                    className="w-full bg-white/5 hover:bg-gold hover:text-black border border-white/15 text-xs font-mono font-bold py-2 rounded-lg text-center transition-all cursor-pointer"
                  >
                    Réserver avec {barber.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Salon Amenities */}
            <div className="bg-[#141417] border border-white/10 rounded-xl p-3.5 shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-wider text-gold font-bold mb-2.5">
                Inclus & Confort Salon
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 font-mono">
                <div className="flex items-center gap-2 p-2 rounded bg-black/30 border border-white/5">
                  <Coffee className="w-3.5 h-3.5 text-gold" />
                  <span>Espresso Offert</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-black/30 border border-white/5">
                  <Wifi className="w-3.5 h-3.5 text-gold" />
                  <span>Wi-Fi Fibre</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-black/30 border border-white/5">
                  <Car className="w-3.5 h-3.5 text-gold" />
                  <span>Parking Facile</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-black/30 border border-white/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                  <span>Hygiène Stérile</span>
                </div>
              </div>
            </div>

            {/* Discreet staff link - invisible to regular clients */}
            <div className="pt-6 pb-2 text-center text-[10px] text-gray-500 font-mono flex items-center justify-center gap-2">
              <span>© {new Date().getFullYear()} Final Stop Barber Shop</span>
              <span className="opacity-40">•</span>
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="opacity-20 hover:opacity-90 text-gray-500 hover:text-gold transition-opacity p-1 cursor-pointer"
                title=""
                aria-label="Staff"
              >
                <Lock className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: BOOK (RÉSERVATION & FILE WALK-IN) */}
        {activeTab === 'book' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  Prendre Rendez-vous
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">Choisissez votre formule préférée</p>
              </div>
            </div>

            {/* Main Booking Hero Card */}
            <div className="bg-[#141417] border border-gold/40 rounded-xl p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded border border-gold/30 inline-flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3" />
                Service Premium Garanti
              </span>

              <h3 className="text-base font-serif font-bold text-white mb-1.5">
                Réservation Immédiate en Ligne
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Bloquez votre créneau horaire avec votre coiffeur préféré (Mika ou Luska), sans attente à votre arrivée au salon.
              </p>

              <button
                type="button"
                onClick={() => onNavigateToBooking()}
                className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Ouvrir l'agenda des réservations</span>
              </button>
            </div>

            {/* Walk-in Waitlist Card */}
            <div className="bg-[#141417] border border-white/10 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white font-serif">File d'attente Walk-in</h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isWaitlistOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isWaitlistOpen ? 'Ouverte Actuellement' : 'Fermée pour le moment'}
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {isWaitlistOpen
                  ? 'Rejoignez la file sans rendez-vous depuis votre smartphone et suivez votre rang en temps réel.'
                  : 'La file sans rendez-vous est momentanément saturée ou fermée par le gérant. Privilégiez la réservation avec créneau horaire.'}
              </p>

              {isWaitlistOpen ? (
                <button
                  type="button"
                  onClick={onOpenWaitlist}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Rejoindre la file d'attente en direct</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCallModal}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-200 border border-white/15 text-xs font-mono font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-gold" />
                  <span>Appeler pour vérifier les créneaux disponibles</span>
                </button>
              )}
            </div>

            {/* Check Status Direct Card */}
            <div className="bg-[#141417] border border-white/10 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-serif">Déjà client ?</h4>
                <p className="text-[11px] text-gray-400">Consultez votre ticket ou modifiez votre RDV</p>
              </div>
              <button
                type="button"
                onClick={onOpenCheckStatus}
                className="bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 text-xs font-mono font-bold py-2 px-3 rounded-lg transition-all"
              >
                Vérifier
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: GALERIE PORTFOLIO */}
        {activeTab === 'gallery' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div>
                <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gold" />
                  Galerie & Réalisations
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">Portfolio officiel Final Stop</p>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['Tous', 'Fades', 'Tresses', 'Locs', 'Salon'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryFilter(cat)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-full border whitespace-nowrap transition-all cursor-pointer ${
                    galleryFilter === cat
                      ? 'bg-gold text-black font-bold border-gold shadow-sm'
                      : 'bg-[#141417] text-gray-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredGallery.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedGalleryImage(item.src)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[9px] font-mono text-gold uppercase tracking-wider block font-bold">
                      {item.tag}
                    </span>
                    <p className="text-xs font-medium text-white truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] font-mono text-gray-400">
                Touchez une photo pour l'agrandir en plein écran
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 4. FULLSCREEN PHOTO MODAL (FOR GALLERY) */}
      {selectedGalleryImage && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedGalleryImage(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-md w-full max-h-[80vh] rounded-2xl overflow-hidden border border-gold/40 shadow-2xl">
            <img
              src={selectedGalleryImage}
              alt="Agrandissement"
              className="w-full h-full object-contain bg-black"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-xs font-mono text-gray-400 mt-4 text-center">
            Touchez n'importe où pour fermer
          </p>
        </div>
      )}

      {/* 5. BOTTOM NAVIGATION BAR (FIXED TAB BAR WITH 5 REQUIRED TABS) */}
      <nav
        aria-label="Navigation mobile principale"
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#121215]/95 backdrop-blur-xl border-t border-gold/25 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] pb-safe"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 h-16 items-center px-1">
          {/* Tab 1: PRIX */}
          <button
            type="button"
            onClick={() => setActiveTab('prices')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition-all cursor-pointer ${
              activeTab === 'prices'
                ? 'text-gold font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Scissors className="w-5 h-5" />
              {activeTab === 'prices' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider mt-1">Prix</span>
          </button>

          {/* Tab 2: MAPS */}
          <button
            type="button"
            onClick={() => setActiveTab('maps')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition-all cursor-pointer ${
              activeTab === 'maps'
                ? 'text-gold font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Navigation className="w-5 h-5" />
              {activeTab === 'maps' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider mt-1">Maps</span>
          </button>

          {/* Tab 3: INFOS */}
          <button
            type="button"
            onClick={() => setActiveTab('infos')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition-all cursor-pointer ${
              activeTab === 'infos'
                ? 'text-gold font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Info className="w-5 h-5" />
              {activeTab === 'infos' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider mt-1">Infos</span>
          </button>

          {/* Tab 4: BOOK */}
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition-all cursor-pointer ${
              activeTab === 'book'
                ? 'text-gold font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Calendar className="w-5 h-5" />
              {activeTab === 'book' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider mt-1">Book</span>
          </button>

          {/* Tab 5: GALERIE */}
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'text-gold font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <ImageIcon className="w-5 h-5" />
              {activeTab === 'gallery' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider mt-1">Galerie</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

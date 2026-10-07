import { ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface HeroProps {
  onNavigateToBooking?: () => void;
}

export default function Hero({ onNavigateToBooking }: HeroProps) {
  const { hero, site } = useSiteData();
  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[88vh] md:min-h-[94vh] flex items-center justify-center border-b border-white/10 pt-24 pb-20 px-6 bg-[#0A0A0B]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50 mix-blend-luminosity z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/80 z-0"></div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        {/* Salon Logo */}
        {site.branding.logoUrl && (
          <div className="mb-6 flex justify-center">
            <img 
              src={site.branding.logoUrl} 
              alt={site.branding.logoAlt} 
              className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white mb-4 leading-tight">
          {hero?.titleLine1 ?? site.name} <br/>
          {hero?.titleLine2 && (
            <span className="not-italic font-sans font-black uppercase text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
              {hero.titleLine2}
            </span>
          )}
        </h1>

        <p className="text-sm md:text-base text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          {hero?.description}
        </p>
        
        {/* Centered Actions: Book Appointment placed right next to Explore Our Work */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={onNavigateToBooking}
            id="hero-reservation-button"
            className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black text-xs md:text-sm font-extrabold uppercase tracking-widest px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_4px_25px_rgba(197,160,89,0.4)] active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>{hero?.primaryCta ?? 'Book Appointment'}</span>
          </button>

          <a 
            href="#gallery" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-gold py-3.5 sm:py-4 px-6 border border-white/15 hover:border-gold transition-all duration-300 bg-[#151517]/80 backdrop-blur-sm group"
          >
            <span>{hero?.secondaryCta ?? 'Explore Our Work'}</span>
            <ChevronRight className="w-4 h-4 text-gold transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator Arrow (Mobile & Desktop) */}
      <button
        type="button"
        onClick={handleScrollDown}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 hover:text-gold transition-all duration-300 cursor-pointer group select-none bg-transparent border-none p-2"
        aria-label="Scroll down to read more"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400 group-hover:text-gold transition-colors">
          Scroll Down
        </span>
        <ChevronDown className="w-4 h-4 text-gold animate-bounce" />
      </button>
    </section>
  );
}

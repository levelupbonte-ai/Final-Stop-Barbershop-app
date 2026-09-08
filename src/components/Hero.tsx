import { ChevronRight, Calendar } from 'lucide-react';

interface HeroProps {
  onNavigateToBooking?: () => void;
}

export default function Hero({ onNavigateToBooking }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center justify-center border-b border-white/10 pt-24 pb-16 px-6 bg-[#0A0A0B]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50 mix-blend-luminosity z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/80 z-0"></div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        {/* Salon Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
            alt="Final Stop Barber Shop Logo" 
            className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            referrerPolicy="no-referrer"
          />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white mb-4 leading-tight">
          The Pinnacle <br/>
          <span className="not-italic font-sans font-black uppercase text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
            of Hair Artistry & Grooming
          </span>
        </h1>

        <p className="text-sm md:text-base text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          San Diego’s premier unisex destination for precision haircuts, beard sculpting, and master protective braids. Powered by Mika (specializing in women’s & girls’ knotless braids & locs) and Lusca (specializing in skin fades, men’s & boys’ styling).
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
            <span>Book Appointment</span>
          </button>

          <a 
            href="#gallery" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-gold py-3.5 sm:py-4 px-6 border border-white/15 hover:border-gold transition-all duration-300 bg-[#151517]/80 backdrop-blur-sm group"
          >
            <span>Explore Our Work</span>
            <ChevronRight className="w-4 h-4 text-gold transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

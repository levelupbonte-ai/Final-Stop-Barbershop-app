import { Calendar, ChevronRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center border-b border-white/10 pt-24 pb-16 px-6 bg-[#0A0A0B]">
      {/* Restored Original Hero Background */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50 mix-blend-luminosity z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/80 z-0"></div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        {/* Salon Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
            alt="Logo Barber Shop" 
            className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            referrerPolicy="no-referrer"
          />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white mb-4 leading-tight">
          L'Excellence <br/>
          <span className="not-italic font-sans font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tighter text-white">
            du Soin Masculin
          </span>
        </h1>

        <p className="text-sm md:text-base text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">
          Plus qu'une simple coupe, une véritable expérience de détente. Découvrez le savoir-faire de nos maîtres barbiers dans un cadre exclusif.
        </p>
        
        {/* High-visibility Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <a 
            href="#reservation" 
            id="hero-booking-button"
            className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black text-xs md:text-sm font-extrabold uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_25px_rgba(197,160,89,0.4)] active:scale-95"
          >
            <Calendar className="w-4 h-4 text-black" />
            Réserver maintenant
          </a>
          <a 
            href="#services" 
            id="hero-services-button"
            className="w-full sm:w-auto bg-[#151517]/90 hover:bg-white/10 text-white border border-white/20 hover:border-gold text-xs md:text-sm font-bold uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-3 transition-all duration-300 active:scale-95"
          >
            Nos prestations
            <ChevronRight className="w-4 h-4 text-gold" />
          </a>
        </div>
      </div>
    </section>
  );
}

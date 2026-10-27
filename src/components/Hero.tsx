import { ChevronRight, Scissors } from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface HeroProps {
  onNavigateToBooking?: (barberId?: string) => void;
  onSelectBarber?: (barberId: string) => void;
}

const MARQUEE_ITEMS = [
  'PRECISION SKIN FADES',
  'KNOTLESS BRAIDS & CORNROWS',
  'DREADLOCKS RETWIST & CARE',
  'BEARD SCULPTING & RAZOR LINE',
  'WALK-INS WELCOME',
  '4748 UNIVERSITY AVE · SAN DIEGO',
  '20+ YEARS OF MASTERY',
];

export default function Hero({ onNavigateToBooking, onSelectBarber }: HeroProps) {
  const { hero, site, barbers } = useSiteData();

  const mika = barbers.find((b) => b.name.toLowerCase().includes('mika') || b.id.toLowerCase().includes('mika')) ?? barbers[0];
  const lusca = barbers.find((b) => b.id !== mika?.id) ?? barbers[1] ?? barbers[0];

  const handleBarberClick = (barberId?: string) => {
    if (barberId && onSelectBarber) {
      onSelectBarber(barberId);
    } else {
      onNavigateToBooking?.(barberId);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between border-b border-white/10 pt-28 sm:pt-32 bg-[#070709] overflow-hidden">
      {/* Ambient Background Layers */}
      <div className="absolute inset-0 bg-hero-pattern opacity-40 mix-blend-luminosity z-0 scale-105"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(197,160,89,0.16),transparent_60%)] z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/55 to-[#070709]/85 z-0"></div>

      {/* Main Center-Stage Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full px-6 pb-14">

        {/* Oversized High-Impact Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-center font-serif italic text-white mb-6 leading-[0.98] tracking-tight max-w-5xl"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5.25rem)', textWrap: 'balance' }}
        >
          <span className="block text-gold-light/95 mb-1">
            {hero?.titleLine1 ?? site.name}
          </span>
          {hero?.titleLine2 && (
            <span className="not-italic font-sans font-black uppercase tracking-tighter bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent block">
              {hero.titleLine2}
            </span>
          )}
        </motion.h1>

        {/* Refined Lead Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-base md:text-lg text-gray-200 font-medium mb-10 max-w-2xl mx-auto text-center leading-relaxed"
        >
          {hero?.description}
        </motion.p>
        
        {/* Two Pill Buttons for Mika & Lusca (Zero Star/Sparkle Icons) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto"
        >
          <button
            type="button"
            onClick={() => handleBarberClick(mika?.id)}
            id="hero-mika-button"
            className="w-full sm:w-auto btn-gold rounded-full! text-xs sm:text-sm font-black px-9 py-4 whitespace-nowrap group cursor-pointer"
          >
            <span>{mika?.name ?? 'Mika'} &middot; Braids &amp; Locs</span>
            <ChevronRight className="w-4 h-4 text-black transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
          </button>

          <button 
            type="button"
            onClick={() => handleBarberClick(lusca?.id)}
            id="hero-lusca-button"
            className="w-full sm:w-auto btn-obsidian rounded-full! text-xs sm:text-sm font-black px-9 py-4 group whitespace-nowrap cursor-pointer"
          >
            <span>{lusca?.name ?? 'Lusca'} &middot; Fades &amp; Beards</span>
            <ChevronRight className="w-4 h-4 text-gold transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Infinite Kinetic Marquee Ribbon */}
      <div className="relative z-10 w-full bg-[#0E0E12]/90 border-t border-white/10 py-3.5 overflow-hidden">
        <div className="animate-marquee flex items-center gap-8">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-8 text-[11px] sm:text-xs font-sans font-extrabold uppercase tracking-[0.2em] text-gray-200 whitespace-nowrap"
            >
              <span>{item}</span>
              <Scissors className="w-3.5 h-3.5 text-gold shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Clock, Receipt, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import MobilePricingModal from './MobilePricingModal';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface TeamAndPricingProps {
  onNavigateToBooking?: (serviceName?: string) => void;
  onSelectBarber?: (barberId: string) => void;
  onNavigateToServices?: () => void;
}

export default function TeamAndPricing({ onNavigateToBooking }: TeamAndPricingProps) {
  const [isMobilePricingOpen, setIsMobilePricingOpen] = useState(false);
  const { services } = useSiteData();
  const PRICING_LIST = services.slice(0, 8).map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    duration: s.duration,
    desc: s.description
  }));

  return (
    <section id="team-pricing" className="py-24 bg-[#0B0B0E] relative overflow-hidden">
      {/* Soft Radial Ambient Aura */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[780px] h-[320px] bg-gold/[0.06] rounded-full blur-[130px]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Sculpted Editorial Salon Menu Pavilion */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[2.75rem] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent border border-white/[0.08] p-7 sm:p-12 md:p-14 shadow-[0_30px_90px_rgba(0,0,0,0.75)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-6 border-b border-white/[0.08]">
            <div>
              <span className="text-gold text-[11px] uppercase font-mono tracking-[0.25em] font-bold block mb-2">
                The Salon Menu &middot; Transparent Rates
              </span>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-white">
                Signature <span className="italic text-gold">Services &amp; Craft</span>
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Pay in shop &middot; $0 advance deposit
            </span>
          </div>

          {/* Desktop: Numbered Editorial Menu with Fluid Curved Hover States */}
          <div className="hidden md:grid md:grid-cols-2 gap-x-12 gap-y-2">
            {PRICING_LIST.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: (idx % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onNavigateToBooking?.(item.name)}
                className="py-4 px-5 -mx-2 rounded-[1.75rem] hover:bg-gradient-to-r hover:from-gold/[0.1] hover:via-white/[0.02] hover:to-transparent transition-all duration-200 cursor-pointer group border-b border-white/[0.06] last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-xs font-serif italic text-gold/60 group-hover:text-gold transition-colors shrink-0">
                      0{idx + 1}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors truncate">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex-1 border-b border-dotted border-white/15 group-hover:border-gold/40 mx-2 relative -top-1 transition-colors" />
                  <span className="text-xl font-serif font-bold text-gold tabular-nums shrink-0">
                    {item.price}
                  </span>
                </div>

                <div className="pl-7 flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">
                    {item.desc}
                  </p>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono shrink-0 group-hover:text-gold transition-colors">
                    <Clock className="w-3 h-3 text-gold" />
                    <span>{item.duration}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Editorial Rows + Menu Expansion Button */}
          <div className="block md:hidden divide-y divide-white/10">
            {PRICING_LIST.slice(0, 4).map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigateToBooking?.(item.name)}
                className="py-4 flex flex-col gap-1 cursor-pointer group"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2.5 min-w-0">
                    <span className="text-xs font-serif italic text-gold/70 shrink-0">
                      0{idx + 1}
                    </span>
                    <h4 className="text-base font-serif font-bold text-white group-hover:text-gold truncate">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex-1 border-b border-dotted border-white/15 mx-2 relative -top-1" />
                  <span className="text-lg font-serif font-bold text-gold shrink-0 tabular-nums">
                    {item.price}
                  </span>
                </div>
                <p className="pl-6 text-xs text-gray-400 leading-relaxed line-clamp-1">
                  {item.desc}
                </p>
                <span className="pl-6 text-[11px] text-gray-500 flex items-center gap-1.5 font-mono mt-0.5">
                  <Clock className="w-3 h-3 text-gold" />
                  <span>{item.duration}</span>
                </span>
              </div>
            ))}

            <div className="pt-6">
              <button
                type="button"
                onClick={() => setIsMobilePricingOpen(true)}
                className="w-full btn-outline-gold rounded-full! text-xs py-3.5 px-4 group"
              >
                <Receipt className="w-4 h-4" />
                <span>View Full Salon Menu ({services.length})</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Dedicated Mobile Pricing & Services Modal */}
      <MobilePricingModal 
        isOpen={isMobilePricingOpen}
        onClose={() => setIsMobilePricingOpen(false)}
        onNavigateToBooking={onNavigateToBooking}
      />
    </section>
  );
}

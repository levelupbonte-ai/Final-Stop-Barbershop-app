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
    <section id="team-pricing" className="py-24 bg-[#0B0B0E] relative border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Editorial Salon Menu — Fine Hairline Rows with Dotted Leaders */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/10 mb-4">
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

          {/* Desktop: Unboxed 2-Column Editorial Menu */}
          <div className="hidden md:grid md:grid-cols-2 gap-x-12 divide-y divide-white/[0.08]">
            {PRICING_LIST.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: (idx % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onNavigateToBooking?.(item.name)}
                className="py-5 px-3 -mx-3 rounded-xl hover:bg-white/[0.025] transition-all duration-200 cursor-pointer group border-b border-white/[0.08]"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h4 className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors flex items-center gap-2">
                    <span>{item.name}</span>
                  </h4>
                  <div className="flex-1 border-b border-dotted border-white/15 mx-2 relative -top-1" />
                  <span className="text-xl font-serif font-bold text-gold tabular-nums shrink-0">
                    {item.price}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
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
                  <h4 className="text-base font-serif font-bold text-white group-hover:text-gold">
                    {item.name}
                  </h4>
                  <div className="flex-1 border-b border-dotted border-white/15 mx-2 relative -top-1" />
                  <span className="text-lg font-serif font-bold text-gold shrink-0 tabular-nums">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">
                  {item.desc}
                </p>
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-mono mt-0.5">
                  <Clock className="w-3 h-3 text-gold" />
                  <span>{item.duration}</span>
                </span>
              </div>
            ))}

            <div className="pt-5">
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

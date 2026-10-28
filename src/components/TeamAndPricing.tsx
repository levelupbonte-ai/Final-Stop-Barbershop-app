import { useState, useMemo } from 'react';
import { Clock, Receipt, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import MobilePricingModal from './MobilePricingModal';
import { useSiteData } from '../lib/site/SiteDataProvider';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getServiceSpecialist
} from '../lib/site/specialist';

interface TeamAndPricingProps {
  onNavigateToBooking?: (serviceName?: string, barberId?: string) => void;
  onSelectBarber?: (barberId: string) => void;
  onNavigateToServices?: () => void;
}

export default function TeamAndPricing({ onNavigateToBooking }: TeamAndPricingProps) {
  const [isMobilePricingOpen, setIsMobilePricingOpen] = useState(false);
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>('lusca');
  const { services, barbers } = useSiteData();

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];
  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  const specialistServices = useMemo(() => {
    const filtered = services.filter((s) => getServiceSpecialist(s) === activeSpecialist);
    return filtered.length > 0 ? filtered : services;
  }, [services, activeSpecialist]);

  const PRICING_LIST = specialistServices.slice(0, 8).map((s) => ({
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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-8 border-b border-white/[0.08]">
            <div>
              <span className="text-gold text-[11px] uppercase font-mono tracking-[0.25em] font-bold block mb-2">
                {activeUniverseMeta.craftBadge} &middot; Transparent Rates
              </span>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-white">
                {activeUniverseMeta.name} &mdash;{' '}
                <span className="italic text-gold">{activeUniverseMeta.universeTitle}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
                {activeUniverseMeta.universeSubtitle}
              </p>
            </div>

            {/* 2-Universe Switcher Pill */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-[#121217] border border-white/12 self-start lg:self-end shrink-0">
              {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
                const meta = SPECIALIST_UNIVERSES[specKey];
                const isActive = activeSpecialist === specKey;
                return (
                  <button
                    key={specKey}
                    type="button"
                    onClick={() => setActiveSpecialist(specKey)}
                    className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-sans font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gold text-black shadow-[0_4px_18px_rgba(197,160,89,0.4)]'
                        : 'text-gray-400 hover:text-white bg-transparent'
                    }`}
                  >
                    {meta.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: Numbered Editorial Menu Exclusively for Selected Specialist */}
          <div className="hidden md:grid md:grid-cols-2 gap-x-12 gap-y-2">
            {PRICING_LIST.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: (idx % 2) * 0.05 }}
                onClick={() =>
                  onNavigateToBooking?.(item.id, activeBarberProfile?.id ?? activeSpecialist)
                }
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
                key={item.id}
                onClick={() =>
                  onNavigateToBooking?.(item.id, activeBarberProfile?.id ?? activeSpecialist)
                }
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
                <span>
                  View All {activeUniverseMeta.name} Services ({specialistServices.length})
                </span>
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
        initialSpecialist={activeSpecialist}
      />
    </section>
  );
}

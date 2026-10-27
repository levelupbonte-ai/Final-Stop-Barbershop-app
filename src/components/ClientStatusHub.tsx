import { Users, Calendar, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface ClientStatusHubProps {
  onOpenCheckStatus?: (initialQuery?: string) => void;
  onOpenWaitlist: () => void;
  isWaitlistOpen?: boolean;
  onOpenOwnerControls?: () => void;
  onNavigateToBooking?: () => void;
}

export default function ClientStatusHub({ 
  onOpenWaitlist, 
  isWaitlistOpen = false,
  onNavigateToBooking
}: ClientStatusHubProps) {
  const { barbers } = useSiteData();
  const teamNames = barbers.map((b) => b.name).join(' & ');

  return (
    <section id="client-status" className="py-16 bg-[#09090C] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Single Sculpted Panoramic Lounge Capsule — Zero Nested Rectangular Boxes */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[3rem] overflow-hidden border border-gold/25 bg-gradient-to-br from-[#16151C] via-[#0E0E13] to-[#09090C] p-8 sm:p-12 lg:p-16 shadow-[0_32px_90px_rgba(0,0,0,0.8)]"
        >
          {/* Sculptural Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-gold/15 rounded-full blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Editorial Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-gold text-[11px] font-mono uppercase tracking-[0.25em] font-bold block">
                Real-Time Lounge Access &middot; San Diego
              </span>

              <h2 className="text-3xl sm:text-5xl font-black font-sans uppercase text-white tracking-tight leading-[1.04]">
                Walk-In Queue <span className="font-serif italic font-bold text-gold">&amp; Private Chairs</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                Reserve your exact hour with {teamNames} or step into our live walk-in line before arriving at the salon.
              </p>

              {/* Unboxed Inline Specifications */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-gray-400">
                <span className="text-emerald-400 font-semibold">$0 Advance Deposit</span>
                <span className="text-white/20" aria-hidden="true">&middot;</span>
                <span>Pay in Person After Cut</span>
                <span className="text-white/20" aria-hidden="true">&middot;</span>
                <span className="text-gold">Instant Pass Confirmation</span>
              </div>
            </div>

            {/* Right Fluid Action Column */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 lg:pl-10 lg:border-l lg:border-white/10">
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="w-full btn-gold rounded-full! py-4 px-7 text-xs sm:text-sm font-black group justify-between"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-black shrink-0" />
                  <span>Reserve Your Chair</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
              </button>

              {isWaitlistOpen && (
                <button
                  type="button"
                  onClick={onOpenWaitlist}
                  className="w-full btn-obsidian rounded-full! py-4 px-7 text-xs sm:text-sm font-bold group justify-between"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Join Live Walk-In Queue</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 tabular-nums">~10-15m</span>
                </button>
              )}
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

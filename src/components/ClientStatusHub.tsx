import { Users, Calendar } from 'lucide-react';
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
    <section id="client-status" className="py-20 bg-[#08080B] border-y border-white/10 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10"
        >
          <div>
            <span className="text-gold text-[10px] font-mono uppercase tracking-[0.25em] font-bold block mb-2">
              Real-Time Lounge Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-sans uppercase text-white tracking-tight">
              Walk-In Queue <span className="font-serif italic font-bold text-gold">&amp; Reservations</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
              Join our live walk-in queue or reserve a dedicated appointment slot with {teamNames}.
            </p>
          </div>
        </motion.div>

        {/* Central Action Cards (No Check Ticket Status Card) */}
        <div className={`grid grid-cols-1 gap-8 ${isWaitlistOpen ? 'md:grid-cols-2' : 'max-w-xl mx-auto'}`}>
          
          {/* Card 1: Same-Day Walk-In Waitlist */}
          {isWaitlistOpen && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55 }}
              className="card-luxury p-7 flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0A0A0D] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Queue Open
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  Walk-In Queue (No Booking)
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                  Visiting without an appointment? Join our live queue remotely to minimize time spent waiting in the lounge.
                </p>

                <div className="bg-[#09090B] p-4 rounded-xl border border-white/8 space-y-2 mb-6 text-xs font-mono text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Estimated wait:</span>
                    <span className="text-white font-bold tabular-nums">~ 10-15 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active barbers:</span>
                    <span className="text-emerald-400 font-bold">{barbers.map((b) => b.name).join(' · ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onOpenWaitlist}
                  className="w-full btn-outline-gold rounded-full! text-xs py-3.5 px-5"
                >
                  <Users className="w-4 h-4" />
                  <span>Join Live Walk-In Line</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Card 2: Schedule Advance Appointment */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="card-luxury p-7 flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#0A0A0D] border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-gold font-semibold">
                  Recommended
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                Book Guaranteed Appointment
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                Guaranteed zero wait: pick your custom date and time slot with {barbers.map((b) => b.name).join(' or ')}.
              </p>

              <div className="bg-[#09090B] p-4 rounded-xl border border-white/8 space-y-2 mb-6 text-xs font-mono text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Advance deposit:</span>
                  <span className="text-emerald-400 font-bold">$0 &middot; Pay in person</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confirmation:</span>
                  <span className="text-white font-bold">Instant Pass &amp; Email</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="w-full btn-gold rounded-full! text-xs py-3.5 px-5"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Appointment</span>
              </button>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

import { ArrowLeft, Calendar, Compass, Scissors, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Navbar, { NavView } from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useSiteData } from '../../lib/site/SiteDataProvider';

interface NotFoundPageProps {
  isWaitlistOpen: boolean;
  onNavigateToView: (view: NavView) => void;
  onNavigateToBooking: () => void;
  onOpenCheckStatus: () => void;
  onOpenCallModal: () => void;
  onOpenPolicies: () => void;
}

export default function NotFoundPage({
  isWaitlistOpen,
  onNavigateToView,
  onNavigateToBooking,
  onOpenCheckStatus,
  onOpenCallModal,
  onOpenPolicies,
}: NotFoundPageProps) {
  const { site } = useSiteData();

  return (
    <div className="min-h-screen bg-[#070709] text-gray-200 flex flex-col justify-between">
      <Navbar
        currentView="not-found"
        onNavigateToBooking={onNavigateToBooking}
        onNavigateToView={onNavigateToView}
        onOpenCheckStatus={onOpenCheckStatus}
        onOpenWaitlist={() => onNavigateToView('waitlist')}
        onOpenCallModal={onOpenCallModal}
        isWaitlistOpen={isWaitlistOpen}
      />

      <main className="relative flex-1 flex items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gold/[0.08] rounded-full blur-[130px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold mb-4"
          >
            <Scissors className="w-3.5 h-3.5 text-gold" />
            <span>Error 404 &middot; Page Not Found</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(4.5rem, 12vw, 8.5rem)' }}
          >
            <span className="bg-gradient-to-b from-[#E5C98B] via-[#C5A059] to-[#7A5E28] bg-clip-text text-transparent">
              404
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4"
          >
            This Chair Doesn&apos;t Exist.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto leading-relaxed mb-9"
          >
            The page or link you followed may have moved or no longer exists. Head back to {site.name} to book your appointment or view our master barbers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              type="button"
              onClick={() => onNavigateToView('home')}
              className="w-full sm:w-auto btn-gold rounded-full! text-xs px-7 py-4 group"
            >
              <ArrowLeft className="w-4 h-4 text-black transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToBooking}
              className="w-full sm:w-auto btn-obsidian rounded-full! text-xs px-6 py-4"
            >
              <Calendar className="w-4 h-4 text-gold" />
              <span>Book Appointment</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToView('waitlist')}
              className="w-full sm:w-auto btn-outline-gold rounded-full! text-xs px-6 py-4"
            >
              <Users className="w-4 h-4" />
              <span>Live Queue</span>
            </button>
          </motion.div>

          {/* Quick Directory Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-gray-400"
          >
            <button
              type="button"
              onClick={() => onNavigateToView('barbers')}
              className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
            >
              Master Barbers
            </button>
            <span className="text-white/20">/</span>
            <button
              type="button"
              onClick={() => onNavigateToView('services')}
              className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
            >
              Services &amp; Pricing
            </button>
            <span className="text-white/20">/</span>
            <button
              type="button"
              onClick={() => onNavigateToView('gallery')}
              className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
            >
              Portfolio
            </button>
            <span className="text-white/20">/</span>
            <button
              type="button"
              onClick={() => onNavigateToView('route')}
              className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase inline-flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-gold" />
              <span>Directions</span>
            </button>
          </motion.div>
        </div>
      </main>

      <Footer
        onNavigateToBooking={onNavigateToBooking}
        onNavigateToView={onNavigateToView}
        onOpenPolicies={onOpenPolicies}
      />
    </div>
  );
}

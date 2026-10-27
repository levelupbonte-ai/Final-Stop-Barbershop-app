import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Users, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteData } from '../lib/site/SiteDataProvider';

export type NavView = 'home' | 'barbers' | 'services' | 'waitlist' | 'gallery' | 'reviews' | 'route' | 'policies';

interface NavbarProps {
  currentView?: string;
  onNavigateToBooking?: (serviceName?: string) => void;
  onNavigateToView?: (view: NavView) => void;
  onOpenCheckStatus?: () => void;
  onOpenWaitlist?: () => void;
  onOpenCallModal?: () => void;
  isWaitlistOpen?: boolean;
}

export default function Navbar({ 
  currentView = 'home',
  onNavigateToBooking,
  onNavigateToView,
}: NavbarProps) {
  const { site } = useSiteData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; view: NavView; badge?: string }[] = [
    { name: 'Home', view: 'home' },
    { name: 'Barbers', view: 'barbers' },
    { name: 'Services', view: 'services' },
    { name: 'Waitlist', view: 'waitlist', badge: 'Live' },
    { name: 'Portfolio', view: 'gallery' },
    { name: 'Reviews', view: 'reviews' },
    { name: 'Directions', view: 'route' },
    { name: 'Policies', view: 'policies' },
  ];

  const handleLinkClick = (view: NavView) => {
    setMobileMenuOpen(false);
    if (onNavigateToView) {
      onNavigateToView(view);
    }
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2.5 sm:py-3 bg-[#09090B]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.85)]' 
          : 'py-4 sm:py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-10 2xl:px-14 flex items-center justify-between gap-3 lg:gap-4 xl:gap-6">
        
        {/* Zone 1 (Far Left): Brand Logo — shrink-0 prevents any overlap */}
        <div className="flex items-center justify-start shrink-0 xl:flex-1 min-w-fit">
          <button 
            type="button"
            onClick={() => handleLinkClick('home')}
            className="flex items-center group bg-transparent border-none p-0 cursor-pointer shrink-0"
            aria-label="Final Stop Barber Shop Home"
          >
            <img
              src={site.branding.logoUrl ?? undefined}
              alt={site.branding.logoAlt}
              className="h-9 sm:h-10 lg:h-10 xl:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>

        {/* Zone 2 (Exact Center): Glass Capsule Navigation — scales cleanly from lg to 2xl */}
        <div className="hidden lg:flex items-center justify-center shrink-0">
          <div className="p-1 xl:p-1.5 flex items-center rounded-full bg-[#121216]/95 backdrop-blur-xl border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <ul className="flex items-center gap-0.5 xl:gap-1 whitespace-nowrap">
              {navLinks.map((link) => {
                const isActive = currentView === link.view;
                return (
                  <li key={link.name} className="shrink-0">
                    <button 
                      type="button"
                      onClick={() => handleLinkClick(link.view)}
                      className={`text-[10px] xl:text-[11px] uppercase tracking-[0.06em] xl:tracking-[0.1em] 2xl:tracking-[0.12em] font-bold transition-all duration-200 cursor-pointer border-none px-2.5 xl:px-3.5 2xl:px-4 py-1.5 xl:py-2 rounded-full relative whitespace-nowrap flex items-center gap-1 xl:gap-1.5 ${
                        isActive 
                          ? 'bg-gradient-to-b from-[#E2C482] to-[#C5A059] text-black shadow-[0_4px_16px_rgba(197,160,89,0.4)]' 
                          : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className={`text-[8px] xl:text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full font-extrabold ${
                          isActive
                            ? 'bg-black/20 text-black'
                            : 'text-gold bg-gold/15 border border-gold/35'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Zone 3 (Far Right): Single Primary Action + Mobile Hamburger */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 xl:flex-1 min-w-fit">
          <button
            type="button"
            onClick={() => onNavigateToBooking?.()}
            className="btn-gold rounded-full! text-[10px] sm:text-[11px] xl:text-xs px-3.5 sm:px-5 xl:px-6 py-2 sm:py-2.5 whitespace-nowrap shrink-0 group"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Book Now</span>
            <ArrowUpRight className="w-3.5 h-3.5 hidden sm:inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Clean Unboxed Hamburger Icon for Mobile & Tablet (< lg) */}
          <button 
            type="button"
            className="lg:hidden text-white hover:text-gold p-1.5 transition-colors cursor-pointer bg-transparent border-none outline-none shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gold" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown — Zero bubbles on links */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 w-full max-h-[85vh] overflow-y-auto bg-[#09090B]/98 backdrop-blur-2xl border-b border-white/10 py-5 px-6 shadow-2xl"
          >
            <ul className="flex flex-col divide-y divide-white/[0.06]">
              {navLinks.map((link) => {
                const isActive = currentView === link.view;
                return (
                  <li key={link.name}>
                    <button 
                      type="button"
                      onClick={() => handleLinkClick(link.view)}
                      className={`w-full text-left flex items-center justify-between text-xs font-serif uppercase tracking-[0.15em] py-3.5 bg-transparent border-none rounded-none cursor-pointer transition-colors ${
                        isActive 
                          ? 'text-gold font-bold' 
                          : 'text-gray-200 hover:text-gold'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{link.name}</span>
                        {link.badge && (
                          <span className="text-[9px] font-mono tracking-wider text-gold/90 uppercase">
                            &middot; {link.badge}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gold/70" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="pt-5 mt-2 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToBooking?.();
                }}
                className="w-full btn-gold rounded-full! text-xs py-3.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment (Guaranteed)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLinkClick('waitlist');
                }}
                className="w-full btn-outline-gold rounded-full! text-xs py-3"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Live Walk-In Queue</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

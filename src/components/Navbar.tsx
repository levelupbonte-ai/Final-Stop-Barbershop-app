import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Phone, Search, Users, Bell, Smartphone } from 'lucide-react';

interface NavbarProps {
  onNavigateToBooking?: () => void;
  onOpenCheckStatus?: () => void;
  onOpenWaitlist?: () => void;
  onOpenPromo?: () => void;
  onOpenCallModal?: () => void;
  onOpenNotifications?: () => void;
  isWaitlistOpen?: boolean;
}

export default function Navbar({ 
  onNavigateToBooking,
  onOpenCheckStatus,
  onOpenWaitlist,
  onOpenPromo,
  onOpenCallModal,
  onOpenNotifications,
  isWaitlistOpen = false,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Barbers & Rates', href: '#team-pricing' },
    { name: 'Live Queue & Lounge', href: '#client-status' },
    { name: 'Portfolio', href: '#gallery' },
    { name: 'Location & Map', href: '#contact' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${
      isScrolled ? 'bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-gradient-to-b from-[#0A0A0B]/90 to-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center group">
          <img 
            src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
            alt="Final Stop Barber Shop Logo" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Desktop Menu Links */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-5 xl:gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-xs uppercase tracking-widest font-medium text-gray-300 hover:text-gold transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Clean Top Action: Call & Book Appointment CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="text-xs font-medium text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 px-2.5 py-2 cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
              title="Notifications & Application Mobile (PWA)"
            >
              <Bell className="w-3.5 h-3.5 text-gold" />
              <span className="hidden md:inline">App & Alertes</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCallModal}
            className="text-xs font-medium text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5 px-3 py-2 cursor-pointer bg-transparent border-none"
            title="Call Shop (Choose from 2 lines)"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden xl:inline">+1 (619) 886-1267</span>
            <span className="xl:hidden">Call</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToBooking}
            className="bg-gold hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider px-4 py-2 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToBooking}
            className="sm:hidden bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase px-3 py-1.5 cursor-pointer transition-colors rounded-sm"
          >
            Book
          </button>

          <button 
            type="button"
            className="text-white p-2 hover:text-gold transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gold" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0A0A0B]/98 backdrop-blur-xl border-b border-white/10 py-5 px-6 shadow-2xl animate-fadeIn">
          <ul className="flex flex-col gap-3.5">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="block text-sm font-serif font-medium text-gray-200 hover:text-gold uppercase tracking-wider py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}

            <li className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onNavigateToBooking?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase py-3 flex items-center justify-center gap-2 font-mono cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>

              {onOpenCheckStatus && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenCheckStatus();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#151517] hover:bg-[#202026] text-gray-200 hover:text-gold border border-white/15 hover:border-gold/50 text-xs font-bold uppercase py-3 flex items-center justify-center gap-2 font-mono cursor-pointer active:scale-98 transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-gold" />
                  <span>Check Appointment / Chair Status</span>
                </button>
              )}

              {/* Waitlist ONLY visible if authorized by owner */}
              {isWaitlistOpen && onOpenWaitlist && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenWaitlist();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#151517] hover:bg-[#202026] text-amber-400 border border-amber-500/40 text-xs font-bold uppercase py-2.5 flex items-center justify-center gap-2 font-mono cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Join Same-Day Waitlist</span>
                </button>
              )}

              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenNotifications();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#151517] hover:bg-[#202026] text-gold border border-gold/40 text-xs font-bold uppercase py-2.5 flex items-center justify-center gap-2 font-mono cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notifications & Installer l'App Mobile</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCallModal?.();
                }}
                className="w-full text-center text-xs text-gray-400 hover:text-gold py-2 font-mono flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Call Shop (2 Phone Lines)</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

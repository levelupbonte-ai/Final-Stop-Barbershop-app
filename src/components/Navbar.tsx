import { useState, useEffect, useRef } from 'react';
import { Menu, X, Calendar, Phone, Search, Users, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';

export type NavView = 'home' | 'barbers' | 'services' | 'waitlist' | 'gallery' | 'reviews' | 'route' | 'admin';

interface NavbarProps {
  currentView?: string;
  onNavigateToBooking?: (serviceName?: string) => void;
  onNavigateToView?: (view: NavView) => void;
  onOpenCheckStatus?: () => void;
  onOpenWaitlist?: () => void;
  onOpenPromo?: () => void;
  onOpenCallModal?: () => void;
  isWaitlistOpen?: boolean;
}

export default function Navbar({ 
  currentView = 'home',
  onNavigateToBooking,
  onNavigateToView,
  onOpenCheckStatus,
  onOpenWaitlist,
  onOpenPromo,
  onOpenCallModal,
  isWaitlistOpen = false,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkScrollability = () => {
    if (navContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const handleScrollMenu = (direction: 'left' | 'right') => {
    if (navContainerRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      navContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const navLinks: { name: string; view: NavView; badge?: string }[] = [
    { name: 'Home', view: 'home' },
    { name: 'Our Barbers', view: 'barbers' },
    { name: 'Services & Pricing', view: 'services' },
    { name: 'Live Waitlist', view: 'waitlist', badge: 'Walk-In' },
    { name: 'Portfolio', view: 'gallery' },
    { name: 'Reviews', view: 'reviews' },
    { name: 'Directions', view: 'route' },
  ];

  const handleLinkClick = (view: NavView) => {
    setMobileMenuOpen(false);
    if (onNavigateToView) {
      onNavigateToView(view);
    }
  };

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${
      isScrolled ? 'bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-gradient-to-b from-[#0A0A0B]/95 to-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-4">
        
        {/* Brand Logo */}
        <button 
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center group bg-transparent border-none p-0 cursor-pointer shrink-0"
          aria-label="Final Stop Barber Shop Home"
        >
          <img 
            src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
            alt="Final Stop Barber Shop Logo" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Desktop Menu Links with PC Scroll Indicators */}
        <div className="hidden lg:flex items-center relative min-w-0 max-w-2xl">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollMenu('left')}
              className="absolute -left-3 z-10 p-1 rounded-full bg-[#111115] border border-white/20 text-gold hover:text-white shadow-md cursor-pointer"
              title="Scroll previous items"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            ref={navContainerRef}
            onScroll={checkScrollability}
            className="overflow-x-auto no-scrollbar py-1 px-1 flex items-center"
          >
            <ul className="flex items-center gap-4 xl:gap-5 whitespace-nowrap">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick(link.view)}
                    className={`text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer bg-transparent border-none py-1 relative whitespace-nowrap ${
                      currentView === link.view 
                        ? 'text-gold font-bold' 
                        : 'text-gray-200 hover:text-gold'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="ml-1.5 text-[10px] font-mono text-gold bg-gold/15 px-1.5 py-0.5 rounded-xs border border-gold/40 font-bold">
                        {link.badge}
                      </span>
                    )}
                    {currentView === link.view && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollMenu('right')}
              className="absolute -right-3 z-10 p-1 rounded-full bg-[#111115] border border-gold/50 text-gold hover:text-white shadow-md cursor-pointer animate-pulse"
              title="Scroll more menu items"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clean Top Actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCallModal}
            className="text-xs font-semibold text-gray-200 hover:text-gold transition-colors flex items-center gap-1.5 px-2.5 py-2 cursor-pointer bg-transparent border border-white/10 rounded-xs font-mono"
            title="Call Mika or Lusca direct lines"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden xl:inline">Call Barbers</span>
            <span className="xl:hidden">Call</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToBooking?.()}
            className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToBooking?.()}
            className="sm:hidden bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase px-3 py-1.5 cursor-pointer transition-colors rounded-sm"
          >
            Book
          </button>

          <button 
            type="button"
            className="text-white p-2 hover:text-gold transition-colors cursor-pointer bg-transparent border-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gold" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full max-h-[85vh] overflow-y-auto bg-[#0A0A0B]/98 backdrop-blur-xl border-b border-white/10 py-5 px-6 shadow-2xl animate-fadeIn">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button 
                  type="button"
                  onClick={() => handleLinkClick(link.view)}
                  className={`w-full text-left flex items-center justify-between text-sm font-serif font-medium uppercase tracking-wider py-1.5 bg-transparent border-none cursor-pointer ${
                    currentView === link.view ? 'text-gold font-bold' : 'text-gray-200 hover:text-gold'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </li>
            ))}

            <li className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToBooking?.();
                }}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase py-3 flex items-center justify-center gap-2 font-mono cursor-pointer"
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
                className="w-full bg-[#151517] hover:bg-[#202026] text-gold border border-gold/40 text-xs font-bold uppercase py-2.5 flex items-center justify-center gap-2 font-mono cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Live Walk-In Queue</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCheckStatus?.();
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase py-2.5 flex items-center justify-center gap-2 font-mono cursor-pointer border border-white/10"
              >
                <Search className="w-3.5 h-3.5 text-gold" />
                <span>Check Ticket / Status</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCallModal?.();
                }}
                className="w-full text-center text-xs text-gray-400 hover:text-gold py-2 font-mono flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Call Barbers: Mika & Lusca</span>
              </button>
            </li>

            {/* Mobile Scroll indicator prompt */}
            <li className="text-center pt-2 text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1">
              <span>Scroll for more options</span>
              <ChevronDown className="w-3 h-3 text-gold animate-bounce" />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

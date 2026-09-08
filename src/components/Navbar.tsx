import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Phone, Search, Users, Scissors, Award, Database, Sparkles } from 'lucide-react';

export type NavView = 'home' | 'barbers' | 'services' | 'waitlist' | 'gallery' | 'reviews' | 'route' | 'admin';

interface NavbarProps {
  currentView?: string;
  onNavigateToBooking?: (serviceName?: string) => void;
  onNavigateToView?: (view: NavView) => void;
  onOpenCheckStatus?: () => void;
  onOpenWaitlist?: () => void;
  onOpenPromo?: () => void;
  onOpenCallModal?: () => void;
  onOpenAdmin?: () => void;
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
  onOpenAdmin,
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

  const navLinks: { name: string; view: NavView; badge?: string }[] = [
    { name: 'Accueil', view: 'home' },
    { name: 'Nos Barbiers (20+ ans)', view: 'barbers', badge: 'Mika & Lusca' },
    { name: 'Tarifs & Services', view: 'services' },
    { name: 'File en Direct', view: 'waitlist', badge: 'Walk-In' },
    { name: 'Portfolio', view: 'gallery' },
    { name: 'Avis Vérifiés', view: 'reviews' },
    { name: 'Itinéraire & Plan', view: 'route' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        
        {/* Brand Logo */}
        <button 
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-3 group bg-transparent border-none p-0 cursor-pointer text-left"
        >
          <img 
            src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
            alt="Final Stop Barber Shop Logo" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-white font-serif font-bold text-sm tracking-wider">
              FINAL STOP
            </span>
            <span className="text-gold font-mono text-[9px] uppercase tracking-[0.2em] font-bold">
              Mika & Lusca &bull; 20+ Ans
            </span>
          </div>
        </button>

        {/* Desktop Menu Links */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          <ul className="flex items-center gap-4 xl:gap-5">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button 
                  type="button"
                  onClick={() => handleLinkClick(link.view)}
                  className={`text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer bg-transparent border-none py-1 relative ${
                    currentView === link.view 
                      ? 'text-gold font-bold' 
                      : 'text-gray-300 hover:text-gold'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-1 text-[9px] font-mono text-gold bg-gold/10 px-1 py-0.2 rounded-xs border border-gold/30">
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

        {/* Clean Top Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCallModal}
            className="text-xs font-medium text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5 px-2.5 py-2 cursor-pointer bg-transparent border-none font-mono"
            title="Ligne directe du salon"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden xl:inline">(619) 886-1267</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToBooking?.()}
            className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Prendre RDV</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToBooking?.()}
            className="sm:hidden bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase px-3 py-1.5 cursor-pointer transition-colors rounded-sm"
          >
            RDV
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
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0A0A0B]/98 backdrop-blur-xl border-b border-white/10 py-5 px-6 shadow-2xl animate-fadeIn">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button 
                  type="button"
                  onClick={() => handleLinkClick(link.view)}
                  className={`w-full text-left block text-sm font-serif font-medium uppercase tracking-wider py-1.5 bg-transparent border-none cursor-pointer ${
                    currentView === link.view ? 'text-gold font-bold' : 'text-gray-200 hover:text-gold'
                  }`}
                >
                  {link.name}
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
                <span>Prendre Rendez-Vous (Garanti)</span>
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
                <span>File d'Attente Walk-In en Direct</span>
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
                <span>Vérifier mon ticket / statut</span>
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
                <span>Ligne directe : (619) 886-1267</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

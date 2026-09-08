import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigateToBooking?: () => void;
  onNavigateToView?: (view: NavView) => void;
  onOpenPolicies?: () => void;
}

export default function Footer({ 
  onNavigateToBooking, 
  onNavigateToView,
  onOpenPolicies
}: FooterProps) {
  return (
    <footer className="bg-[#0A0A0C] pt-20 pb-10 border-t border-white/10 overflow-hidden text-gray-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <img 
                src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
                alt="Final Stop Barber Shop Logo" 
                className="h-12 w-auto object-contain hover:scale-105 transition-all"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-white font-serif font-black tracking-widest text-sm uppercase">
                  FINAL STOP
                </span>
                <span className="text-gold font-mono text-[9px] uppercase tracking-widest font-bold">
                  Hair Artistry & Grooming
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              San Diego's premier unisex destination for precision haircutting, razor fading, and master protective braids. Over 20 years of hands-on mastery by Mika and Lusca in a relaxed vintage lounge.
            </p>
            <button
              type="button"
              onClick={onOpenPolicies}
              className="inline-flex items-center gap-2 text-xs font-mono text-gold hover:text-white border border-gold/40 hover:border-gold px-3.5 py-2 transition-colors bg-gold/10 rounded-xs cursor-pointer font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Safety Rules & Policies</span>
            </button>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-black text-white mb-6">Navigation</h4>
            <ul className="space-y-3 text-xs text-gray-300 uppercase tracking-wider font-medium">
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('home')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('barbers')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-left"
                >
                  Mika & Lusca (Master Barbers)
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('services')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-left"
                >
                  Services & Pricing
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('waitlist')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-left"
                >
                  Live Walk-In Queue
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('gallery')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('reviews')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
                >
                  Client Reviews
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('route')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
                >
                  Directions & Map
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Hours of Operation</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 uppercase tracking-widest font-mono">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Monday - Saturday</span>
                <span className="text-white font-bold">10:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Sunday</span>
                <span className="text-gold font-bold">Closed</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Contact & Location</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 tracking-wider">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  5277 El Cajon Blvd<br />San Diego, CA 92115
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a href="tel:16198861267" className="text-white hover:text-gold transition-colors font-mono font-bold block">
                    +1 (619) 886-1267
                  </a>
                  <a href="tel:16199287084" className="text-gray-300 hover:text-gold transition-colors font-mono font-bold block text-xs">
                    +1 (619) 928-7084
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 min-w-0 pt-1">
                <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <a 
                  href="mailto:contact@finalstopbarbershop.com" 
                  className="hover:text-gold transition-colors break-all text-[11px] leading-relaxed block font-mono"
                >
                  contact@finalstopbarbershop.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-mono">
          <p>
            &copy; {new Date().getFullYear()} Final Stop Barber Shop &bull; All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToView?.('admin');
              }}
              className="hover:text-gold text-gray-400 transition-colors cursor-pointer text-[11px] font-mono flex items-center gap-1"
            >
              <span>Portail Admin</span>
            </a>
            <span className="text-white/20">&bull;</span>
            <button
              type="button"
              onClick={onOpenPolicies}
              className="hover:text-gold text-gray-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px]"
            >
              House Rules & Policies
            </button>
            <span className="text-white/20">&bull;</span>
            <span className="text-gold font-mono tracking-wider text-[11px] font-bold">finalstop.org</span>
            <span className="text-white/20">&bull;</span>
            <a
              href="https://levelup-ecosystem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gold transition-colors text-[10px] tracking-wider group"
            >
              <span className="text-gray-500 lowercase">powered by</span>
              <span className="text-gray-300 font-bold group-hover:text-gold transition-colors">LevelUp</span>
              <ExternalLink className="w-2.5 h-2.5 text-gray-500 group-hover:text-gold transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

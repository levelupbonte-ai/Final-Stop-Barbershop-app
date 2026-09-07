import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, ExternalLink, Lock } from 'lucide-react';

interface FooterProps {
  onNavigateToBooking?: () => void;
  onOpenOwnerControls?: () => void;
  onOpenAdminPortal?: () => void;
}

export default function Footer({ onNavigateToBooking, onOpenOwnerControls, onOpenAdminPortal }: FooterProps) {
  return (
    <footer className="bg-[#0F0F10] pt-20 pb-10 border-t border-white/10 overflow-hidden">
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
                  BARBER SHOP
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
              The standard in men's precision grooming in San Diego. Elevated haircuts, hot lather shaves, and artisanal care in a vintage-modern lounge.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-white/5 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-white/5 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-white/5 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Navigation</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 uppercase tracking-widest">
              <li><a href="#team-pricing" className="hover:text-gold transition-colors">Barbers & Rates</a></li>
              <li><a href="#gallery" className="hover:text-gold transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="hover:text-gold transition-colors">Location & Map</a></li>
              <li><a href="#testimonials" className="hover:text-gold transition-colors">Client Reviews</a></li>
              <li><a href="#faq" className="hover:text-gold transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Hours</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 uppercase tracking-widest">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Monday - Saturday</span>
                <span className="text-white font-mono">10:00 AM - 6:00 PM</span>
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
                  className="hover:text-gold transition-colors break-all text-[11px] leading-relaxed block"
                >
                  contact@finalstopbarbershop.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Final Stop Barber Shop. All rights reserved.
          </p>

          {/* Professional Powered by LevelUp badge */}
          <div>
            <a
              href="https://levelup-ecosystem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#151517] hover:bg-[#1e1e22] border border-white/10 hover:border-gold/50 text-gray-300 hover:text-white transition-all shadow-md group"
            >
              <span className="text-gray-500 font-normal lowercase tracking-wider text-[10px]">powered by</span>
              <span className="text-gold font-black tracking-widest uppercase text-[11px] group-hover:text-gold-light transition-colors">LevelUp</span>
              <ExternalLink className="w-3 h-3 text-gold/80 group-hover:text-gold transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Legal Terms</a>
            <span className="opacity-40">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="opacity-40">|</span>
            {/* Discreet admin lock trigger (unnoticeable to clients) */}
            <button
              type="button"
              onClick={onOpenAdminPortal || onOpenOwnerControls}
              className="opacity-20 hover:opacity-90 text-gray-500 hover:text-gold transition-opacity cursor-pointer p-1"
              title=""
              aria-label="Staff"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

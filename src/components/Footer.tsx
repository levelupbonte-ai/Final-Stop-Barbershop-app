import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, ExternalLink, ShieldCheck, Database, Award } from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigateToBooking?: () => void;
  onNavigateToView?: (view: NavView) => void;
  onOpenOwnerControls?: () => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ 
  onNavigateToBooking, 
  onNavigateToView,
  onOpenOwnerControls,
  onOpenAdmin
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
                  Mika & Lusca &bull; 20+ Ans
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
              La référence du soin et de la coupe masculine à San Diego. Plus de 20 ans d'artisanat par Mika et Lusca dans un lounge vintage-moderne exclusif.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 bg-[#151517] flex items-center justify-center text-gray-400 hover:text-gold transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Navigation</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 uppercase tracking-widest">
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('home')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('barbers')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-left"
                >
                  Mika & Lusca (20+ ans)
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('services')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-left"
                >
                  Tarifs & Services
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('waitlist')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-left"
                >
                  File d'Attente Walk-In
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
                  Avis Clients
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => onNavigateToView?.('route')} 
                  className="hover:text-gold transition-colors bg-transparent border-none p-0 cursor-pointer uppercase"
                >
                  Plan & Itinéraire
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Horaires d'Ouverture</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 uppercase tracking-widest">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Lundi - Samedi</span>
                <span className="text-white font-mono font-bold">10h00 - 18h00</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Dimanche</span>
                <span className="text-gold font-bold">Fermé</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <h5 className="text-[10px] uppercase font-mono tracking-widest text-gold mb-2 font-bold">
                Espace Propriétaire
              </h5>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onOpenOwnerControls}
                  className="text-left text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                  <span>Activer/Désactiver la File Walk-in</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="text-left text-xs text-gold hover:text-gold-light flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0 font-mono"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Base de Données Firestore & Réservations</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Contact & Adresse</h4>
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
            &copy; {new Date().getFullYear()} Final Stop Barber Shop &bull; Mika & Lusca (Plus de 20 ans d'expérience).
          </p>

          <div>
            <a
              href="https://levelup-ecosystem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#151517] hover:bg-[#1e1e22] border border-white/10 hover:border-gold/50 text-gray-300 hover:text-white transition-all shadow-md group"
            >
              <span className="text-gray-500 font-normal lowercase tracking-wider text-[10px]">créé pour l'excellence par</span>
              <span className="text-gold font-black tracking-widest uppercase text-[11px] group-hover:text-gold-light transition-colors">LevelUp</span>
              <ExternalLink className="w-3 h-3 text-gold/80 group-hover:text-gold transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-400/80 font-mono">Connecté Firestore Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

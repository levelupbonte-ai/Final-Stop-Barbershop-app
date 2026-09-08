import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, ExternalLink, ShieldCheck, Lock, Globe } from 'lucide-react';
import { NavView } from './Navbar';
import { getShopRedirectConfig, ShopRedirectConfig, getShopConfig, ShopConfig, DEFAULT_SHOP_CONFIG } from '../lib/firestoreService';

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
  const [redirectConfig, setRedirectConfig] = useState<ShopRedirectConfig | null>(null);
  const [shopConfig, setShopConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);

  useEffect(() => {
    getShopRedirectConfig().then(cfg => {
      if (cfg && cfg.redirectEnabled && cfg.redirectUrl) {
        setRedirectConfig(cfg);
      }
    }).catch(() => {});

    getShopConfig().then(cfg => {
      if (cfg) setShopConfig(cfg);
    }).catch(() => {});

    const handleConfigChange = (e: any) => {
      if (e.detail) {
        setShopConfig(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('shop-config-changed', handleConfigChange);
    return () => window.removeEventListener('shop-config-changed', handleConfigChange);
  }, []);

  const social = shopConfig.socialLinks || {};
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
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              San Diego's premier unisex destination for precision haircutting, razor fading, and master protective braids. Over 20 years of hands-on mastery by Mika and Lusca in a relaxed vintage lounge.
            </p>
            {/* Dynamic Social Icons */}
            <div className="flex items-center gap-2 mb-6">
              {social.instagram && (
                <a 
                  href={social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 hover:bg-gold/20 hover:text-gold border border-white/10 hover:border-gold/40 rounded transition-colors text-gray-300"
                  title="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {social.tiktok && (
                <a 
                  href={social.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 hover:bg-gold/20 hover:text-gold border border-white/10 hover:border-gold/40 rounded transition-colors text-gray-300"
                  title="TikTok"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-mono text-[10px] font-bold">TT</span>
                </a>
              )}
              {social.youtube && (
                <a 
                  href={social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 hover:bg-gold/20 hover:text-gold border border-white/10 hover:border-gold/40 rounded transition-colors text-gray-300"
                  title="YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
              {social.facebook && (
                <a 
                  href={social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 hover:bg-gold/20 hover:text-gold border border-white/10 hover:border-gold/40 rounded transition-colors text-gray-300"
                  title="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {social.twitter && (
                <a 
                  href={social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white/5 hover:bg-gold/20 hover:text-gold border border-white/10 hover:border-gold/40 rounded transition-colors text-gray-300"
                  title="X / Twitter"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onOpenPolicies}
                className="inline-flex items-center gap-2 text-xs font-mono text-gold hover:text-white border border-gold/40 hover:border-gold px-3.5 py-2 transition-colors bg-gold/10 rounded-xs cursor-pointer font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                <span>Safety Rules & Policies</span>
              </button>

              {redirectConfig && (
                <a
                  href={redirectConfig.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-white hover:text-gold border border-white/20 hover:border-gold px-3.5 py-2 transition-colors bg-white/5 hover:bg-gold/10 rounded-xs cursor-pointer font-semibold group"
                >
                  <Globe className="w-3.5 h-3.5 text-gold" />
                  <span>{redirectConfig.redirectLabel || 'Official Link'}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gold" />
                </a>
              )}
            </div>
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
                <span>Weekdays & Sat</span>
                <span className="text-white font-bold">{shopConfig.hoursWeekday || '10:00 AM - 6:00 PM'}</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Sunday</span>
                <span className="text-gold font-bold">{shopConfig.hoursSunday || 'Closed'}</span>
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
                  {shopConfig.address || '5277 El Cajon Blvd, San Diego, CA 92115'}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a href={`tel:${(shopConfig.phone1 || '6198861267').replace(/\D/g, '')}`} className="text-white hover:text-gold transition-colors font-mono font-bold block">
                    {shopConfig.phone1 || '+1 (619) 886-1267'}
                  </a>
                  {shopConfig.phone2 && (
                    <a href={`tel:${shopConfig.phone2.replace(/\D/g, '')}`} className="text-gray-300 hover:text-gold transition-colors font-mono font-bold block text-xs">
                      {shopConfig.phone2}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3 min-w-0 pt-1">
                <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a 
                    href="mailto:appointments@finalstop.org" 
                    className="hover:text-gold transition-colors break-all text-[11px] leading-relaxed block font-mono text-white"
                  >
                    appointments@finalstop.org
                  </a>
                  <a 
                    href="mailto:contact@finalstop.org" 
                    className="hover:text-gold transition-colors break-all text-[11px] leading-relaxed block font-mono text-gray-300"
                  >
                    contact@finalstop.org
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Professional links without bubbles */}
        <div className="pt-8 pb-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 font-mono text-xs text-gray-400">
          <div className="text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} Final Stop Barber Shop</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* 1. House Rules & Policies Real Link */}
            <button
              type="button"
              onClick={onOpenPolicies}
              className="text-gray-300 hover:text-gold transition-colors font-mono uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>House Rules & Policies</span>
            </button>

            <span className="hidden sm:inline text-white/20">&bull;</span>

            {/* 2. Powered By Levelup ecosystem (Clean pro text without arrow) */}
            <a
              href="https://levelup-ecosystem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider no-underline transition-colors"
            >
              <span className="text-white font-medium">Powered By</span>
              <span className="text-[#D4AF37] font-bold hover:text-yellow-400 transition-colors">
                Levelup ecosystem
              </span>
            </a>

            <span className="hidden sm:inline text-white/20">&bull;</span>

            {/* 3. Staff Portal direct link */}
            <button
              type="button"
              onClick={() => onNavigateToView?.('admin')}
              className="text-white/30 hover:text-gold transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
              title="Staff Portal"
              aria-label="Staff Portal"
            >
              <Lock className="w-3 h-3 text-white/40 hover:text-gold transition-colors" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 hover:text-gold transition-colors">Staff</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

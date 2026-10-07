import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { NavView } from './Navbar';
import { useSiteData } from '../lib/site/SiteDataProvider';
import PoweredByLevelUp from './PoweredByLevelUp';

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.92-1.02 4.86 4.86 0 0 1-1.12-3.5z" />
    </svg>
  );
}

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
  const { site, barbers } = useSiteData();
  const { contact, hours } = site;
  const social: Record<string, string | undefined> = site.social;
  return (
    <footer className="bg-[#0A0A0C] pt-20 pb-10 border-t border-white/10 overflow-hidden text-gray-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              {site.branding.logoUrl && (
                <img 
                  src={site.branding.logoUrl} 
                  alt={site.branding.logoAlt} 
                  className="h-12 w-auto object-contain hover:scale-105 transition-all"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex flex-col">
                <span className="text-white font-serif font-black tracking-widest text-sm uppercase">
                  {site.branding.shortName}
                </span>
                {site.branding.tagline && (
                  <span className="text-gold font-mono text-[9px] uppercase tracking-widest font-bold">
                    {site.branding.tagline}
                  </span>
                )}
              </div>
            </div>
            {site.branding.description && (
              <p className="text-xs text-gray-300 leading-relaxed mb-4">{site.branding.description}</p>
            )}
            {/* Dynamic Social Icons (Clean, sleek icons without bubbles) */}
            <div className="flex items-center gap-3.5 mb-6 text-gray-400">
              {social.instagram && (
                <a 
                  href={social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold transition-colors p-1"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.tiktok && (
                <a 
                  href={social.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold transition-colors p-1"
                  title="TikTok"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
              {social.youtube && (
                <a 
                  href={social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold transition-colors p-1"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {social.facebook && (
                <a 
                  href={social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold transition-colors p-1"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a 
                  href={social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold transition-colors p-1"
                  title="X / Twitter"
                >
                  <Twitter className="w-4 h-4" />
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
                  {barbers.map((b) => b.name).join(' & ')} (Master Barbers)
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
              {hours.summary.map((line, i) => (
                <li
                  key={line}
                  className={`pb-2 text-white font-bold ${i < hours.summary.length - 1 ? 'border-b border-white/10' : ''}`}
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.2em] font-black text-white mb-6">Contact & Location</h4>
            <ul className="space-y-3 text-[11px] text-gray-400 tracking-wider">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <a 
                  href={contact.mapsUrl || undefined} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  {contact.address}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  {contact.phones.map((line) => (
                    <div key={line.tel}>
                      <span className="text-[10px] text-gray-400 font-sans block">{line.label}:</span>
                      <a href={`tel:${line.tel}`} className="text-white hover:text-gold transition-colors font-mono font-bold block">
                        {line.display}
                      </a>
                    </div>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 min-w-0 pt-1">
                <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {contact.emails.map((email) => (
                    <a 
                      key={email}
                      href={`mailto:${email}`} 
                      className="hover:text-gold transition-colors break-all text-[11px] leading-relaxed block font-mono text-white"
                    >
                      {email}
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Professional links without bubbles */}
        <div className="pt-8 pb-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 font-mono text-xs text-gray-400">
          <div className="text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} {site.name}</span>
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

            {site.showPoweredBy && (
              <>
                <span className="hidden sm:inline text-white/20">&bull;</span>
                <PoweredByLevelUp domain={site.domain} />
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

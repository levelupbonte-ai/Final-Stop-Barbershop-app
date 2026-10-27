import { Instagram, Facebook, Twitter, Youtube, ArrowUpRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
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
  onNavigateToBooking?: (barberId?: string) => void;
  onNavigateToView?: (view: NavView) => void;
  onSelectBarber?: (barberId: string) => void;
  onOpenPolicies?: () => void;
}

export default function Footer({ 
  onNavigateToBooking, 
  onNavigateToView,
  onSelectBarber,
  onOpenPolicies
}: FooterProps) {
  const { site, barbers } = useSiteData();
  const { contact, hours } = site;
  const social: Record<string, string | undefined> = site.social;

  const mika = barbers.find((b) => b.name.toLowerCase().includes('mika') || b.id.toLowerCase().includes('mika')) ?? barbers[0];
  const lusca = barbers.find((b) => b.id !== mika?.id) ?? barbers[1] ?? barbers[0];

  return (
    <footer className="relative bg-[#0A0A0C] pt-24 pb-10 border-t border-white/10 overflow-hidden text-gray-400 font-sans select-none">
      
      {/* Giant Subtle Background Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden z-0"
      >
        <span
          className="font-sans font-black uppercase tracking-tighter text-white/[0.025] leading-none whitespace-nowrap"
          style={{ fontSize: 'clamp(8rem, 24vw, 24rem)' }}
        >
          FINAL STOP
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Top Centered Callout + Single Big Bold BOOK Button */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center mb-20"
        >
          <h2
            className="font-sans font-black uppercase tracking-tight text-white leading-none mb-8"
            style={{ fontSize: 'clamp(2.75rem, 6.5vw, 4.75rem)' }}
          >
            READY TO{' '}
            <span className="bg-gradient-to-b from-[#E5C98B] via-[#C5A059] to-[#9A7836] bg-clip-text text-transparent">
              BOOK?
            </span>
          </h2>

          {/* Single Big Bold Book Button */}
          <button
            type="button"
            onClick={() => onNavigateToBooking?.()}
            className="btn-gold rounded-full! px-12 sm:px-14 py-5 text-sm sm:text-base font-sans font-black uppercase tracking-[0.16em] shadow-[0_14px_44px_rgba(197,160,89,0.4)] hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <Calendar className="w-5 h-5 text-black shrink-0" />
            <span>Book Appointment Now</span>
            <ArrowUpRight className="w-5 h-5 text-black transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
          </button>

          {/* Sub-Caption */}
          <p className="mt-4 font-sans font-normal text-xs sm:text-sm text-gray-400 tracking-wide">
            Walk-Ins Welcome Daily &middot; $0 Advance Deposit &middot; San Diego, CA
          </p>

          {/* Centered Brand Description */}
          <p className="mt-7 font-sans font-normal text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {site.branding.description ||
              `${site.name} is San Diego's premier unisex barber shop and hair artistry lounge crafted by master artisans ${mika?.name ?? 'Mika'} and ${lusca?.name ?? 'Lusca'} at ${contact.address}.`}
          </p>
        </motion.div>

        {/* 4-Column Directory Grid — Bold Titles, Clean Non-Bold Links */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="pt-14 pb-16 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12"
        >
          
          {/* Column 1: Artisans & Specialties */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white mb-5 tracking-tight">
              Master Artisans
            </h4>
            <ul className="space-y-3 font-sans font-normal text-sm text-gray-400">
              {mika && (
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectBarber ? onSelectBarber(mika.id) : onNavigateToView?.('barbers')}
                    className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                  >
                    {mika.name} &middot; Women &amp; Braids
                  </button>
                </li>
              )}
              {lusca && (
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectBarber ? onSelectBarber(lusca.id) : onNavigateToView?.('barbers')}
                    className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                  >
                    {lusca.name} &middot; Men &amp; Fades
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('services')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Services &amp; Pricing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('waitlist')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Live Walk-In Queue
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white mb-5 tracking-tight">
              Quick Links
            </h4>
            <ul className="space-y-3 font-sans font-normal text-sm text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('home')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('barbers')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Master Barbers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('gallery')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('reviews')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Client Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop & Contact */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white mb-5 tracking-tight">
              Shop &amp; Hours
            </h4>
            <ul className="space-y-3 font-sans font-normal text-sm text-gray-400">
              {hours.summary.slice(0, 2).map((line) => (
                <li key={line} className="text-gray-400 font-normal">
                  {line}
                </li>
              ))}
              {contact.phones.map((line) => (
                <li key={line.tel}>
                  <a
                    href={`tel:${line.tel}`}
                    className="hover:text-white transition-colors block font-normal"
                  >
                    {line.label}: {line.display}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToView?.('route')}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Directions &amp; Map
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Social */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white mb-5 tracking-tight">
              Legal &amp; Info
            </h4>
            <ul className="space-y-3 font-sans font-normal text-sm text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenPolicies}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  House Rules &amp; Policies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPolicies}
                  className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  Safety &amp; Hygiene
                </button>
              </li>
              <li>
                <a
                  href={contact.mapsUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors block font-normal"
                >
                  4748 University Ave, SD
                </a>
              </li>
              <li className="pt-1 flex items-center gap-4 text-gray-400">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
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
                    className="hover:text-gold transition-colors"
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
                    className="hover:text-gold transition-colors"
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
                    className="hover:text-gold transition-colors"
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
                    className="hover:text-gold transition-colors"
                    title="X / Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </li>
            </ul>
          </div>

        </motion.div>

        {/* Bottom 3-Zone Bar: Left Brand | Center Copyright | Right PoweredByLevelUp (Untouched) */}
        <div className="pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 items-center gap-4 font-sans font-normal text-xs sm:text-sm text-gray-500">
          
          {/* Left: Brand Logo / Short Name */}
          <div className="flex items-center justify-center md:justify-start">
            <button
              type="button"
              onClick={() => onNavigateToView?.('home')}
              className="inline-flex items-center gap-2.5 bg-transparent border-none p-0 cursor-pointer group"
            >
              {site.branding.logoUrl && (
                <img
                  src={site.branding.logoUrl}
                  alt={site.branding.logoAlt}
                  className="h-8 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="font-sans font-black text-base tracking-tight text-white group-hover:text-gold transition-colors uppercase">
                {site.branding.shortName || 'FINAL STOP'}
              </span>
            </button>
          </div>

          {/* Center: Copyright */}
          <div className="text-center font-normal text-gray-500">
            <span>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          </div>

          {/* Right: Built by LevelUp Ecosystem (Untouched) */}
          <div className="flex items-center justify-center md:justify-end">
            {site.showPoweredBy && <PoweredByLevelUp domain={site.domain} />}
          </div>

        </div>

      </div>
    </footer>
  );
}

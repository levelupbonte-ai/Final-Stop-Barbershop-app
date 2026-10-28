import { useRef } from 'react';
import { Shield, AlertCircle, Clock, HeartHandshake, X, Scissors } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';
import ScrollIndicator from './ScrollIndicator';

interface ShopPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopPoliciesModal({ isOpen, onClose }: ShopPoliciesModalProps) {
  const { site } = useSiteData();
  const phoneList = site.contact.phones.map((p) => `${p.label}: ${p.display}`).join(' / ');
  const modalBodyRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn font-sans">
      <div 
        ref={modalBodyRef}
        className="card-luxury rounded-[2.5rem]! border border-gold/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_32px_90px_rgba(0,0,0,0.92)] relative text-gray-300 scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#121116]/95 backdrop-blur-xl border-b border-white/10 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/15 border border-gold/40 rounded-full flex items-center justify-center text-gold shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-serif font-bold text-white">
                Salon Safety &amp; House Policies
              </h2>
              <p className="text-[10px] font-sans font-bold text-gold uppercase tracking-[0.2em]">
                {site.name} &middot; {site.contact.address}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-gold text-gray-300 hover:text-black flex items-center justify-center transition-all cursor-pointer border border-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-5 text-xs sm:text-sm leading-relaxed">
          
          {/* Rule 1: Sterilization & Hygiene Standards */}
          <div className="bg-white/[0.025] border border-white/10 p-5 rounded-3xl">
            <div className="flex items-center gap-2.5 text-gold font-serif font-bold text-sm sm:text-base mb-2.5">
              <Shield className="w-4 h-4 shrink-0" />
              <span>1. Hospital-Grade Hygiene &amp; Sterilization</span>
            </div>
            <p className="text-gray-300 mb-3 text-xs sm:text-sm">
              The health and safety of our guests is paramount. We adhere to rigorous California State Board of Barbering &amp; Cosmetology standards:
            </p>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span><strong className="text-white">Single-Use Straight Razor Blades:</strong> Brand-new surgical steel razor blade unwrapped in front of you for every client neck shave and line-up.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span><strong className="text-white">Autoclave &amp; Barbicide Disinfection:</strong> All metal shears, clipper blades, and combs are sanitized between appointments.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span>Freshly laundered cape and sanitary neck strips for every visitor.</span>
              </li>
            </ul>
          </div>

          {/* Rule 2: Scalp Cleanliness & Hair Preparedness */}
          <div className="bg-white/[0.025] border border-white/10 p-5 rounded-3xl">
            <div className="flex items-center gap-2.5 text-gold font-serif font-bold text-sm sm:text-base mb-2.5">
              <Scissors className="w-4 h-4 shrink-0" />
              <span>2. Hair Preparedness &amp; Scalp Health (Braids &amp; Cuts)</span>
            </div>
            <p className="text-gray-300 mb-3 text-xs sm:text-sm">
              To achieve long-lasting, immaculate protective styling and precision cutting:
            </p>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span><strong className="text-white">For Braids &amp; Locs (Mika):</strong> Hair must be freshly washed, fully detangled, and dry (free of heavy glues, heavy grease, or synthetic bonding residue) unless wash add-on was reserved.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Scalp Health:</strong> Clients exhibiting open sores or active contagious scalp conditions cannot be serviced for safety compliance and will be politely rescheduled.</span>
              </li>
            </ul>
          </div>

          {/* Rule 3: Punctuality & 15-Minute Grace Period */}
          <div className="bg-white/[0.025] border border-white/10 p-5 rounded-3xl">
            <div className="flex items-center gap-2.5 text-gold font-serif font-bold text-sm sm:text-base mb-2.5">
              <Clock className="w-4 h-4 shrink-0" />
              <span>3. Punctuality &amp; 15-Minute Grace Period</span>
            </div>
            <p className="text-gray-300 mb-3 text-xs sm:text-sm">
              We respect your time and the schedule of our master artisans:
            </p>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span>Please arrive 5 minutes prior to your scheduled reservation time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>If you are more than <strong className="text-white">15 minutes late</strong> without phone notice, your reserved chair may be released to the next client in our live walk-in queue.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span><strong className="text-white">Free Cancellation:</strong> Please give us at least 2 hours notice via phone ({phoneList}) if you need to reschedule.</span>
              </li>
            </ul>
          </div>

          {/* Rule 4: Children & Family Safety */}
          <div className="bg-white/[0.025] border border-white/10 p-5 rounded-3xl">
            <div className="flex items-center gap-2.5 text-gold font-serif font-bold text-sm sm:text-base mb-2.5">
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>4. Children, Youth &amp; Atmosphere</span>
            </div>
            <p className="text-gray-300 mb-3 text-xs sm:text-sm">
              Final Stop is a family-friendly community salon welcoming women, men, girls, and boys:
            </p>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span>Children under the age of 12 must be accompanied by an adult guardian at all times.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span>For child safety around high-speed clippers and sharp razor blades, children must remain calmly seated during their service.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span>Zero tolerance for harassment, offensive language, or disrespect towards staff and fellow patrons.</span>
              </li>
            </ul>
          </div>

          {/* Rule 5: Payment & Pricing Transparency */}
          <div className="bg-white/[0.025] border border-white/10 p-5 rounded-3xl">
            <div className="flex items-center gap-2.5 text-gold font-serif font-bold text-sm sm:text-base mb-2.5">
              <Shield className="w-4 h-4 shrink-0" />
              <span>5. Transparent Pricing &amp; Payment Terms</span>
            </div>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span><strong className="text-white">No Hidden Fees:</strong> $0 deposit charged online. Full payment is due directly at the shop upon service completion.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span><strong className="text-white">Accepted Methods:</strong> Cash, Visa, Mastercard, American Express, Apple Pay, Google Pay, and Zelle.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Scroll down indicator */}
        <div className="sticky bottom-16 left-0 right-0 z-10">
          <ScrollIndicator containerRef={modalBodyRef} label="Scroll down for more policies" />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#121116]/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            Questions? Call {site.contact.phones.map((p, i) => (
              <span key={p.tel}>{i > 0 ? ' or ' : ''}<a href={`tel:${p.tel}`} className="text-gold font-bold hover:underline">{p.display}</a></span>
            ))}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-gold rounded-full! text-xs px-6 py-2.5"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

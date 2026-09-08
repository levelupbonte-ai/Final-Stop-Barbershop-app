import { Shield, Sparkles, AlertCircle, Clock, HeartHandshake, CheckCircle2, X, Scissors } from 'lucide-react';

interface ShopPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopPoliciesModal({ isOpen, onClose }: ShopPoliciesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#121215] border border-gold/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative text-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#121215]/98 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold/10 border border-gold/40 rounded-xs text-gold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Salon Safety & House Policies
              </h2>
              <p className="text-[11px] font-mono text-gold uppercase tracking-wider">
                Final Stop Barber Shop &bull; 5277 El Cajon Blvd
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs leading-relaxed">
          
          {/* Rule 1: Sterilization & Hygiene Standards */}
          <div className="bg-[#18181D] border border-white/10 p-4 rounded-xs">
            <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>1. Hospital-Grade Hygiene & Sterilization</span>
            </div>
            <p className="text-gray-300 mb-2">
              The health and safety of our guests is paramount. We adhere to rigorous California State Board of Barbering & Cosmetology standards:
            </p>
            <ul className="space-y-1.5 text-gray-400 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Single-Use Straight Razor Blades:</strong> Brand-new surgical steel razor blade unwrapped in front of you for every client neck shave and line-up.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Autoclave & Barbicide Disinfection:</strong> All metal shears, clipper blades, and combs are sanitized between appointments.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Fresh, freshly laundered cape and sanitary neck strips for every visitor.</span>
              </li>
            </ul>
          </div>

          {/* Rule 2: Scalp Cleanliness & Hair Preparedness */}
          <div className="bg-[#18181D] border border-white/10 p-4 rounded-xs">
            <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm mb-2">
              <Scissors className="w-4 h-4 shrink-0" />
              <span>2. Hair Preparedness & Scalp Health (Braids & Cuts)</span>
            </div>
            <p className="text-gray-300 mb-2">
              To achieve long-lasting, immaculate protective styling and precision cutting:
            </p>
            <ul className="space-y-1.5 text-gray-400 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span><strong>For Braids & Locs (Mika):</strong> Hair must be freshly washed, fully detangled, and dry (free of heavy glues, heavy grease, or synthetic bonding residue) unless wash add-on was reserved.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Scalp Health:</strong> Clients exhibiting open sores, active contagious scalp infections (lice, ringworm) cannot be serviced for safety compliance and will be politely rescheduled.</span>
              </li>
            </ul>
          </div>

          {/* Rule 3: Punctuality & 15-Minute Grace Period */}
          <div className="bg-[#18181D] border border-white/10 p-4 rounded-xs">
            <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm mb-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>3. Punctuality & 15-Minute Grace Period</span>
            </div>
            <p className="text-gray-300 mb-2">
              We respect your time and the time of our master barbers:
            </p>
            <ul className="space-y-1.5 text-gray-400 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Please arrive 5 minutes prior to your scheduled reservation time.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>If you are more than <strong>15 minutes late</strong> without phone notice, your reserved chair may be released to the next client in our live walk-in queue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Free Cancellation:</strong> Please give us at least 2 hours notice via phone ((619) 886-1267) if you need to reschedule.</span>
              </li>
            </ul>
          </div>

          {/* Rule 4: Children & Family Safety */}
          <div className="bg-[#18181D] border border-white/10 p-4 rounded-xs">
            <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm mb-2">
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>4. Children, Youth & Atmosphere</span>
            </div>
            <p className="text-gray-300 mb-2">
              Final Stop is a family-friendly community salon welcoming women, men, girls, and boys:
            </p>
            <ul className="space-y-1.5 text-gray-400 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span>Children under the age of 12 must be accompanied by an adult guardian at all times.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span>For child safety around high-speed clippers and sharp razor blades, children must remain calmly seated during their cut.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero tolerance for harassment, offensive language, or disrespect towards staff and fellow patrons.</span>
              </li>
            </ul>
          </div>

          {/* Rule 5: Payment & Pricing Transparency */}
          <div className="bg-[#18181D] border border-white/10 p-4 rounded-xs">
            <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm mb-2">
              <Shield className="w-4 h-4 shrink-0" />
              <span>5. Transparent Pricing & Payment Terms</span>
            </div>
            <ul className="space-y-1.5 text-gray-400 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Hidden Fees:</strong> $0 deposit charged online. Full payment is due directly at the shop upon service satisfaction.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Accepted Methods:</strong> Cash, Visa, Mastercard, American Express, Apple Pay, Google Pay, and Zelle.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#121215] border-t border-white/10 p-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-400">
            Questions? Call <a href="tel:16198861267" className="text-gold font-bold hover:underline">(619) 886-1267</a>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-xs cursor-pointer transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

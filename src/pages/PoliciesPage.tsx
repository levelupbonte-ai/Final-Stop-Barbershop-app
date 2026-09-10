import { 
  Shield, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  HeartHandshake, 
  CheckCircle2, 
  Scissors, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  Calendar, 
  CreditCard,
  Building2
} from 'lucide-react';

interface PoliciesPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
}

export default function PoliciesPage({ onBackToHome, onNavigateToBooking }: PoliciesPageProps) {
  return (
    <div className="min-h-screen bg-[#0E0E11] text-gray-200 pb-20 selection:bg-gold selection:text-black">
      {/* Top Breadcrumb & Navigation - Fixed/Sticky atop scrolling content */}
      <div className="bg-[#0A0A0B]/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gold transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href="tel:16198861267"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-gold hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>(619) 886-1267</span>
            </a>
            <button
              type="button"
              onClick={onNavigateToBooking}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xs shadow transition-all cursor-pointer"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative py-16 sm:py-20 px-4 text-center border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#232018] via-[#121216] to-[#0E0E11]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/40 text-gold text-xs font-mono uppercase tracking-widest rounded-xs mb-4">
            <Shield className="w-4 h-4" />
            <span>Salon Code of Practice &bull; 4748 University Ave</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
            Safety Rules & Salon Policies
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Our commitment to medical-grade hygiene, scalp wellness, punctual service, and family-friendly hospitality for women, men, girls, and boys in San Diego.
          </p>
        </div>
      </div>

      {/* Main Body Policies */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-10">

        {/* Section 1: Hospital-Grade Hygiene & Sterilization */}
        <div className="bg-[#141418] border border-white/10 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gold/10 border border-gold/40 text-gold rounded-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-gold uppercase tracking-wider block font-bold">Standard 01</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Hospital-Grade Hygiene & Sterilization
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-5 leading-relaxed">
            At Final Stop, we maintain strict compliance with the California State Board of Barbering and Cosmetology health protocols:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-gold font-bold mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Single-Use Surgical Razor Blades</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                A brand new, sterile straight razor blade is freshly unwrapped from its sealed blister pack in full view of the client for every single neck trim and line-up. Blades are discarded immediately into dedicated biohazard sharps disposal.
              </p>
            </div>

            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-gold font-bold mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Autoclave & Barbicide Disinfection</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                All metal shears, clipper attachments, and styling combs are immersed in hospital-grade EPA-registered disinfectant (Barbicide) and sanitized thoroughly between every single patron.
              </p>
            </div>

            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-gold font-bold mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fresh Capes & Sanitary Neck Strips</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Disposable sanitary neck strips are applied to every guest to ensure salon capes never make direct skin contact with the neck.
              </p>
            </div>

            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-gold font-bold mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Clean Air & Sanitized Chairs</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Barber chairs, armrests, and headrests are wiped down with medical-grade antiseptic surface sprays after every service.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Hair Preparation & Scalp Health */}
        <div className="bg-[#141418] border border-white/10 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gold/10 border border-gold/40 text-gold rounded-xs shrink-0">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-gold uppercase tracking-wider block font-bold">Standard 02</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Hair Preparedness & Scalp Health Guidelines
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-5 leading-relaxed">
            To ensure optimal results, preserve follicle health, and respect time allocations:
          </p>

          <div className="space-y-3 text-xs">
            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-1">For Braids, Locs & Protective Styles (Mika) :</strong>
                <p className="text-gray-400 leading-relaxed">
                  Hair must arrive freshly washed, thoroughly detangled from roots to ends, and fully dry. Please ensure your hair is free of heavy bonding glues, synthetic wax residues, or heavy petroleum grease. (If you prefer an in-salon wash and blow-dry, please select the wash add-on when booking).
                </p>
              </div>
            </div>

            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-1">Active Scalp Conditions :</strong>
                <p className="text-gray-400 leading-relaxed">
                  For your safety and in compliance with public health regulations, we cannot perform services on clients presenting open scalp lesions, active fungal infections (ringworm), or head lice. If an active condition is identified, the appointment will be respectfully postponed until fully healed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Punctuality, Grace Period & Cancellations */}
        <div className="bg-[#141418] border border-white/10 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gold/10 border border-gold/40 text-gold rounded-xs shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-gold uppercase tracking-wider block font-bold">Standard 03</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Punctuality & 15-Minute Grace Period
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
            <p>
              We pride ourselves on honoring our guests’ valuable schedules:
            </p>

            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Arrival Time :</strong> Please arrive 5 minutes before your scheduled appointment time to check in and relax in our lounge.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>15-Minute Grace Window :</strong> If you are delayed by more than 15 minutes without phone notice, your chair reservation may be offered to waiting clients on our live walk-in desk to keep the schedule on track.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span><strong>Free Cancellation & Rescheduling :</strong> We understand emergencies happen. We ask for a simple 2-hour notice by calling Mika at <a href="tel:16199287084" className="text-gold underline font-bold">(619) 928-7084</a> or Lusca at <a href="tel:16198861267" className="text-gold underline font-bold">(619) 886-1267</a> so we can open the chair to another guest.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4: Children, Youth & Atmosphere */}
        <div className="bg-[#141418] border border-white/10 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gold/10 border border-gold/40 text-gold rounded-xs shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-gold uppercase tracking-wider block font-bold">Standard 04</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Family Hospitality & Respectful Environment
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            Final Stop is a welcoming community salon where women, men, boys, and girls can feel at home:
          </p>

          <div className="space-y-3 text-xs text-gray-400">
            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs">
              <strong className="text-white block mb-1">Children Under 12 Supervision :</strong>
              <p>For their safety in an environment equipped with high-speed professional clippers, scissors, and straight razors, children must be accompanied by an adult guardian at all times and remain seated calmly during their haircut.</p>
            </div>

            <div className="bg-[#191920] border border-white/5 p-4 rounded-xs">
              <strong className="text-white block mb-1">Zero-Tolerance Harassment Policy :</strong>
              <p>We maintain a positive, respectful space for everyone. Hostile language, disrespect towards staff or other clients will result in service denial.</p>
            </div>
          </div>
        </div>

        {/* Section 5: Transparent Pricing & Payment Terms */}
        <div className="bg-[#141418] border border-white/10 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gold/10 border border-gold/40 text-gold rounded-xs shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-gold uppercase tracking-wider block font-bold">Standard 05</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Transparent Pricing & $0 Online Deposit
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-gold/5 border border-gold/30 p-4 rounded-xs">
              <div className="flex items-center gap-2 text-gold font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Hidden Fees & $0 Online Deposit</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                You will never be charged a mandatory deposit online. Your full payment is only due directly in person at the shop after your service is completed to your complete satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#191920] border border-white/5 p-3.5 rounded-xs">
                <strong className="text-white block mb-1 font-mono text-[11px]">ACCEPTED PAYMENT METHODS</strong>
                <p className="text-gray-400">Cash (preferred), Visa, MasterCard, American Express, Apple Pay, Google Pay, and Zelle.</p>
              </div>

              <div className="bg-[#191920] border border-white/5 p-3.5 rounded-xs">
                <strong className="text-white block mb-1 font-mono text-[11px]">CONSULTATIONS</strong>
                <p className="text-gray-400">Free 5-minute consultation included with every hair and beard styling service.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Quick Contact Card */}
        <div className="bg-gradient-to-r from-[#18181D] to-[#141418] border border-gold/30 p-6 sm:p-8 rounded-sm text-center">
          <Building2 className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-white mb-1">
            Final Stop Barber Shop & Salon
          </h3>
          <div className="text-xs font-mono text-gray-400 mb-5 flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
            <a
              href="https://maps.app.goo.gl/tUej1WdvZRudfqVX6"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors underline-offset-2 hover:underline"
            >
              4748 University Ave, San Diego, CA 92105
            </a>
            <span>&bull; Mon–Sat 10:00 AM – 6:00 PM</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:16199287084"
              className="w-full sm:w-auto bg-[#202026] hover:bg-gold hover:text-black text-white border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span>Call Mika: (619) 928-7084</span>
            </a>

            <a
              href="tel:16198861267"
              className="w-full sm:w-auto bg-[#202026] hover:bg-gold hover:text-black text-white border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span>Call Lusca: (619) 886-1267</span>
            </a>

            <button
              type="button"
              onClick={onNavigateToBooking}
              className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

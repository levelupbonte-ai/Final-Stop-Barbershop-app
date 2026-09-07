import { useState } from 'react';
import { Scissors, Clock, Award, Receipt, ChevronRight } from 'lucide-react';
import MobilePricingModal, { ALL_SERVICES } from './MobilePricingModal';

interface TeamAndPricingProps {
  onNavigateToBooking?: (serviceName?: string) => void;
}

// 2 Barbers only, with stylized avatars (no photos)
const BARBERS = [
  {
    id: 'mika',
    name: 'Mika',
    role: 'Lead Master Barber & Founder',
    experience: '12 Years in the Craft',
    specialty: 'Specialized in surgical skin fades, razor-sharp straight razor lineups, textured crops, and signature beard detailing.',
    initials: 'MK',
    badge: 'Master Fade & Razor',
    tags: ['Skin Fade', 'Straight Razor', 'Precision Styling']
  },
  {
    id: 'luska',
    name: 'Luska',
    role: 'Artisan Barber & Traditional Grooming',
    experience: '8 Years in the Craft',
    specialty: 'Expert in bespoke beard sculpting, traditional eucalyptus hot towel steam rituals, and restorative hair treatments.',
    initials: 'LK',
    badge: 'Artisan Beard & Spa',
    tags: ['Beard Sculpting', 'Hot Towel Steam', 'Relaxation Care']
  }
];

const PRICING_LIST = [
  {
    name: 'Skin Fade & Precision Haircut',
    price: '$35',
    duration: '35 min',
    desc: 'Zero razor fade tailored to head shape, razor line-up, texture styling, and neck shave.'
  },
  {
    name: 'Beard Sculpting & Hot Lather Shave',
    price: '$25',
    duration: '30 min',
    desc: 'Millimeter beard trim, straight razor contouring, hot eucalyptus towel, and hydrating balm.'
  },
  {
    name: 'The Signature Master Combo: Cut + Beard',
    price: '$55',
    duration: '60 min',
    desc: 'The complete grooming experience: customized haircut, complete beard sculpting, and dual hot towel service.'
  },
  {
    name: 'Custom Braids & Cornrows',
    price: '$65+',
    duration: '60-90 min',
    desc: 'Clean geometric patterns, ultra-crisp parting, durable lock hold, and scalp hydration treatment.'
  },
  {
    name: 'Dreadlocks & Full Retwist',
    price: '$75+',
    duration: '90 min',
    desc: 'Deep scalp cleanse, organic loc retwist, root maintenance, and essential oil misting.'
  },
  {
    name: 'VIP Prestige Grooming Experience',
    price: '$90',
    duration: '90 min',
    desc: 'Purifying face treatment, steam bath, premium haircut, complete beard care, and scalp massage.'
  },
];

export default function TeamAndPricing({ onNavigateToBooking }: TeamAndPricingProps) {
  const [isMobilePricingOpen, setIsMobilePricingOpen] = useState(false);

  return (
    <section id="team-pricing" className="py-20 bg-[#0E0E10] relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Craftsmanship & Mastery
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Our Barbers & Their Specialties
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Excellence at Final Stop Barber Shop is driven by two dedicated master craftsmen committed to precision, comfort, and unmatched consistency.
          </p>
        </div>

        {/* 2 Barbers Cards with Stylized Vector Avatars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {BARBERS.map((barber) => (
            <div 
              key={barber.id}
              className="bg-[#151517] border border-white/10 hover:border-gold/50 transition-all duration-300 p-7 flex flex-col justify-between shadow-2xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

              <div>
                {/* Stylized Vector Avatar & Info */}
                <div className="flex items-center gap-5 mb-5">
                  <div className="relative shrink-0">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#202024] to-[#0A0A0B] border-2 border-gold/40 group-hover:border-gold flex flex-col items-center justify-center shadow-lg transition-colors">
                      <span className="text-xl sm:text-2xl font-serif font-black text-gold tracking-wider">
                        {barber.initials}
                      </span>
                      <Scissors className="w-3.5 h-3.5 text-gold/70 mt-0.5" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-black border border-gold/50 rounded-full p-1 text-gold">
                      <Award className="w-3 h-3" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-gold font-medium mt-0.5">
                      {barber.role}
                    </p>
                    <span className="text-xs text-gray-400 block mt-1">
                      {barber.experience} &bull; {barber.badge}
                    </span>
                  </div>
                </div>

                {/* Specialty Description */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-5">
                  {barber.specialty}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                {barber.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-[11px] font-medium tracking-wide bg-white/5 text-gray-300 px-2.5 py-1 border border-white/10 rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing & Services List */}
        <div className="bg-[#151517] border border-white/10 p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
            <div>
              <span className="text-gold text-[10px] uppercase font-mono tracking-widest font-bold block mb-1">
                Transparent Pricing
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                Services & Rates
              </h3>
            </div>
            <div className="text-xs text-gray-400 font-mono bg-[#0A0A0B] px-3 py-1.5 border border-white/10 inline-block self-start sm:self-auto">
              Pay in shop &bull; No advance fee
            </div>
          </div>

          {/* Desktop: Full 2-column Grid */}
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {PRICING_LIST.map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#0A0A0B] p-5 border border-white/10 hover:border-gold/40 transition-colors flex justify-between items-start"
              >
                <div className="pr-4">
                  <h4 className="text-base font-bold text-white mb-1.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {item.desc}
                  </p>
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>{item.duration}</span>
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-bold text-gold font-sans">
                    {item.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Top Signature Previews + "Voir plus" Dedicated Interface Button */}
          <div className="block md:hidden space-y-3">
            {PRICING_LIST.slice(0, 2).map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#0A0A0B] p-4 border border-white/10 flex justify-between items-start shadow-md"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-base font-bold text-gold font-sans shrink-0">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">
                    {item.desc}
                  </p>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>{item.duration}</span>
                  </span>
                </div>
              </div>
            ))}

            {/* Professional English Menu Expansion Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMobilePricingOpen(true)}
                className="w-full bg-[#18181C] hover:bg-gold hover:text-black text-gold border border-gold/40 text-xs font-semibold uppercase tracking-wider py-3.5 px-4 flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer group"
              >
                <Receipt className="w-4 h-4 text-gold group-hover:text-black transition-colors" />
                <span>View Full Service & Price Menu ({ALL_SERVICES.length})</span>
                <ChevronRight className="w-4 h-4 text-gold group-hover:text-black transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Dedicated Mobile Pricing & Services Modal */}
      <MobilePricingModal 
        isOpen={isMobilePricingOpen}
        onClose={() => setIsMobilePricingOpen(false)}
        onNavigateToBooking={onNavigateToBooking}
      />
    </section>
  );
}

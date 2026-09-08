import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  Clock, 
  Phone, 
  Scissors, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import CallShopModal from '../components/CallShopModal';

interface ServicesPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (serviceId?: string) => void;
  onNavigateToBarbers: () => void;
}

export const COMPLETE_SERVICES = [
  {
    id: 'fade',
    name: 'Skin Fade & Precision Haircut',
    price: '$35',
    duration: '35 min',
    badge: 'Most Popular',
    description: 'Customized millimeter zero fade tailored to your cranial architecture, finished with a straight razor line-up and soothing talc.',
    inclusions: [
      'Facial morphology and head shape consultation',
      'American skin fade (Low, Mid, High, or Taper Fade)',
      'Straight razor contouring & foil shaver finish',
      'Blow dry, matte clay or texture styling'
    ]
  },
  {
    id: 'barbe',
    name: 'Beard Sculpting & Traditional Hot Shave',
    price: '$25',
    duration: '30 min',
    badge: 'Pure Craft',
    description: 'Architectural beard shaping, dual eucalyptus steam hot towel treatment, and straight razor neck shave with rich warm lather.',
    inclusions: [
      'Beard sculpting and scissor debulking',
      'Dual eucalyptus steam hot towel ritual',
      'Cheek and neck lines cut with traditional straight razor',
      'Conditioning beard oil and rich moisturizing balm massage'
    ]
  },
  {
    id: 'combo',
    name: 'The Signature Master Combo: Cut + Beard',
    price: '$55',
    duration: '60 min',
    badge: 'Best Experience',
    description: 'The complete Final Stop experience. Your precision haircut paired with a full beard sculpting ritual by our 20+ year master craftsmen.',
    inclusions: [
      'Tailored haircut & zero skin fade of choice',
      'Complete beard sculpting & fade transition',
      'Dual hot towel eucalyptus steam ritual',
      'Straight razor detailing, cold toner splash & styling'
    ]
  },
  {
    id: 'braids',
    name: 'Custom Braids, Knotless & Cornrows',
    price: '$65+',
    duration: '60-90 min',
    badge: 'Mika Specialty (20+ Yrs)',
    description: 'Crisp geometric partings, knotless box braids, goddess locs, and protective styles designed to preserve hair health.',
    inclusions: [
      'Ultra-clean geometric parting with tail comb',
      'Consistent, gentle scalp-safe tension braiding',
      'Organic edge control application for long-lasting hold',
      'Setting mousse and scalp hydration mist'
    ]
  },
  {
    id: 'dreads',
    name: 'Dreadlocks & Full Retwist',
    price: '$75+',
    duration: '90 min',
    badge: 'Texture & Locs',
    description: 'Deep residue-free cleansing, neat palm-rolling retwist with botanical gels and restorative oils for healthy dreadlocks.',
    inclusions: [
      'Purifying loc shampoo (removes buildup and debris)',
      'Meticulous root-by-root palm-rolling retwist',
      'Warm hooded dryer set for enduring lock structure',
      'Pure argan and castor oil mist for natural shine'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Prestige Experience: Facial, Cut & Beard',
    price: '$90',
    duration: '90 min',
    badge: 'Ultimate Privilege',
    description: 'The gentleman\'s total restoration. Purifying facial mask, steam bath, haute coiffure haircut, beard ritual, and tension-relief scalp massage.',
    inclusions: [
      'Facial cleanse & purifying steam exfoliation',
      'Detox mask with pore-tightening cold towel wrap',
      'Full precision haircut & hot lather straight razor shave',
      'Relaxing neck, shoulder and scalp tension massage'
    ]
  }
];

export default function ServicesPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: ServicesPageProps) {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBarbers}
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-sm cursor-pointer bg-transparent"
            >
              <span>View Mika & Lusca (20+ Yrs)</span>
              <ChevronRight className="w-3.5 h-3.5 text-gold" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Transparent Pricing & Complete Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Master Haircuts, Fades & Protective Braids
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Honest rates with zero hidden fees. Master braider Mika (knotless braids & locs for women & girls) and master barber Lusca (precision fades & beard architecture for men & boys) with over two decades of craftsmanship.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {COMPLETE_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-[#141418] border border-white/10 hover:border-gold/60 transition-all p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative group rounded-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {service.badge && (
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-2.5 py-0.5 mb-2">
                        {service.badge}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                      {service.name}
                    </h2>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-gold block">
                      {service.price}
                    </span>
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{service.duration}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Inclusions List */}
                <div className="space-y-2.5 mb-6 pt-4 border-t border-white/5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-gold font-bold block mb-2">
                    Included in this service:
                  </span>
                  {service.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book CTA */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">
                  Pay at shop &bull; No advance fee
                </span>

                <button
                  type="button"
                  onClick={() => onNavigateToBooking(service.id)}
                  className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
                >
                  Select Service &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}

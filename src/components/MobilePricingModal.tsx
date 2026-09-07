import React from 'react';
import { X, Clock, Scissors, Calendar, Sparkles, Check } from 'lucide-react';

export interface ServiceItem {
  name: string;
  price: string;
  duration: string;
  desc: string;
  category: string;
  featured?: boolean;
}

export const ALL_SERVICES: ServiceItem[] = [
  {
    name: 'Skin Fade & Precision Haircut',
    price: '$35',
    duration: '35 min',
    desc: 'Zero razor fade tailored to head shape, razor line-up, texture styling, and neck shave.',
    category: 'Haircuts',
    featured: true
  },
  {
    name: 'Beard Sculpting & Hot Lather Shave',
    price: '$25',
    duration: '30 min',
    desc: 'Millimeter beard trim, straight razor contouring, hot eucalyptus towel, and hydrating balm.',
    category: 'Beard Care'
  },
  {
    name: 'The Signature Master Combo: Cut + Beard',
    price: '$55',
    duration: '60 min',
    desc: 'The complete grooming experience: customized haircut, complete beard sculpting, and dual hot towel service.',
    category: 'Combos',
    featured: true
  },
  {
    name: 'Custom Braids & Cornrows',
    price: '$65+',
    duration: '60-90 min',
    desc: 'Clean geometric patterns, ultra-crisp parting, durable lock hold, and scalp hydration treatment.',
    category: 'Braids & Locs'
  },
  {
    name: 'Dreadlocks & Full Retwist',
    price: '$75+',
    duration: '90 min',
    desc: 'Deep scalp cleanse, organic loc retwist, root maintenance, and essential oil misting.',
    category: 'Braids & Locs'
  },
  {
    name: 'VIP Prestige Grooming Experience',
    price: '$90',
    duration: '90 min',
    desc: 'Purifying face treatment, steam bath, premium haircut, complete beard care, and scalp massage.',
    category: 'VIP Packages'
  },
  {
    name: 'Kids & Teens Precision Cut (Under 16)',
    price: '$28',
    duration: '30 min',
    desc: 'Patient and stylish haircut with clean edges and scissor or clipper work.',
    category: 'Haircuts'
  },
  {
    name: 'Lineup & Edge Restoration (Clipper & Razor)',
    price: '$18',
    duration: '15 min',
    desc: 'Quick hairline sharp touch-up, forehead line-up, and neck taper clean.',
    category: 'Haircuts'
  }
];

interface MobilePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: (selectedServiceName?: string) => void;
}

export default function MobilePricingModal({
  isOpen,
  onClose,
  onNavigateToBooking
}: MobilePricingModalProps) {
  if (!isOpen) return null;

  const filteredServices = ALL_SERVICES;

  const handleSelectService = (serviceName: string) => {
    onClose();
    if (onNavigateToBooking) {
      onNavigateToBooking(serviceName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#121215] shrink-0">
        <div>
          <span className="text-[10px] font-mono text-gold uppercase tracking-widest block font-bold">
            Transparent Rates
          </span>
          <h2 className="text-lg font-serif font-bold text-white">
            Services & Pricing Menu
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gold transition-colors bg-transparent border-none outline-none cursor-pointer"
          aria-label="Close pricing"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Services List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        <div className="text-[11px] text-gray-400 font-mono bg-[#16161A] p-3 border border-white/5 flex items-center justify-between mb-2">
          <span>Pay in shop upon service completion</span>
          <span className="text-gold font-bold">No booking fees</span>
        </div>

        {filteredServices.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#151517] border border-white/10 p-4 rounded-sm flex flex-col justify-between shadow-lg group hover:border-gold/30 transition-colors"
          >
            <div>
              {/* Service Header Row with Badge and Price - never overlaps title */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  {item.featured && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-gold/15 border border-gold/40 text-gold px-2 py-0.5 rounded-sm">
                      Popular
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-gold font-sans">
                  {item.price}
                </span>
              </div>

              {/* Service Title */}
              <h3 className="text-base font-semibold text-white mb-1.5 leading-snug">
                {item.name}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {item.desc}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span>{item.duration}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleSelectService(item.name)}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider py-2.5 px-4 flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book This Service</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="p-4 bg-[#121215] border-t border-white/10 shrink-0 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onNavigateToBooking) onNavigateToBooking();
          }}
          className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3.5 flex items-center justify-center gap-2 font-mono shadow-xl cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Go to Booking Calendar</span>
        </button>
      </div>
    </div>
  );
}

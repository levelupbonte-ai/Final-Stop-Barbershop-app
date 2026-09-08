import React, { useState } from 'react';
import { X, Clock, Scissors, Calendar, Sparkles, Check, Search } from 'lucide-react';
import { OFFICIAL_SERVICES, ServiceItem } from '../data/services';

export const ALL_SERVICES = OFFICIAL_SERVICES.map(s => ({
  name: s.name,
  price: s.price,
  duration: s.duration,
  desc: s.description,
  category: s.category,
  featured: s.featured,
  id: s.id
}));

interface MobilePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: (selectedServiceName?: string) => void;
}

const CATEGORIES = ['All', 'Haircuts', 'Combos', 'Beard & Shave', 'Lineups & Detailing', 'Treatments'] as const;

export default function MobilePricingModal({
  isOpen,
  onClose,
  onNavigateToBooking
}: MobilePricingModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredServices = ALL_SERVICES.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            Verified Shop Pricing
          </span>
          <h2 className="text-lg font-serif font-bold text-white">
            Services & Price Menu ({OFFICIAL_SERVICES.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gold transition-colors bg-transparent border-none outline-none cursor-pointer"
          aria-label="Close pricing"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="p-3 bg-[#0E0E11] border-b border-white/10 space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181D] border border-white/10 focus:border-gold pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 rounded-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-gold text-black font-bold'
                    : 'bg-[#18181D] text-gray-400 border border-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        <div className="text-[11px] text-gray-400 font-mono bg-[#16161A] p-3 border border-white/5 flex items-center justify-between mb-2">
          <span>Pay at counter &bull; Cash, Card, Zelle</span>
          <span className="text-gold font-bold">No deposit needed</span>
        </div>

        {filteredServices.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#151517] border border-white/10 p-4 rounded-sm flex flex-col justify-between shadow-lg group hover:border-gold/30 transition-colors"
          >
            <div>
              {/* Service Header Row with Badge and Price */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  {item.featured && (
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-gold/15 border border-gold/40 text-gold px-2 py-0.5 rounded-sm">
                      Popular
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mt-0.5">
                    {item.category}
                  </span>
                </div>
                <span className="text-xl font-bold text-gold font-sans">
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
                onClick={() => handleSelectService(item.id)}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider py-2.5 px-4 flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all rounded-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book This Service &rarr;</span>
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
          className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3.5 flex items-center justify-center gap-2 font-mono shadow-xl cursor-pointer rounded-sm"
        >
          <Calendar className="w-4 h-4" />
          <span>Go to Booking Calendar</span>
        </button>
      </div>
    </div>
  );
}

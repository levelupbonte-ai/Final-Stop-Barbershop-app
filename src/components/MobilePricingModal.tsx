import { useState, useMemo, useEffect } from 'react';
import { X, Clock, Calendar, Search } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getServiceSpecialist
} from '../lib/site/specialist';

interface MobilePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: (selectedServiceId?: string, barberId?: string) => void;
  initialSpecialist?: SpecialistKey;
}

export default function MobilePricingModal({
  isOpen,
  onClose,
  onNavigateToBooking,
  initialSpecialist = 'lusca'
}: MobilePricingModalProps) {
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>(initialSpecialist);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { services, barbers } = useSiteData();

  useEffect(() => {
    setActiveSpecialist(initialSpecialist);
    setSelectedCategory('All');
  }, [initialSpecialist, isOpen]);

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];
  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  const specialistServices = useMemo(() => {
    const list = services.filter((s) => getServiceSpecialist(s) === activeSpecialist);
    return (list.length > 0 ? list : services).map((s) => ({
      name: s.name,
      price: s.price,
      duration: s.duration,
      desc: s.description,
      category: s.category,
      featured: s.featured,
      id: s.id
    }));
  }, [services, activeSpecialist]);

  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(specialistServices.map((s) => s.category)))],
    [specialistServices]
  );

  if (!isOpen) return null;

  const filteredServices = specialistServices.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectService = (serviceId: string) => {
    onClose();
    if (onNavigateToBooking) {
      onNavigateToBooking(serviceId, activeBarberProfile?.id ?? activeSpecialist);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#121215] shrink-0">
        <div>
          <span className="text-[10px] font-mono text-gold uppercase tracking-widest block font-bold">
            {activeUniverseMeta.craftBadge}
          </span>
          <h2 className="text-lg font-serif font-bold text-white">
            {activeUniverseMeta.name} &middot; {activeUniverseMeta.universeTitle} ({specialistServices.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-gold transition-colors border border-white/10 cursor-pointer"
          aria-label="Close pricing"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Specialist Switcher + Search & Category Filter Bar */}
      <div className="p-3.5 bg-[#0E0E11] border-b border-white/10 space-y-3 shrink-0">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#16161B] border border-white/10">
          {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
            const meta = SPECIALIST_UNIVERSES[specKey];
            const isSelected = activeSpecialist === specKey;
            return (
              <button
                key={specKey}
                type="button"
                onClick={() => {
                  setActiveSpecialist(specKey);
                  setSelectedCategory('All');
                }}
                className={`py-2 px-3 rounded-full text-[11px] font-sans font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gold text-black shadow-md'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                {meta.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeUniverseMeta.name}'s services...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181D] border border-white/10 focus:border-gold pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 rounded-full outline-none"
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
                className={`text-[11px] font-sans font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-gold text-black font-bold'
                    : 'bg-[#18181D] text-gray-400 border border-white/10'
                }`}
              >
                {cat === 'All' ? `All ${activeUniverseMeta.name}` : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-24">
        <div className="text-[11px] text-gray-400 font-mono bg-[#16161A] px-4 py-3 rounded-2xl border border-white/5 flex items-center justify-between mb-2">
          <span>Pay at counter &bull; Cash, Card, Zelle</span>
          <span className="text-gold font-bold">$0 Deposit</span>
        </div>

        {filteredServices.map((item) => (
          <div
            key={item.id}
            className="bg-[#151517] border border-white/10 p-5 rounded-[1.75rem] flex flex-col justify-between shadow-lg group hover:border-gold/30 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  {item.featured && (
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-gold/15 border border-gold/40 text-gold px-2.5 py-0.5 rounded-full">
                      Signature
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mt-0.5">
                    {item.category}
                  </span>
                </div>
                <span className="text-xl font-serif font-bold text-gold">{item.price}</span>
              </div>

              <h3 className="text-base font-serif font-bold text-white mb-1.5 leading-snug">
                {item.name}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed mb-3">{item.desc}</p>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span>{item.duration}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleSelectService(item.id)}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all rounded-full"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book with {activeUniverseMeta.name} &rarr;</span>
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
            if (onNavigateToBooking) {
              onNavigateToBooking(undefined, activeBarberProfile?.id ?? activeSpecialist);
            }
          }}
          className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3.5 flex items-center justify-center gap-2 font-mono shadow-xl cursor-pointer rounded-full"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment with {activeUniverseMeta.name}</span>
        </button>
      </div>
    </div>
  );
}

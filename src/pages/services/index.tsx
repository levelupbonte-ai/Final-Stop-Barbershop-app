import { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Scissors,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getGalleryItemSpecialist,
  getServiceSpecialist
} from '../../lib/site/specialist';

interface ServicesPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (serviceId?: string, barberId?: string) => void;
  onNavigateToBarbers: () => void;
}

export default function ServicesPage({
  onNavigateToBooking
}: ServicesPageProps) {
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>('lusca');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { services: OFFICIAL_SERVICES, gallery, barbers, site } = useSiteData();

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];
  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  // Filter services strictly for the active specialist
  const specialistServices = useMemo(() => {
    const list = OFFICIAL_SERVICES.filter((s) => getServiceSpecialist(s) === activeSpecialist);
    return list.length > 0 ? list : OFFICIAL_SERVICES;
  }, [OFFICIAL_SERVICES, activeSpecialist]);

  // Filter showcase models strictly for the active specialist
  const showcaseImages = useMemo(() => {
    const list = gallery.filter((g) => getGalleryItemSpecialist(g) === activeSpecialist);
    return (list.length > 0 ? list : gallery).slice(0, 3);
  }, [gallery, activeSpecialist]);

  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(specialistServices.map((s) => s.category)))],
    [specialistServices]
  );

  useEffect(() => {
    setSelectedCategory('All');
  }, [activeSpecialist]);

  const filteredServices = specialistServices.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-28 sm:pt-36 pb-16 w-full font-sans">
      {/* Editorial Title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <span className="inline-flex items-center gap-2 text-gold font-mono text-[11px] uppercase tracking-[0.25em] font-bold mb-3">
          <span>{activeUniverseMeta.craftBadge} &middot; Handcrafted Artistry</span>
        </span>
        <h1
          className="font-serif italic text-white leading-[1.02] mb-4"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
        >
          {activeUniverseMeta.name} &mdash;{' '}
          <span className="not-italic font-sans font-black uppercase text-gold">
            {activeUniverseMeta.universeTitle}
          </span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          {activeUniverseMeta.description} Zero advance deposit at {site.contact.address}—pay in shop after your finish.
        </p>
      </motion.div>

      {/* Two-Universe Specialist Switcher (Lusca Men vs Mika Women/Braids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
          const meta = SPECIALIST_UNIVERSES[specKey];
          const profile = getBarberForSpecialist(barbers, specKey);
          const isSelected = activeSpecialist === specKey;
          const count = OFFICIAL_SERVICES.filter((s) => getServiceSpecialist(s) === specKey).length;

          return (
            <button
              key={specKey}
              type="button"
              onClick={() => setActiveSpecialist(specKey)}
              className={`text-left p-6 rounded-[2.25rem] border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-gold/[0.16] via-[#15141A] to-[#0C0C10] border-gold shadow-[0_20px_50px_rgba(197,160,89,0.22)]'
                  : 'bg-[#101014]/90 border-white/10 hover:border-gold/40 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-13 h-13 rounded-full flex items-center justify-center font-serif font-bold text-base border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-gold text-black border-gold shadow-[0_0_20px_rgba(197,160,89,0.5)]'
                        : 'bg-[#18181F] text-gold border-gold/30 group-hover:border-gold'
                    }`}
                  >
                    {profile?.initials ?? meta.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-gold block">
                      {meta.craftBadge}
                    </span>
                    <h2 className="text-xl font-serif font-bold text-white">
                      {profile?.name ?? meta.name} &middot;{' '}
                      <span className="text-gold italic">{meta.universeTitle}</span>
                    </h2>
                    <p className="text-xs text-gray-300 mt-0.5">{meta.universeSubtitle}</p>
                  </div>
                </div>

                <span
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-sans font-extrabold uppercase tracking-[0.18em] shrink-0 border ${
                    isSelected
                      ? 'bg-gold text-black border-gold'
                      : 'border-white/15 text-gray-400 group-hover:text-white'
                  }`}
                >
                  {count} Services
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Artistry Triptych Strip — Strictly Showcasing the Active Specialist's Models */}
      {showcaseImages.length > 0 && (
        <motion.div
          key={activeSpecialist}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14"
        >
          {showcaseImages.map((img, i) => (
            <div
              key={img.id || i}
              onClick={() => onNavigateToBooking(undefined, activeBarberProfile?.id ?? activeSpecialist)}
              className="group relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/10 cursor-pointer"
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-gold/40 rounded-full px-3 py-1 text-[9px] font-sans font-extrabold uppercase tracking-[0.2em] text-gold">
                {activeUniverseMeta.name} Model
              </div>
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                    {img.category}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-white line-clamp-1">
                    {img.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search & Pill Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? specialistServices.length
                : specialistServices.filter((s) => s.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isActive
                    ? 'bg-gold text-black border-gold shadow-[0_4px_18px_rgba(197,160,89,0.35)]'
                    : 'bg-transparent text-gray-400 border-white/10 hover:text-white hover:border-white/25'
                }`}
              >
                <span>{cat === 'All' ? `All ${activeUniverseMeta.name} Services` : cat}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-gold/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSpecialist === 'mika'
                ? 'Search knotless, cornrows, locs...'
                : 'Search skin fade, beard, haircut...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/12 focus:border-gold pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 rounded-full outline-none transition-colors"
          />
        </div>
      </div>

      {/* Curved Salon Menu Pavilion */}
      <div className="rounded-[2.75rem] bg-gradient-to-b from-white/[0.035] via-[#121116]/90 to-[#0B0A0E]/95 border border-white/[0.09] p-4 sm:p-8 md:p-10 shadow-[0_32px_90px_rgba(0,0,0,0.75)] divide-y divide-white/[0.08]">
        {filteredServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.25) }}
            onClick={() => onNavigateToBooking(service.id, activeBarberProfile?.id ?? activeSpecialist)}
            className="group py-6 px-3 sm:px-5 rounded-[1.75rem] hover:bg-white/[0.025] transition-all cursor-pointer"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Scissors className="w-4 h-4 text-gold/70 group-hover:text-gold shrink-0 transition-transform group-hover:rotate-12" />
                <h2 className="text-lg sm:text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors truncate">
                  {service.name}
                </h2>
                {service.badge && (
                  <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-[0.2em] text-gold/90 shrink-0">
                    &middot; {service.badge}
                  </span>
                )}
              </div>

              {/* Dotted Leader */}
              <div className="hidden sm:block flex-1 border-b border-dotted border-white/15 mx-3 relative -top-1" />

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold/70" />
                  <span>{service.duration}</span>
                </span>
                <span className="text-2xl font-serif font-bold text-gold tabular-nums">
                  {service.price}
                </span>
              </div>
            </div>

            <div className="pl-7 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {service.description}
                </p>
                {service.inclusions && service.inclusions.length > 0 && (
                  <p className="text-[11px] font-mono text-gray-500 mt-1.5">
                    {service.inclusions.join(' · ')}
                  </p>
                )}
              </div>

              <span className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold group-hover:text-black bg-gold/10 group-hover:bg-gold border border-gold/30 px-4 py-2 rounded-full transition-all">
                <span>Book with {activeUniverseMeta.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

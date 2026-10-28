import { useState, useMemo, useEffect } from 'react';
import { Phone, ZoomIn, ArrowUpRight } from 'lucide-react';
import CallShopModal from '../../components/CallShopModal';
import ImageLightboxModal, { LightboxImageItem } from '../../components/ImageLightboxModal';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getGalleryItemSpecialist
} from '../../lib/site/specialist';

interface GalleryPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (service?: string, barberId?: string) => void;
  onNavigateToBarbers: () => void;
}

export default function GalleryPage({
  onNavigateToBooking
}: GalleryPageProps) {
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>('lusca');
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);
  const { gallery: items, barbers, site } = useSiteData();

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];
  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  // Filter items strictly for the active specialist
  const specialistItems = useMemo(() => {
    const list = items.filter((i) => getGalleryItemSpecialist(i) === activeSpecialist);
    return list.length > 0 ? list : items;
  }, [items, activeSpecialist]);

  const GALLERY_CATEGORIES = useMemo(
    () => [
      'All Styles',
      ...Array.from(new Set(specialistItems.map((i) => i.category).filter(Boolean)))
    ],
    [specialistItems]
  );

  useEffect(() => {
    setActiveCategory('All Styles');
  }, [activeSpecialist]);

  const filtered = specialistItems.filter((item) => {
    return activeCategory === 'All Styles' || item.category === activeCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 w-full font-sans">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
          {activeUniverseMeta.craftBadge}
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
          {activeUniverseMeta.name} &mdash;{' '}
          <span className="text-gold italic">{activeUniverseMeta.universeTitle}</span>
        </h1>
        <div className="divider-gold-fade max-w-xs mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          {activeUniverseMeta.description} Click any portrait to inspect the technique and reserve directly with {activeUniverseMeta.name}.
        </p>
      </div>

      {/* Dedicated Two-Universe Switcher Cards (Lusca Men vs Mika Women/Braids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
          const meta = SPECIALIST_UNIVERSES[specKey];
          const profile = getBarberForSpecialist(barbers, specKey);
          const isSelected = activeSpecialist === specKey;
          const count = items.filter((i) => getGalleryItemSpecialist(i) === specKey).length;

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
                  {count} Models
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Categories Pills (Only for Active Specialist) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer border ${
              activeCategory === cat
                ? 'bg-gold text-black border-gold shadow-sm'
                : 'bg-white/[0.02] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {cat === 'All Styles' ? `All ${activeUniverseMeta.name} Models` : cat}
          </button>
        ))}
      </div>

      {/* Sculptural Gallery Grid (Strictly Active Specialist) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map((item, idx) => {
          const barberDisplay = `${activeBarberProfile?.name ?? activeUniverseMeta.name} (${activeUniverseMeta.universeTitle})`;
          const isArch = idx % 3 === 1;

          const lightboxItem: LightboxImageItem = {
            src: item.imageUrl,
            alt: item.title,
            title: item.title,
            category: item.category,
            barber: barberDisplay,
            description: item.description
          };

          return (
            <div
              key={item.id || idx}
              onClick={() => setSelectedImage(lightboxItem)}
              className={`group relative overflow-hidden cursor-pointer border border-white/10 hover:border-gold/50 transition-all duration-500 shadow-[0_24px_60px_rgba(0,0,0,0.75)] bg-[#0E0D12] aspect-[4/5] ${
                isArch ? 'rounded-t-[10rem] rounded-b-[2.25rem]' : 'rounded-[2.5rem]'
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09080C] via-[#09080C]/35 to-transparent" />

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gold border border-white/15">
                <ZoomIn className="w-4 h-4" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-gold mb-1.5">
                  <span>{item.category}</span>
                  <span className="text-white/30">&middot;</span>
                  <span className="text-gray-300">By {activeBarberProfile?.name ?? activeUniverseMeta.name}</span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-white font-serif font-bold text-lg group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-300/85 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-white/[0.08] group-hover:bg-gold text-white group-hover:text-black border border-white/15 flex items-center justify-center shrink-0 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Curved Callout */}
      <div className="mt-16 card-luxury rounded-[2.75rem]! p-8 sm:p-10 text-center">
        <h2 className="text-xl sm:text-3xl font-serif font-bold text-white mb-2">
          Ready to Book Your Chair with {activeUniverseMeta.name}?
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
          Reserve your private appointment for {activeUniverseMeta.universeTitle.toLowerCase()}, or call our direct line.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={() => onNavigateToBooking(undefined, activeBarberProfile?.id ?? activeSpecialist)}
            className="btn-gold rounded-full! text-xs px-7 py-3.5"
          >
            <span>Book with {activeUniverseMeta.name}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="btn-obsidian rounded-full! text-xs font-mono px-6 py-3.5"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span>Call Direct: {activeBarberProfile?.phone || site.contact.phones[0]?.display}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        image={selectedImage}
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onBookStyle={(style) => {
          setSelectedImage(null);
          onNavigateToBooking(style, activeBarberProfile?.id ?? activeSpecialist);
        }}
      />

      <CallShopModal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} />
    </div>
  );
}

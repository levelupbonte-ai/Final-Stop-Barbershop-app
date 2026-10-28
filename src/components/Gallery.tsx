import { useState, useMemo } from 'react';
import { ZoomIn, Scissors } from 'lucide-react';
import { motion } from 'motion/react';
import ImageLightboxModal, { LightboxImageItem } from './ImageLightboxModal';
import { useSiteData } from '../lib/site/SiteDataProvider';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getGalleryItemSpecialist
} from '../lib/site/specialist';

interface GalleryProps {
  onBookAppointment?: (service?: string, barberId?: string) => void;
}

export default function Gallery({ onBookAppointment }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);
  const { gallery: galleryItems, barbers } = useSiteData();
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>('lusca');

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];
  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  // Filter portfolio models strictly to the active specialist's universe
  const filteredItems = useMemo(() => {
    const list = galleryItems.filter((item) => getGalleryItemSpecialist(item) === activeSpecialist);
    return list.length > 0 ? list : galleryItems;
  }, [galleryItems, activeSpecialist]);

  return (
    <section id="gallery" className="py-24 bg-dark-bg border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            {activeUniverseMeta.craftBadge}
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight mb-4 text-white">
            {activeUniverseMeta.name}&rsquo;s{' '}
            <span className="font-serif italic font-bold text-gold">
              {activeUniverseMeta.universeTitle}
            </span>
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-5"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            {activeUniverseMeta.description} Click any model below to inspect the artistry and book directly with {activeUniverseMeta.name}.
          </p>

          {/* Two-Universe Specialist Switcher: Lusca (Men) vs Mika (Women / Braids & Locs) */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 mt-8 rounded-full bg-[#121217] border border-white/12">
            {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
              const meta = SPECIALIST_UNIVERSES[specKey];
              const count = galleryItems.filter((g) => getGalleryItemSpecialist(g) === specKey).length;
              const isSelected = activeSpecialist === specKey;

              return (
                <button
                  key={specKey}
                  type="button"
                  onClick={() => setActiveSpecialist(specKey)}
                  className={`px-6 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-gold text-black shadow-[0_6px_22px_rgba(197,160,89,0.4)]'
                      : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {meta.shortLabel} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Sculptural Editorial Lookbook Grid — Strictly Active Specialist's Models */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {filteredItems.map((item, idx) => {
            const barberDisplay = `${activeBarberProfile?.name ?? activeUniverseMeta.name} (${activeUniverseMeta.universeTitle})`;

            const lightboxItem: LightboxImageItem = {
              src: item.imageUrl,
              alt: item.title,
              title: item.title,
              category: item.category,
              barber: barberDisplay,
              description: item.description
            };

            const isArch = idx % 3 === 1;

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: (idx % 3) * 0.08 }}
                onClick={() => setSelectedImage(lightboxItem)}
                className={`group relative overflow-hidden cursor-pointer border border-white/10 hover:border-gold/55 transition-all duration-500 hover:-translate-y-2 shadow-[0_24px_60px_rgba(0,0,0,0.75)] ${
                  isArch
                    ? 'rounded-t-[10rem] rounded-b-[2.25rem] lg:mt-6'
                    : 'rounded-[2.5rem]'
                }`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0D0D11]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                  <div className="absolute top-5 left-6 right-5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-gold/95 font-bold drop-shadow">
                      {item.category}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-gold/40 group-hover:bg-gold group-hover:text-black text-gold flex items-center justify-center transition-all duration-300 shadow-lg">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 flex flex-col justify-end">
                    <span className="text-[10px] text-gold font-mono uppercase tracking-[0.22em] block mb-1">
                      Artisan &middot; {activeBarberProfile?.name ?? activeUniverseMeta.name}
                    </span>
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-gold transition-colors mb-2 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-300/90 line-clamp-2 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gold font-semibold flex items-center gap-1.5">
                        <Scissors className="w-3 h-3" />
                        <span>Book with {activeUniverseMeta.name}</span>
                      </span>
                      <span className="text-white/80 group-hover:text-gold group-hover:translate-x-1 transition-all">
                        View Look &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reusable Clickable Image Lightbox Modal */}
      <ImageLightboxModal
        image={selectedImage}
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onBookStyle={(style) => {
          setSelectedImage(null);
          onBookAppointment?.(style, activeBarberProfile?.id ?? activeSpecialist);
        }}
      />
    </section>
  );
}

import { useState } from 'react';
import { ZoomIn, Scissors } from 'lucide-react';
import { motion } from 'motion/react';
import ImageLightboxModal, { LightboxImageItem } from './ImageLightboxModal';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface GalleryProps {
  onBookAppointment?: (service?: string, barber?: string) => void;
}

export default function Gallery({ onBookAppointment }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);
  const { gallery: galleryItems, galleryBanner, barbers } = useSiteData();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const featuredBanner: LightboxImageItem | null = galleryBanner
    ? {
        src: galleryBanner.imageUrl,
        alt: galleryBanner.alt,
        title: galleryBanner.title,
        category: galleryBanner.category,
        barber: galleryBanner.credit,
        description: galleryBanner.description,
      }
    : null;

  const filteredItems = galleryItems.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.barber === activeFilter || item.barber === 'Both';
  });

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
            Artistry &amp; Master Craft
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight mb-4 text-white">
            Signature <span className="font-serif italic font-bold text-gold">Portfolio</span>
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Click any style below to inspect the artistry, detailed technique description, and barber attribution.
          </p>

          {/* Segmented Filter Control: all + one per team member */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 mt-7 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className={`px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'All'
                  ? 'btn-gold rounded-full! text-black font-bold shadow-md'
                  : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              All Styles ({galleryItems.length})
            </button>
            {barbers.map((barber) => (
              <button
                key={barber.id}
                type="button"
                onClick={() => setActiveFilter(barber.name)}
                className={`px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === barber.name
                    ? 'btn-gold rounded-full! text-black font-bold shadow-md'
                    : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {barber.name}{barber.galleryLabel ? <> &middot; {barber.galleryLabel}</> : null}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured showcase banner (content block "gallery_banner") */}
        {featuredBanner && galleryBanner && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedImage(featuredBanner)}
            className="mb-14 rounded-[2.75rem] border border-white/10 hover:border-gold/50 overflow-hidden relative group cursor-pointer shadow-[0_30px_80px_rgba(0,0,0,0.85)] transition-all duration-500"
          >
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
              <img 
                src={featuredBanner.src} 
                alt={featuredBanner.alt} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              
              <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md border border-gold/40 rounded-full px-4 py-1.5 flex items-center gap-2 text-gold text-xs font-mono">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Inspect Showcase</span>
              </div>

              <div className="absolute bottom-7 left-7 right-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-gold font-mono text-xs uppercase tracking-widest block mb-1">
                    {galleryBanner.eyebrow}
                  </span>
                  <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-2">
                    {galleryBanner.heading}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 max-w-2xl line-clamp-2">
                    {featuredBanner.description}
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="btn-gold rounded-full! text-xs px-6 py-3">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Inspect Styles</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sculptural Editorial Lookbook Grid — Alternating Arch Silhouettes & Full-Bleed Overlays */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {filteredItems.map((item, idx) => {
            const member = barbers.find((b) => b.name === item.barber);
            const barberDisplay = member
              ? `${member.name} (${member.role})`
              : barbers.map((b) => b.name).join(' & ');

            const lightboxItem: LightboxImageItem = {
              src: item.imageUrl,
              alt: item.title,
              title: item.title,
              category: item.category,
              barber: barberDisplay,
              description: item.description,
            };

            // Center column items on desktop get a signature haute-couture Arch Silhouette
            const isArch = idx % 3 === 1;

            return (
              <motion.div 
                key={item.id || idx}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
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
                  {/* Silky Multi-Stop Editorial Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                  
                  {/* Top Unboxed Whisper Kicker + Floating Circular Zoom */}
                  <div className="absolute top-5 left-6 right-5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-gold/95 font-bold drop-shadow">
                      {item.category}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-gold/40 group-hover:bg-gold group-hover:text-black text-gold flex items-center justify-center transition-all duration-300 shadow-lg">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Sculpted Bottom Overlay Content (No Boxy Footer) */}
                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 flex flex-col justify-end">
                    <span className="text-[10px] text-gold font-mono uppercase tracking-[0.22em] block mb-1">
                      {item.barber === 'Both' ? 'San Diego Atelier' : `Artisan · ${item.barber}`}
                    </span>
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-gold transition-colors mb-2 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-300/90 line-clamp-2 leading-relaxed mb-4">
                      {item.description}
                    </p>
                    
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gold font-semibold">Inspect &amp; Book Craft</span>
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

      {/* Reusable Clickable Image Lightbox Modal with Full Description */}
      <ImageLightboxModal 
        image={selectedImage}
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onBookStyle={(style, barber) => {
          setSelectedImage(null);
          onBookAppointment?.(style, barber);
        }}
      />
    </section>
  );
}

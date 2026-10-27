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
            className="mb-12 card-luxury overflow-hidden relative group cursor-pointer"
          >
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
              <img 
                src={featuredBanner.src} 
                alt={featuredBanner.alt} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md border border-gold/40 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-gold text-xs font-mono">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Click to view showcase</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
                  <span className="btn-gold rounded-full! text-xs px-5 py-3">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Inspect Styles</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid of Clickable Images with Smooth Scroll-Reveal Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            return (
              <motion.div 
                key={item.id || idx}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedImage(lightboxItem)}
                className="group relative card-luxury overflow-hidden cursor-pointer flex flex-col hover:-translate-y-1.5"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  
                  {/* Category Label */}
                  <div className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md border border-white/15 rounded-full text-gray-200 text-[10px] uppercase font-mono px-3 py-1 tracking-wider font-semibold">
                    {item.category}
                  </div>

                  {/* Zoom Badge */}
                  <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-gold text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform group-hover:scale-105">
                    <ZoomIn className="w-4 h-4" />
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <span className="text-[10px] text-gold font-mono uppercase tracking-widest block mb-0.5">
                      {item.barber === 'Both' ? 'Storefront' : `By ${item.barber}`}
                    </span>
                    <h4 className="text-base font-serif font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body with Description */}
                <div className="p-4 flex-1 flex flex-col justify-between border-t border-white/8 bg-[#111115]">
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/8 text-[11px] font-mono">
                    <span className="text-gold font-semibold">Inspect &amp; Book Style</span>
                    <span className="text-gray-400 group-hover:text-gold transition-colors">View Work &rarr;</span>
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

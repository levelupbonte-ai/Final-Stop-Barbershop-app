import { useState, useEffect } from 'react';
import { ZoomIn, Scissors, Sparkles, Filter } from 'lucide-react';
import ImageLightboxModal, { LightboxImageItem } from './ImageLightboxModal';
import { getGalleryItems, FirestoreGalleryItem } from '../lib/firestoreService';

interface GalleryProps {
  onBookAppointment?: (service?: string, barber?: string) => void;
}

export default function Gallery({ onBookAppointment }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<FirestoreGalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Mika' | 'Lusca'>('All');

  useEffect(() => {
    let isMounted = true;
    getGalleryItems().then((items) => {
      if (isMounted && items && items.length > 0) {
        setGalleryItems(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredBanner: LightboxImageItem = {
    src: 'https://i.ibb.co/Y4yKyxRB/Chat-GPT-Image-Sep-6-2026-03-26-27-PM.png',
    alt: 'Exclusive Final Stop Signature Styles & Finishes',
    title: 'Final Stop Signature Styles Showcase',
    category: 'Master Collection',
    barber: 'Mika & Lusca (Over 20 Years Experience)',
    description: 'A curated showcase of our master craft: Mika\'s protective braids & locs for women & girls, and Lusca\'s precision skin fades, beard architecture & boys\' cuts.',
  };

  const filteredItems = galleryItems.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.barber === activeFilter || item.barber === 'Both';
  });

  return (
    <section id="gallery" className="py-24 bg-dark-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-10">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Artistry & Master Craft
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Our Portfolio
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Click any style below to inspect the artistry, detailed technique description, and barber attribution.
          </p>

          {/* Filter Pills: All, Mika (Girls' Braids), Lusca (Boys' Cuts) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                activeFilter === 'All'
                  ? 'bg-gold text-black font-bold shadow-md'
                  : 'bg-[#151517] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              All Styles ({galleryItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('Mika')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                activeFilter === 'Mika'
                  ? 'bg-gold text-black font-bold shadow-md'
                  : 'bg-[#151517] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Mika &bull; Girls’ Braids & Locs
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('Lusca')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                activeFilter === 'Lusca'
                  ? 'bg-gold text-black font-bold shadow-md'
                  : 'bg-[#151517] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Lusca &bull; Boys’ Cuts & Fades
            </button>
          </div>
        </div>

        {/* Featured 6-in-1 Showcase Banner - Clickable */}
        <div 
          onClick={() => setSelectedImage(featuredBanner)}
          className="mb-12 border border-white/10 overflow-hidden relative group bg-[#151517] shadow-xl cursor-pointer"
        >
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
            <img 
              src={featuredBanner.src} 
              alt={featuredBanner.alt} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
            
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-gold/40 px-3 py-1.5 flex items-center gap-2 text-gold text-xs font-mono">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Click to view showcase</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-gold font-mono text-xs uppercase tracking-widest block mb-1">
                  Final Stop Barber Shop &bull; Mika & Lusca
                </span>
                <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-2">
                  Master Barber Artistry Portfolio
                </h3>
                <p className="text-xs md:text-sm text-gray-300 max-w-2xl line-clamp-2">
                  {featuredBanner.description}
                </p>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Inspect Styles</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Clickable Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => {
            const barberDisplay = item.barber === 'Both' 
              ? 'Mika & Lusca (Founders)' 
              : item.barber === 'Mika' 
                ? 'Mika (20+ Yrs &bull; Women’s & Girls’ Braids)' 
                : 'Lusca (20+ Yrs &bull; Boys’ & Men’s Cuts)';

            const lightboxItem: LightboxImageItem = {
              src: item.imageUrl,
              alt: item.title,
              title: item.title,
              category: item.category,
              barber: barberDisplay,
              description: item.description,
            };

            return (
              <div 
                key={item.id || idx} 
                onClick={() => setSelectedImage(lightboxItem)}
                className="group relative bg-[#151517] border border-white/10 hover:border-gold/50 transition-all duration-300 overflow-hidden shadow-xl cursor-pointer flex flex-col"
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
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 text-gray-300 text-[10px] uppercase font-mono px-2.5 py-1 tracking-wider font-bold">
                    {item.category}
                  </div>

                  {/* Zoom Badge */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform group-hover:scale-110">
                    <ZoomIn className="w-4 h-4" />
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-gold font-mono uppercase tracking-widest block mb-0.5">
                      {item.barber === 'Both' ? 'Storefront' : `By ${item.barber}`}
                    </span>
                    <h4 className="text-base font-serif font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body with Description */}
                <div className="p-4 flex-1 flex flex-col justify-between border-t border-white/5 bg-[#121214]">
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                    <span className="text-gold font-bold">Click for description</span>
                    <span className="text-gray-500">20+ Yrs Exp &rarr;</span>
                  </div>
                </div>
              </div>
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

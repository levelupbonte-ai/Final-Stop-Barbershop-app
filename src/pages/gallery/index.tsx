import { useState } from 'react';
import { Phone, ZoomIn, ArrowUpRight } from 'lucide-react';
import CallShopModal from '../../components/CallShopModal';
import ImageLightboxModal, { LightboxImageItem } from '../../components/ImageLightboxModal';
import { useSiteData } from '../../lib/site/SiteDataProvider';

interface GalleryPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (service?: string, barber?: string) => void;
  onNavigateToBarbers: () => void;
}

export default function GalleryPage({
  onNavigateToBooking,
}: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [activeBarber, setActiveBarber] = useState<string>('All');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);
  const { gallery: items, barbers, site } = useSiteData();
  const teamNames = barbers.map((b) => b.name).join(' & ');
  const GALLERY_CATEGORIES = ['All Styles', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const filtered = items.filter((item) => {
    const matchesCategory = activeCategory === 'All Styles' || item.category === activeCategory;
    const matchesBarber = activeBarber === 'All' || item.barber === activeBarber || item.barber === 'Both';
    return matchesCategory && matchesBarber;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 w-full font-sans">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
          Master Craft &amp; Live Portfolio
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
          Signature Cuts &amp; Styles
        </h1>
        <div className="divider-gold-fade max-w-xs mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Click any portrait to inspect the detailed technique description and master barber attribution.
        </p>

        {/* Quick Barber Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setActiveBarber('All')}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-full cursor-pointer border ${
              activeBarber === 'All'
                ? 'bg-gold text-black border-gold font-bold shadow-md'
                : 'bg-white/[0.03] text-gray-300 border-white/10 hover:border-gold/40 hover:text-white'
            }`}
          >
            All Barbers
          </button>
          {barbers.map((barber) => (
            <button
              key={barber.id}
              type="button"
              onClick={() => setActiveBarber(barber.name)}
              className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-full cursor-pointer border ${
                activeBarber === barber.name
                  ? 'bg-gold text-black border-gold font-bold shadow-md'
                  : 'bg-white/[0.03] text-gray-300 border-white/10 hover:border-gold/40 hover:text-white'
              }`}
            >
              {barber.name}{barber.galleryLabel ? <> &bull; {barber.galleryLabel}</> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Categories Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all rounded-full cursor-pointer border ${
              activeCategory === cat
                ? 'bg-white/15 text-gold border-gold font-bold shadow-sm'
                : 'bg-white/[0.02] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sculptural Gallery Grid (Alternating Arches & Curved Vessels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map((item, idx) => {
          const member = barbers.find((b) => b.name === item.barber);
          const barberDisplay = member ? `${member.name} (${member.role})` : teamNames;
          const isArch = idx % 3 === 1;

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
                  <span className="text-gray-300">
                    {item.barber === 'Both' ? 'Salon Showcase' : `By ${item.barber}`}
                  </span>
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
          Ready for Your Signature Cut or Braids?
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
          Book an appointment with {teamNames} for a private chair, or join our live walk-in queue.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={() => onNavigateToBooking()}
            className="btn-gold rounded-full! text-xs px-7 py-3.5"
          >
            <span>Book an Appointment</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="btn-obsidian rounded-full! text-xs font-mono px-6 py-3.5"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span>Call Shop: {site.contact.phones[0]?.display}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        image={selectedImage}
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onBookStyle={(style, barber) => {
          setSelectedImage(null);
          onNavigateToBooking(style, barber);
        }}
      />

      <CallShopModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
}

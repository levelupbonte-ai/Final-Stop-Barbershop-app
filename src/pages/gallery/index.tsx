import { useState } from 'react';
import { ArrowLeft, Calendar, Phone, ZoomIn } from 'lucide-react';
import CallShopModal from '../../components/CallShopModal';
import ImageLightboxModal, { LightboxImageItem } from '../../components/ImageLightboxModal';
import { useSiteData } from '../../lib/site/SiteDataProvider';

interface GalleryPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (service?: string, barber?: string) => void;
  onNavigateToBarbers: () => void;
}

export default function GalleryPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
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
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      {/* Header - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#09090B]/95 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg">
        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="btn-obsidian text-xs px-3.5 py-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBarbers}
              className="btn-obsidian text-xs px-3.5 py-2 hidden sm:inline-flex"
            >
              <span>{teamNames}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="btn-gold text-xs px-4 py-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Master Craft & Live Portfolio
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Signature Cuts & Styles
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Click any picture to inspect the detailed technique description and master barber attribution.
          </p>

          {/* Quick Barber Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setActiveBarber('All')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-xs cursor-pointer border ${
                activeBarber === 'All'
                  ? 'bg-gold text-black border-gold font-bold shadow-md'
                  : 'bg-[#151517] text-gray-300 border-white/10 hover:border-gold/40 hover:text-white'
              }`}
            >
              All Barbers
            </button>
            {barbers.map((barber) => (
              <button
                key={barber.id}
                type="button"
                onClick={() => setActiveBarber(barber.name)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-xs cursor-pointer border ${
                  activeBarber === barber.name
                    ? 'bg-gold text-black border-gold font-bold shadow-md'
                    : 'bg-[#151517] text-gray-300 border-white/10 hover:border-gold/40 hover:text-white'
                }`}
              >
                {barber.name}{barber.galleryLabel ? <> &bull; {barber.galleryLabel}</> : null}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all rounded-xs cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-white/20 text-gold border-gold font-bold shadow-sm'
                  : 'bg-[#121215] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => {
            const member = barbers.find((b) => b.name === item.barber);
            const barberDisplay = member ? `${member.name} (${member.role})` : teamNames;

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
                className="group relative bg-[#121215] border border-white/10 overflow-hidden cursor-pointer hover:border-gold/60 transition-all duration-300 shadow-lg flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gold border border-white/15">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono text-gold border border-white/15">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
                      <span className="text-gold font-bold">
                        {item.barber === 'Both' ? 'Storefront' : `By ${item.barber}`}
                      </span>
                      <span className="text-[10px] text-gray-500">{item.targetAudience}</span>
                    </div>
                    <h3 className="text-white font-serif font-bold text-base group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-gold flex items-center gap-1">
                      <span>Click to read description</span>
                    </span>
                    <span className="text-gray-400 group-hover:text-white transition-colors">&rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#151517] via-[#1A1A22] to-[#151517] border border-gold/30 p-8 text-center rounded-sm">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
            Ready for Your Signature Cut or Braids?
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
            Book an appointment with {teamNames} for a VIP chair, or join our live walk-in queue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-sm cursor-pointer shadow-lg"
            >
              Book an Appointment
            </button>
            <button
              type="button"
              onClick={() => setIsCallModalOpen(true)}
              className="border border-white/20 hover:border-gold text-white hover:text-gold text-xs font-mono uppercase px-6 py-3 rounded-sm cursor-pointer flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Shop: {site.contact.phones[0]?.display}</span>
            </button>
          </div>
        </div>
      </main>

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

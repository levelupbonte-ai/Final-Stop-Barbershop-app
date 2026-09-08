import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Phone, Sparkles, ZoomIn, Filter } from 'lucide-react';
import CallShopModal from '../components/CallShopModal';
import ImageLightboxModal, { LightboxImageItem } from '../components/ImageLightboxModal';
import { getGalleryItems, FirestoreGalleryItem } from '../lib/firestoreService';

interface GalleryPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (service?: string, barber?: string) => void;
  onNavigateToBarbers: () => void;
}

const GALLERY_CATEGORIES = ['All Styles', 'Braids & Cornrows', 'Locs & Twists', 'Skin Fades', 'Beards & Shaves', 'The Shop'];

export default function GalleryPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [activeBarber, setActiveBarber] = useState<'All' | 'Mika' | 'Lusca'>('All');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);
  const [items, setItems] = useState<FirestoreGalleryItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getGalleryItems().then((res) => {
      if (isMounted && res) {
        setItems(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = items.filter((item) => {
    const matchesCategory = activeCategory === 'All Styles' || item.category === activeCategory;
    const matchesBarber = activeBarber === 'All' || item.barber === activeBarber || item.barber === 'Both';
    return matchesCategory && matchesBarber;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      {/* Header - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBarbers}
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-block"
            >
              Mika & Lusca (20+ Yrs)
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm cursor-pointer"
            >
              Book Now
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
            Click any picture to inspect the detailed technique description and master barber attribution (Mika for girls' braids & locs, Lusca for boys' cuts & razor fades).
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
            <button
              type="button"
              onClick={() => setActiveBarber('Mika')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-xs cursor-pointer border ${
                activeBarber === 'Mika'
                  ? 'bg-gold text-black border-gold font-bold shadow-md'
                  : 'bg-[#151517] text-gray-300 border-white/10 hover:border-gold/40 hover:text-white'
              }`}
            >
              Mika &bull; Girls’ Braids & Locs (20+ Yrs)
            </button>
            <button
              type="button"
              onClick={() => setActiveBarber('Lusca')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-xs cursor-pointer border ${
                activeBarber === 'Lusca'
                  ? 'bg-gold text-black border-gold font-bold shadow-md'
                  : 'bg-[#151517] text-gray-300 border-white/10 hover:border-gold/40 hover:text-white'
              }`}
            >
              Lusca &bull; Boys’ Cuts & Fades (20+ Yrs)
            </button>
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
                      <Sparkles className="w-3.5 h-3.5" />
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
            Book an appointment with Mika (girls' braids) or Lusca (boys' cuts & razor fades) for a VIP chair, or join our live walk-in queue.
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
              <span>Call Shop: (619) 886-1267</span>
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

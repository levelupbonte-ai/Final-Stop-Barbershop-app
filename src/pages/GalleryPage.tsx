import { useState } from 'react';
import { ArrowLeft, Calendar, Phone, Sparkles } from 'lucide-react';
import CallShopModal from '../components/CallShopModal';

interface GalleryPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  onNavigateToBarbers: () => void;
}

const GALLERY_CATEGORIES = ['Tous', 'Skin Fades', 'Barbe & Shave', 'Braids & Tresses', 'Dreadlocks', 'VIP Lounge'];

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Precision Mid Skin Fade',
    category: 'Skin Fades',
    barber: 'Mika (20+ ans)',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    title: 'Signature Beard Contour & Steam',
    category: 'Barbe & Shave',
    barber: 'Lusca (20+ ans)',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    title: 'Clean Geometric Cornrows',
    category: 'Braids & Tresses',
    barber: 'Lusca (20+ ans)',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    title: 'Low Drop Fade with Texture Crop',
    category: 'Skin Fades',
    barber: 'Mika (20+ ans)',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 5,
    title: 'Sculpted Full Beard & Hot Lather',
    category: 'Barbe & Shave',
    barber: 'Lusca (20+ ans)',
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    title: 'Dreadlocks Root Retwist & Taper',
    category: 'Dreadlocks',
    barber: 'Lusca (20+ ans)',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 7,
    title: 'Executive Razor Cut & Lineup',
    category: 'Skin Fades',
    barber: 'Mika (20+ ans)',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 8,
    title: 'Prestige VIP Grooming Suite',
    category: 'VIP Lounge',
    barber: 'Mika & Lusca',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800'
  }
];

export default function GalleryPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const filtered = activeCategory === 'Tous'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Retour à l'Accueil</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBarbers}
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-block"
            >
              Mika & Lusca (20+ ans)
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm"
            >
              Prendre RDV
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Portfolio & Réalisations
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            L'Art du Dégradé & de la Barbe en Image
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Chaque réalisation est le fruit de plus de 20 ans d'expérience au fauteuil par Mika et Lusca.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {GALLERY_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer rounded-sm ${
                activeCategory === cat
                  ? 'bg-gold text-black font-bold shadow-md'
                  : 'bg-[#151518] text-gray-300 border border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filtered.map(item => (
            <div key={item.id} className="group bg-[#141418] border border-white/10 overflow-hidden shadow-xl">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-gold/40 text-gold text-[10px] font-mono px-2 py-0.5 font-bold uppercase">
                  {item.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-serif font-bold text-white group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs text-gray-400 font-mono block mt-1">
                  Par {item.barber}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToBooking()}
                  className="mt-3 text-[11px] text-gold font-bold uppercase tracking-wider hover:underline block"
                >
                  Demander cette coupe &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}

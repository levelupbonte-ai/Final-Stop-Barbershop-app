import { Rotate3d, Sparkles } from 'lucide-react';

interface GalleryProps {
  onOpen360?: () => void;
}

export default function Gallery({ onOpen360 }: GalleryProps) {
  const images = [
    { 
      src: 'https://i.ibb.co/20Ns74Tz/Chat-GPT-Image-6-sept-2026-15-53-44.png', 
      alt: 'Twisted Locs with High Taper Fade & Beard Lineup',
      category: 'Locs & Taper Fade'
    },
    { 
      src: 'https://i.ibb.co/xq8zMm2t/Chat-GPT-Image-6-sept-2026-15-55-41.png', 
      alt: 'Swirl Cornrows & Geometric Spiral Braids',
      category: 'Designer Braids'
    },
    { 
      src: 'https://i.ibb.co/cXxD5MpB/Chat-GPT-Image-6-sept-2026-15-56-42.png', 
      alt: 'Waist-Length Knotless Box Braids',
      category: 'Protective Styling'
    },
    { 
      src: 'https://i.ibb.co/zhXtNXB4/Chat-GPT-Image-Sep-6-2026-03-38-30-PM-1.png', 
      alt: 'Burgundy Goddess Locs & Edge Styling',
      category: 'Locs & Custom Color'
    },
    { 
      src: 'https://i.ibb.co/d4N6qCDJ/Chat-GPT-Image-Sep-6-2026-03-39-13-PM-1.png', 
      alt: 'Sleek High Braided Ponytail & Cornrow Crown',
      category: 'Braided Updo'
    },
    { 
      src: 'https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png', 
      alt: 'Final Stop Barbershop • Storefront & Grooming Lounge',
      category: 'Our Barber Shop'
    }
  ];

  return (
    <section id="gallery" className="py-24 bg-dark-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            Artistry & Execution
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Our Portfolio
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Every fade, scissor cut, and hot lather shave is delivered with uncompromising attention to detail.
          </p>
        </div>

        {/* Interactive 360° Studio CTA Banner */}
        <div className="mb-12 bg-gradient-to-r from-[#17171C] via-[#221D16] to-[#17171C] border border-gold/40 p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0">
              <Rotate3d className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gold text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  INNOVATION IA
                </span>
                <h3 className="text-lg md:text-xl font-serif font-bold text-white">
                  Studio 360° & Détail des Produits Utilisés
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-300 max-w-xl leading-relaxed">
                Faites pivoter la coupe à 360 degrés, analysez les dégradés sous chaque angle et découvrez les produits de coiffage professionnels appliqués par nos barbiers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpen360}
            className="w-full md:w-auto bg-gold hover:bg-gold-light text-black text-xs font-mono font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
          >
            <Rotate3d className="w-4 h-4" />
            <span>Lancer la Rotation 360°</span>
          </button>
        </div>

        {/* Featured 6-in-1 Showcase Banner */}
        <div className="mb-12 border border-white/10 overflow-hidden relative group bg-[#151517] shadow-xl">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
            <img 
              src="https://i.ibb.co/Y4yKyxRB/Chat-GPT-Image-Sep-6-2026-03-26-27-PM.png" 
              alt="Exclusive Final Stop Signature Styles" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
              <span className="text-gold text-[10px] font-mono tracking-widest uppercase mb-1">
                Exclusive Collection
              </span>
              <h3 className="text-white text-lg md:text-2xl font-serif font-bold">
                Final Stop Signature Styles & Finishes
              </h3>
            </div>
          </div>
        </div>

        {/* Individual Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <div 
              key={i} 
              className="group relative overflow-hidden aspect-square bg-[#151517] border border-white/5 transition-all duration-500 hover:border-gold/40"
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                <span className="text-gold font-mono text-[9px] uppercase tracking-widest mb-1">
                  {img.category}
                </span>
                <span className="text-white font-serif text-sm md:text-base font-medium leading-snug">
                  {img.alt}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

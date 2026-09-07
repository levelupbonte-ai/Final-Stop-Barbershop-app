import { Sparkles } from 'lucide-react';

interface GalleryProps {
  onNavigateToBooking?: (serviceName?: string) => void;
}

export default function Gallery({ onNavigateToBooking }: GalleryProps) {
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

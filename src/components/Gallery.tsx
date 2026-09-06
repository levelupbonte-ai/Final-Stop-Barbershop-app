export default function Gallery() {
  const images = [
    { 
      src: 'https://i.ibb.co/zhXtNXB4/Chat-GPT-Image-Sep-6-2026-03-38-30-PM-1.png', 
      alt: 'Coupe Haute Précision & Finition',
      category: 'Coupe & Style'
    },
    { 
      src: 'https://i.ibb.co/d4N6qCDJ/Chat-GPT-Image-Sep-6-2026-03-39-13-PM-1.png', 
      alt: 'Sculpture & Lignes de Barbe',
      category: 'Barbe Tradition'
    },
    { 
      src: 'https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png', 
      alt: 'Atmosphère & Fauteuils Traditionnels',
      category: 'Le Salon'
    },
    { 
      src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      alt: 'Soin Signature Visage & Serviette Chaude',
      category: 'Soins Signature'
    },
    { 
      src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      alt: 'Rasage à l\'Ancienne & Coupe-Chou',
      category: 'Artisanat'
    },
    { 
      src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      alt: 'Huiles & Cires Premiums Artisanales',
      category: 'Gamme Exclusive'
    },
  ];

  return (
    <section id="gallery" className="py-24 bg-dark-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
            L'Art & La Matière
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Nos Réalisations & Savoir-Faire
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Chaque coupe et chaque taille de barbe est exécutée avec la plus grande précision. Découvrez l'exigence de nos maîtres barbiers en images.
          </p>
        </div>

        {/* Featured 6-in-1 Showcase Banner */}
        <div className="mb-12 border border-white/10 overflow-hidden relative group bg-[#151517]">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
            <img 
              src="https://i.ibb.co/Y4yKyxRB/Chat-GPT-Image-Sep-6-2026-03-26-27-PM.png" 
              alt="Collection Exclusive des Réalisations" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
              <span className="text-gold text-[10px] font-mono tracking-widest uppercase mb-1">
                Collection Exclusive
              </span>
              <h3 className="text-white text-lg md:text-2xl font-serif font-bold">
                Le Panorama de nos Prestations Signatures
              </h3>
              <p className="text-gray-400 text-xs md:text-sm max-w-xl mt-1 hidden sm:block">
                Un aperçu complet de la polyvalence de nos artisans : coupes modernes, dégradés impeccables et rituels de soin traditionnels.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Individual Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <div 
              key={i} 
              className="group relative overflow-hidden aspect-square bg-[#151517] border border-white/5 transition-all duration-500 hover:border-gold/30"
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-gold font-mono text-[9px] uppercase tracking-widest mb-1">
                  {img.category}
                </span>
                <span className="text-white font-serif text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
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

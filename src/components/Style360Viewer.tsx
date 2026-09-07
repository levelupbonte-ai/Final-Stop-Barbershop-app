import { useState, useEffect, useRef, PointerEvent } from 'react';
import { 
  Rotate3d, 
  Sparkles, 
  Package, 
  Check, 
  Info, 
  ChevronRight, 
  Play, 
  Pause, 
  Eye, 
  X,
  Scissors,
  Droplets,
  Award
} from 'lucide-react';

export interface StyleProduct {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  benefits: string[];
  howToUse: string;
  rating: number;
  image: string;
  price: string;
}

export const SALON_PRODUCTS: StyleProduct[] = [
  {
    id: 'matte-pomade',
    name: 'Pâte Matifiante Haute Tenue Final Stop',
    category: 'Coiffage & Texture',
    badge: 'Best Seller Salon',
    description: 'Formule minérale à base d\'argile bentonite et de cire d\'abeille purifiée. Crée une texture nette sans reflet gras avec un volume durable toute la journée.',
    benefits: ['Fini 100% mat', 'Tenue ferme 24h', 'Facile à rincer à l\'eau', 'Parfum bois de santal & bergamote'],
    howToUse: 'Chauffer une noisette entre les paumes. Appliquer sur cheveux secs ou légèrement humides en sculptant de la racine aux pointes.',
    rating: 4.9,
    price: '$24.00',
    image: 'https://images.unsplash.com/photo-1597854710119-a6a4e320f78a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'beard-oil',
    name: 'Élixir Barbe Organique Argan & Eucalyptus',
    category: 'Soin & Nutrition Barbe',
    badge: 'Artisan Grooming',
    description: 'Complexe d\'huiles vierges pressées à froid (argan bio, jojoba doré et huile d\'avocat) enrichi en eucalyptus pur. Apaise les démangeaisons et hydrate le poil en profondeur.',
    benefits: ['Adoucit le poil dru', 'Hydrate la peau sous la barbe', 'Stimule la pousse saine', 'Effet non gras immédiat'],
    howToUse: 'Déposer 3 à 5 gouttes au creux de la main. Masser du bas vers le haut jusqu\'à la racine du poil après la serviette chaude.',
    rating: 5.0,
    price: '$22.00',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'razor-gel',
    name: 'Gel de Rasage Précision Transparent',
    category: 'Contours & Rasage Traditionnel',
    badge: 'Formule Professionnelle',
    description: 'Gel translucide ultra-glissant sans mousse à l\'aloe vera et provitamine B5. Permet une visibilité totale de la ligne de coupe pour des finitions au rasoir droit chirurgicales.',
    benefits: ['Zéro mousse pour tracer droit', 'Glisse optimale sans tiraillement', 'Anti-irritations & anti-boutons', 'Rafraîchit la peau instantanément'],
    howToUse: 'Étaler une fine couche sur les zones de contour (tempes, pommettes, cou). Tracer au coupe-chou avec une lame neuve.',
    rating: 4.8,
    price: '$18.00',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'locs-edge-control',
    name: 'Cire Gel Fixante Locs & Edge Control',
    category: 'Tresses, Locs & Partings',
    badge: 'Protection Cuir Chevelu',
    description: 'Gel fixateur haute performance enrichi en beurre de karité et huile de ricin noir. Maintient les tracés de tresses et retwists sans aucun résidu blanc ni cassure.',
    benefits: ['Fixation extrême sans résidus blancs', 'Fortifie la racine des tresses', 'Brillance naturelle saine', 'Résiste à la transpiration'],
    howToUse: 'Appliquer au doigt ou au peigne fin le long des séparations (partings) et sur les contours avant le tressage.',
    rating: 4.9,
    price: '$20.00',
    image: 'https://images.unsplash.com/photo-1608248597359-2ffb7b1ce854?auto=format&fit=crop&w=600&q=80'
  }
];

// 360 Angles with curated high-definition styling photos
export const ANGLES_360 = [
  {
    angle: 0,
    label: '0° Face',
    sublabel: 'Alignement & Symétrie',
    image: 'https://i.ibb.co/20Ns74Tz/Chat-GPT-Image-6-sept-2026-15-53-44.png',
    hotspot: { x: 50, y: 35, productId: 'matte-pomade', title: 'Volume & Texture' }
  },
  {
    angle: 90,
    label: '90° Profil Gauche',
    sublabel: 'Skin Fade & Tempe',
    image: 'https://i.ibb.co/xq8zMm2t/Chat-GPT-Image-6-sept-2026-15-55-41.png',
    hotspot: { x: 40, y: 48, productId: 'razor-gel', title: 'Ligne de Contour' }
  },
  {
    angle: 180,
    label: '180° Nuque & Dégradé',
    sublabel: 'Arrière & Taper Zéro',
    image: 'https://i.ibb.co/Y4yKyxRB/Chat-GPT-Image-Sep-6-2026-03-26-27-PM.png',
    hotspot: { x: 52, y: 60, productId: 'razor-gel', title: 'Nuque & Dégradé Bas' }
  },
  {
    angle: 270,
    label: '270° Profil Droit',
    sublabel: 'Sculpture Barbe & Joue',
    image: 'https://i.ibb.co/cXxD5MpB/Chat-GPT-Image-6-sept-2026-15-56-42.png',
    hotspot: { x: 62, y: 55, productId: 'beard-oil', title: 'Barbe & Hydratation' }
  }
];

interface Style360ViewerProps {
  onClose?: () => void;
  onSelectServiceForBooking?: (serviceName: string) => void;
}

export default function Style360Viewer({ onClose, onSelectServiceForBooking }: Style360ViewerProps) {
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StyleProduct | null>(null);
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [aiReport, setAiReport] = useState<{
    style: string;
    morphology: string;
    routine: string[];
    recommendedCut: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  // Auto spin timer
  useEffect(() => {
    let interval: any;
    if (isAutoSpinning) {
      interval = setInterval(() => {
        setCurrentAngleIndex((prev) => (prev + 1) % ANGLES_360.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isAutoSpinning]);

  // Touch / Mouse 360 Drag support
  const handlePointerDown = (e: PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    setIsAutoSpinning(false);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Drag right -> rotate counter-clockwise
        setCurrentAngleIndex((prev) => (prev === 0 ? ANGLES_360.length - 1 : prev - 1));
      } else {
        // Drag left -> rotate clockwise
        setCurrentAngleIndex((prev) => (prev + 1) % ANGLES_360.length);
      }
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const activeAngleData = ANGLES_360[currentAngleIndex];
  const activeProduct = SALON_PRODUCTS.find(p => p.id === activeAngleData.hotspot.productId) || SALON_PRODUCTS[0];

  // AI Multimodal analysis simulator with instant styling guidance
  const runAiAnalysis = () => {
    setAiAnalysisRunning(true);
    setTimeout(() => {
      setAiReport({
        style: 'High Taper Fade & Custom Geometric Braids',
        morphology: 'Idéal pour visages ovales, carrés ou rectangulaires. Allonge la ligne du menton et souligne les pommettes.',
        routine: [
          'Hydratation quotidienne avec l\'Élixir Argan & Eucalyptus (3 gouttes).',
          'Application de la Pâte Matifiante sur les pointes pour conserver une texture nette sans alourdir.',
          'Brossage au poil de sanglier doux pour répartir le sébum naturel sans fragiliser les contours.'
        ],
        recommendedCut: 'The Signature Master Combo: Cut + Beard ($55)'
      });
      setAiAnalysisRunning(false);
    }, 1200);
  };

  return (
    <div className="bg-[#0D0D10] text-gray-100 rounded-2xl border border-gold/30 shadow-2xl overflow-hidden max-w-4xl mx-auto my-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="bg-[#141418] px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
            <Rotate3d className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-serif text-white tracking-wide">
                Studio 360° IA & Détail des Produits
              </h2>
              <span className="bg-gold/20 text-gold border border-gold/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                IA & 360°
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Faites tourner la coupe, explorez les angles et découvrez les produits utilisés
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Left side 360 visualizer, Right side Product details & AI analysis */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* LEFT COLUMN: 360 VIEWPORT (7 Cols) */}
        <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative select-none">
          {/* Angle Pill & Controls */}
          <div className="flex items-center justify-between mb-3 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-gold font-mono text-xs font-bold border border-gold/30">
                {activeAngleData.label}
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                {activeAngleData.sublabel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAutoSpinning(!isAutoSpinning)}
              className={`text-xs font-mono px-3 py-1 rounded-full flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAutoSpinning
                  ? 'bg-gold text-black font-bold border-gold shadow-md'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-gold/40'
              }`}
            >
              {isAutoSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoSpinning ? 'Pause 360°' : 'Auto 360°'}</span>
            </button>
          </div>

          {/* 360 Image Stage with Drag / Swipe */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-white/15 cursor-grab active:cursor-grabbing shadow-inner group"
            title="Glissez vers la gauche ou la droite pour faire tourner à 360°"
          >
            <img
              src={activeAngleData.image}
              alt={`Coupe sous angle ${activeAngleData.label}`}
              className="w-full h-full object-cover pointer-events-none transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            {/* Interactive Hotspot Pin on the Haircut */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(activeProduct);
              }}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/pin"
              style={{ left: `${activeAngleData.hotspot.x}%`, top: `${activeAngleData.hotspot.y}%` }}
            >
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-gold/40 animate-ping" />
                <div className="relative w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center font-bold text-xs shadow-xl border border-white">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-gold/40 text-[11px] font-mono text-white whitespace-nowrap shadow-xl">
                <span className="text-gold font-bold">{activeAngleData.hotspot.title}</span>
                <span className="block text-[9px] text-gray-400">Toucher pour voir le produit</span>
              </div>
            </div>

            {/* Bottom drag hint */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-gray-300 pointer-events-none">
              <span className="bg-black/70 px-2 py-0.5 rounded border border-white/10">
                ⟵ Glisser pour faire pivoter 360° ⟶
              </span>
              <span className="bg-black/70 px-2 py-0.5 rounded border border-white/10 text-gold">
                Angle: {activeAngleData.angle}°
              </span>
            </div>
          </div>

          {/* Angle quick selectors */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {ANGLES_360.map((item, idx) => (
              <button
                key={item.angle}
                type="button"
                onClick={() => {
                  setCurrentAngleIndex(idx);
                  setIsAutoSpinning(false);
                }}
                className={`text-center py-2 px-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  currentAngleIndex === idx
                    ? 'bg-gold/20 border-gold text-gold font-bold shadow-sm'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold">{item.angle}°</div>
                <div className="text-[10px] text-gray-400 truncate">{item.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT USED & AI ANALYSIS (5 Cols) */}
        <div className="md:col-span-5 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-[#111115]">
          {/* Section 1: Active Product Breakdown */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                Produit Utilisé sur cet Angle
              </span>
              <span className="text-xs font-mono text-gold font-bold">{activeProduct.price}</span>
            </div>

            <div className="bg-[#18181D] border border-gold/30 rounded-xl p-3.5 shadow-md">
              <div className="flex gap-3 mb-2">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-black flex-shrink-0">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-mono text-gold uppercase tracking-wider block font-semibold">
                    {activeProduct.badge}
                  </span>
                  <h3 className="text-xs font-bold text-white leading-snug">{activeProduct.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{activeProduct.category}</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed mb-2.5">
                {activeProduct.description}
              </p>

              <div className="space-y-1 mb-3">
                {activeProduct.benefits.slice(0, 2).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-300 font-mono">
                    <Check className="w-3 h-3 text-gold shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded bg-black/40 border border-white/5 text-[10px] text-gray-300">
                <strong className="text-gold font-mono block mb-0.5">Conseil de barbier :</strong>
                {activeProduct.howToUse}
              </div>
            </div>
          </div>

          {/* Section 2: AI Haircut Diagnostic & Routine */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Diagnostic IA 360°
              </span>

              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={aiAnalysisRunning}
                className="bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-[10px] font-mono font-bold py-1 px-2.5 rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                <span>{aiAnalysisRunning ? 'Analyse en cours...' : 'Analyser le style'}</span>
              </button>
            </div>

            {aiReport ? (
              <div className="bg-black/50 border border-gold/30 rounded-lg p-3 space-y-2 animate-in fade-in duration-300">
                <div>
                  <span className="text-[10px] font-mono text-gold font-bold uppercase block">Style Détecté</span>
                  <p className="text-xs font-bold text-white">{aiReport.style}</p>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {aiReport.morphology}
                </p>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono text-gold uppercase block mb-1">Prestation Recommandée</span>
                  <button
                    type="button"
                    onClick={() => onSelectServiceForBooking && onSelectServiceForBooking('The Signature Master Combo: Cut + Beard')}
                    className="w-full bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 text-xs font-mono font-bold py-2 px-2.5 rounded flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span>Réserver ce look ({aiReport.recommendedCut.split('(')[1]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-center">
                <p className="text-[11px] text-gray-400">
                  Cliquez sur <strong className="text-gold font-mono">Analyser le style</strong> pour obtenir le diagnostic morphologique et la formule de coupe sur-mesure.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

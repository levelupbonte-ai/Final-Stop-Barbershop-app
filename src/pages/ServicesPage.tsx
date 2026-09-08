import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  Clock, 
  Phone, 
  Scissors, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import CallShopModal from '../components/CallShopModal';

interface ServicesPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (serviceId?: string) => void;
  onNavigateToBarbers: () => void;
}

export const COMPLETE_SERVICES = [
  {
    id: 'fade',
    name: 'Skin Fade & Precision Haircut',
    price: '$35',
    duration: '35 min',
    badge: 'Plus Demandé',
    description: 'Dégradé à blanc millimétré sur mesure adapté à votre morphologie crânienne, avec finition au rasoir coupe-chou et talc protecteur.',
    inclusions: [
      'Consultation morphologique du visage',
      'Dégradé à blanc américain (Low, Mid, High, Taper Fade)',
      'Contours au rasoir droit et finitions au shaver',
      'Coiffage avec texture ou cire mate haut de gamme'
    ]
  },
  {
    id: 'barbe',
    name: 'Sculpture Barbe & Rasage Chaud Traditionnel',
    price: '$25',
    duration: '30 min',
    badge: 'Artisanat Pur',
    description: 'Taille architecturale de la barbe, rituel double serviette chaude imprégnée d’eucalyptus et rasage au coupe-chou avec mousse onctueuse.',
    inclusions: [
      'Taille et désépaississement de la barbe aux ciseaux/tondeuse',
      'Double rituel serviette chaude vapeur eucalyptus',
      'Lignes de joues et cou taillées au rasoir traditionnel',
      'Massage réparateur avec huile et baume nourrissants'
    ]
  },
  {
    id: 'combo',
    name: 'The Signature Master Combo : Coupe + Barbe',
    price: '$55',
    duration: '60 min',
    badge: 'Meilleure Expérience',
    description: 'L’expérience complète Final Stop. Votre coupe de précision accompagnée du rituel complet de sculpture de barbe par nos barbiers de 20 ans d’expérience.',
    inclusions: [
      'Coupe sur mesure & Skin Fade complet',
      'Sculpture de barbe et dégradé barbe/cheveux',
      'Double rituel serviette chaude et vapeur',
      'Finitions au rasoir, après-rasage rafraîchissant & coiffage'
    ]
  },
  {
    id: 'braids',
    name: 'Custom Braids & Cornrows (Tresses Homme)',
    price: '$65+',
    duration: '60-90 min',
    badge: 'Spécialité Lusca',
    description: 'Création de motifs tressés géométriques ultra-nets, tension protectrice pour préserver les racines et soin hydratant du cuir chevelu.',
    inclusions: [
      'Séparation géométrique au peigne fin ultra-précis',
      'Tressage régulier à tension contrôlée (sans douleur)',
      'Application d’edge control organique pour une tenue prolongée',
      'Mousse fixante et brumisation hydratante'
    ]
  },
  {
    id: 'dreads',
    name: 'Dreadlocks & Full Retwist Complet',
    price: '$75+',
    duration: '90 min',
    badge: 'Texture & Locs',
    description: 'Nettoyage en profondeur, reprise des repousses au palm-rolling avec gels botaniques et huiles fortifiantes pour des locks saines.',
    inclusions: [
      'Shampoing purifiant spécial locks (élimination des résidus)',
      'Retwist méticuleux racine par racine',
      'Séchage sous casque tiède pour fixation optimale',
      'Huile d’argan et ricin pour brillance naturelle'
    ]
  },
  {
    id: 'vip',
    name: 'Expérience VIP Prestige : Soin Visage, Coupe & Barbe',
    price: '$90',
    duration: '90 min',
    badge: 'Privilège Absolu',
    description: 'Le soin total du gentleman. Masque purifiant visage, bain de vapeur, coupe haute couture, rituel barbe et massage crânien.',
    inclusions: [
      'Nettoyage visage & gommage purifiant sous vapeur',
      'Masque détoxifiant et serviette glacée resserrante',
      'Coupe complète précision & barbe au coupe-chou',
      'Massage bien-être trapèzes et cuir chevelu'
    ]
  }
];

export default function ServicesPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: ServicesPageProps) {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      
      {/* Header */}
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
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-sm"
            >
              <span>Voir Mika & Lusca (20+ ans)</span>
              <ChevronRight className="w-3.5 h-3.5 text-gold" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Prendre RDV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Tarifs & Prestations Complètes
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            L'Excellence du Soin Masculin à San Diego
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Des tarifs transparents, sans frais cachés, pour des prestations exécutées par des barbiers cumulant plus de 20 ans de pratique. Paiement sur place au salon après votre prestation.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {COMPLETE_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-[#141418] border border-white/10 hover:border-gold/60 transition-all p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {service.badge && (
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-2.5 py-0.5 mb-2">
                        {service.badge}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                      {service.name}
                    </h2>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-gold block">
                      {service.price}
                    </span>
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{service.duration}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Inclusions List */}
                <div className="space-y-2.5 mb-6 pt-4 border-t border-white/5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-gold font-bold block mb-2">
                    Inclus dans la formule :
                  </span>
                  {service.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book CTA */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">
                  Paiement sur place après prestation
                </span>

                <button
                  type="button"
                  onClick={() => onNavigateToBooking(service.id)}
                  className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
                >
                  Choisir cette formule &rarr;
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

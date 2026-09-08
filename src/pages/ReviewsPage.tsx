import { useState } from 'react';
import { ArrowLeft, Calendar, Phone, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import CallShopModal from '../components/CallShopModal';

interface ReviewsPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  onNavigateToBarbers: () => void;
}

const VERIFIED_REVIEWS = [
  {
    author: 'Marcus D.',
    role: 'Client régulier depuis 3 ans',
    barber: 'Mika (20+ ans)',
    rating: 5,
    date: 'Il y a 2 jours',
    text: 'Mika a plus de 20 ans d’expérience et cela se voit dès la première minute. Les dégradés sont d’une régularité incroyable, le salon est super propre et l’ambiance est au top.'
  },
  {
    author: 'Darnell W.',
    role: 'Client régulier',
    barber: 'Lusca (20+ ans)',
    rating: 5,
    date: 'Il y a 5 jours',
    text: 'Lusca est un véritable artisan de la barbe et des textures. 20 ans de métier qui se ressentent dans le calme, la précision et le rituel serviette chaude. Mes tresses et ma barbe n’ont jamais été aussi nettes.'
  },
  {
    author: 'Julien B.',
    role: 'Visiteur San Diego',
    barber: 'Mika',
    rating: 5,
    date: 'Il y a 1 semaine',
    text: 'De passage à San Diego, j’ai testé Final Stop sur recommandation. Réservation en ligne fluide, accueil parfait, et coupe au rasoir coupe-chou millimétrée. 10/10.'
  },
  {
    author: 'Antoine V.',
    role: 'Client fidèle',
    barber: 'Lusca',
    rating: 5,
    date: 'Il y a 2 semaines',
    text: 'Le rituel de soin à l’eucalyptus de Lusca est le meilleur moment de détente de ma semaine. Vous ne trouverez pas de barbiers avec ce niveau d’expérience ailleurs en ville.'
  },
  {
    author: 'Samir K.',
    role: 'Client régulier',
    barber: 'Mika',
    rating: 5,
    date: 'Il y a 3 semaines',
    text: 'Ponctualité, rigueur et précision. Mika ne rate jamais un trait. Rien à voir avec les chaînes de coiffure industrielles.'
  },
  {
    author: 'Cedric M.',
    role: 'Client locks & fade',
    barber: 'Lusca',
    rating: 5,
    date: 'Il y a 1 mois',
    text: 'Retwist de mes locks impeccable et contours parfaits. Lusca connaît parfaitement le cheveu afro et texturé.'
  }
];

export default function ReviewsPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: ReviewsPageProps) {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-1.5 text-gold mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-gold" />
            ))}
          </div>
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            5.0 Étoiles sur Google &bull; Plus de 450 Avis
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            La Confiance de Nos Clients à San Diego
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Découvrez pourquoi les résidents de San Diego confient leur style à Mika et Lusca depuis plus de 20 ans.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {VERIFIED_REVIEWS.map((rev, i) => (
            <div key={i} className="bg-[#141418] border border-white/10 p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-gold">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-gold" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{rev.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed italic mb-6">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{rev.author}</h4>
                  <span className="text-[10px] text-gray-400 block">{rev.role}</span>
                </div>
                <span className="text-[10px] font-mono text-gold font-bold bg-gold/10 px-2 py-0.5 border border-gold/30">
                  {rev.barber}
                </span>
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

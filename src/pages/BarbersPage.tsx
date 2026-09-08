import { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  ChevronRight, 
  Phone, 
  Scissors, 
  Star, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { MASTER_BARBERS } from '../data/barbers';
import CallShopModal from '../components/CallShopModal';

interface BarbersPageProps {
  onBackToHome: () => void;
  onSelectBarber: (barberId: 'mika' | 'lusca') => void;
  onNavigateToBooking: (barberId?: string) => void;
  onOpenWaitlist: (barberId?: string) => void;
}

export default function BarbersPage({
  onBackToHome,
  onSelectBarber,
  onNavigateToBooking,
  onOpenWaitlist
}: BarbersPageProps) {
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
              onClick={() => setIsCallModalOpen(true)}
              className="text-xs font-mono text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Ligne Directe: (619) 886-1267</span>
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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Maîtres Barbiers & Fondateurs
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Deux Artisans. Plus de 20 Ans d'Expérience Chacun.
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Chez Final Stop Barber Shop, chaque coup de ciseau et chaque tracé de lame s'appuie sur plus de deux décennies d'artisanat pur. Cliquez sur un barbier pour découvrir son univers, ses techniques et réserver votre fauteuil privé.
          </p>
        </div>

        {/* 2 Clickable Master Barber Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {MASTER_BARBERS.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#141418] border border-white/10 hover:border-gold transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-2xl group relative overflow-hidden cursor-pointer"
              onClick={() => onSelectBarber(barber.id)}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-gold/15 transition-colors pointer-events-none"></div>

              <div>
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#24242A] to-[#0A0A0B] border-2 border-gold/40 group-hover:border-gold flex flex-col items-center justify-center shadow-lg transition-colors">
                        <span className="text-2xl font-serif font-black text-gold tracking-wider">
                          {barber.initials}
                        </span>
                        <Scissors className="w-3.5 h-3.5 text-gold/70 mt-0.5" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-black border border-gold rounded-full p-1 text-gold">
                        <Award className="w-3 h-3" />
                      </div>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-gold uppercase tracking-wider bg-gold/10 px-2.5 py-0.5 mb-1">
                        <Award className="w-3 h-3" />
                        <span>20+ Ans d'Expérience</span>
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                        {barber.name}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {barber.role}
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-gold justify-end">
                      <Star className="w-3.5 h-3.5 fill-gold" />
                      <span className="text-xs font-bold text-white">5.0</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">350+ Avis Google</span>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-gold-light italic mb-4 font-serif">
                  "{barber.tagline}"
                </p>

                {/* Bio snippet */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  {barber.bio.substring(0, 165)}...
                </p>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {barber.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium tracking-wide bg-white/5 text-gray-300 px-2.5 py-1 border border-white/10 rounded-sm group-hover:border-gold/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer with Click Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Voir le profil complet & techniques</span>
                  <ChevronRight className="w-4 h-4" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToBooking(barber.id);
                  }}
                  className="bg-gold/10 hover:bg-gold text-gold hover:text-black border border-gold/40 text-xs font-bold px-3 py-1.5 uppercase tracking-wider transition-all"
                >
                  Réserver avec {barber.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Why 20+ Years Matters Section */}
        <div className="bg-[#121215] border border-white/10 p-6 sm:p-10 mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-gold font-mono text-[11px] uppercase tracking-widest font-bold block mb-1">
              L'Art de la Coupe
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Pourquoi l'expérience fait toute la différence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5 bg-[#17171C] border border-white/5">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Morphologie du Visage</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Après 20 ans de pratique, nous adaptons instantanément la hauteur du fondu et la taille de la barbe à la structure osseuse de votre tête.
              </p>
            </div>

            <div className="p-5 bg-[#17171C] border border-white/5">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Régularité Irréprochable</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pas de mauvaise surprise. Que vous veniez aujourd'hui ou dans 6 mois, vous obtenez exactement le standard d'excellence demandé.
              </p>
            </div>

            <div className="p-5 bg-[#17171C] border border-white/5">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Tous Types de Cheveux</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Lisses, ondulés, crépus, afros, locks ou tresses : plus de 20 ans permettent de maîtriser toutes les fibres sans abîmer le cuir chevelu.
              </p>
            </div>
          </div>
        </div>

      </main>

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}

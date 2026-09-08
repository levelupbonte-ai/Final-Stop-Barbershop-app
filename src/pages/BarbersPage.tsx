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
              onClick={() => setIsCallModalOpen(true)}
              className="text-xs font-mono text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Direct Line: (619) 886-1267</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Master Barbers & Co-Founders
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Two Craftsmen. Over 20 Years of Mastery Each.
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            At Final Stop Barber Shop, every scissor pass and straight razor stroke is grounded in more than two decades of dedicated craft. Click on either master barber to explore their signature styles and book your chair.
          </p>
        </div>

        {/* 2 Clickable Master Barber Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {MASTER_BARBERS.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#141418] border border-white/10 hover:border-gold transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-2xl group relative overflow-hidden cursor-pointer rounded-sm"
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
                        <span>20+ Yrs Experience</span>
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
                    <span className="text-[10px] text-gray-500 font-mono">380+ Google Reviews</span>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-gold-light italic mb-4 font-serif">
                  "{barber.tagline}"
                </p>

                {/* Bio snippet */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  {barber.bio.substring(0, 180)}...
                </p>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {barber.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono tracking-wide bg-white/5 text-gray-300 px-2.5 py-1 border border-white/10 rounded-sm group-hover:border-gold/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer with Click Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Full Profile & Techniques</span>
                  <ChevronRight className="w-4 h-4" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToBooking(barber.id);
                  }}
                  className="bg-gold/10 hover:bg-gold text-gold hover:text-black border border-gold/40 text-xs font-bold px-3 py-1.5 uppercase tracking-wider transition-all cursor-pointer rounded-xs"
                >
                  Book with {barber.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Why 20+ Years Matters Section */}
        <div className="bg-[#121215] border border-white/10 p-6 sm:p-10 mb-12 rounded-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-gold font-mono text-[11px] uppercase tracking-widest font-bold block mb-1">
              The Art of Barbering
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Why Two Decades of Experience Matters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5 bg-[#17171C] border border-white/5 rounded-xs">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Facial Bone Architecture</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                With 20+ years behind the chair, we calculate fade gradients and beard symmetry precisely matched to your cranial structure.
              </p>
            </div>

            <div className="p-5 bg-[#17171C] border border-white/5 rounded-xs">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Unwavering Consistency</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                No bad days, no rushed appointments. You get the same elite caliber of finish on every single visit.
              </p>
            </div>

            <div className="p-5 bg-[#17171C] border border-white/5 rounded-xs">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">All Hair Types & Textures</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Straight, wavy, coarse, curly, locs, or braids: complete mastery across all ethnic hair textures without scalp damage.
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

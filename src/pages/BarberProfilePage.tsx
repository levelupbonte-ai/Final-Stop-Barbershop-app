import { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  Check, 
  Clock, 
  Phone, 
  Scissors, 
  Star, 
  ShieldCheck, 
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import { MASTER_BARBERS } from '../data/barbers';
import CallShopModal from '../components/CallShopModal';
import ImageLightboxModal, { LightboxImageItem } from '../components/ImageLightboxModal';

interface BarberProfilePageProps {
  barberId: 'mika' | 'lusca';
  onBack?: () => void;
  onBackToHome?: () => void;
  onNavigateToBooking: (barberId?: string, service?: string) => void;
  onOpenWaitlist: (barberId?: string) => void;
  onSelectBarber?: (barberId: 'mika' | 'lusca') => void;
  onSwitchBarber?: (barberId: 'mika' | 'lusca') => void;
}

export default function BarberProfilePage({
  barberId,
  onBack,
  onBackToHome,
  onNavigateToBooking,
  onOpenWaitlist,
  onSelectBarber,
  onSwitchBarber
}: BarberProfilePageProps) {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LightboxImageItem | null>(null);

  const barber = MASTER_BARBERS.find(b => b.id === barberId) || MASTER_BARBERS[0];
  const handleBack = onBackToHome || onBack || (() => {});
  const handleSelectBarber = onSwitchBarber || onSelectBarber || (() => {});
  const otherBarber = MASTER_BARBERS.find(b => b.id !== barber.id) || MASTER_BARBERS[1];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      
      {/* Top Breadcrumb Header - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Barbers & Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectBarber(otherBarber.id)}
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-sm cursor-pointer bg-transparent"
            >
              <span>View {otherBarber.name}'s Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-gold" />
            </button>

            <button
              type="button"
              onClick={() => setIsCallModalOpen(true)}
              className="text-xs font-mono text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            >
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span className="hidden md:inline">(619) 886-1267</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        
        {/* Barber Hero Presentation */}
        <div className="bg-[#121215] border border-white/10 p-6 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative z-10">
            
            {/* Barber Avatar & Experience Badge */}
            <div className="flex flex-col items-center sm:items-start shrink-0 mx-auto sm:mx-0">
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-[#24242A] via-[#161619] to-[#0A0A0B] border-2 border-gold flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-3xl sm:text-4xl font-serif font-black text-gold tracking-wider">
                    {barber.initials}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-gold/80">
                    <Scissors className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Master</span>
                  </div>
                </div>

                <div className="absolute -bottom-2 -right-2 bg-black border border-gold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Award className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wide">
                    20+ Yrs Experience
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="mt-5 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                  ))}
                </div>
                <span className="text-xs font-bold text-white">5.0</span>
                <span className="text-[10px] text-gray-400">(Google Verified)</span>
              </div>
            </div>

            {/* Barber Header Details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{barber.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-2">
                {barber.name}
              </h1>

              <p className="text-base sm:text-lg text-gold font-medium mb-3">
                {barber.role} &bull; <span className="text-white font-bold">{barber.experience}</span>
              </p>

              <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed mb-6">
                {barber.bio}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToBooking(barber.id)}
                  className="bg-gold hover:bg-gold-light text-black text-xs sm:text-sm font-bold uppercase tracking-widest px-6 py-3.5 flex items-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer rounded-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment with {barber.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenWaitlist(barber.id)}
                  className="bg-[#1C1C22] hover:bg-[#25252D] text-white border border-white/20 text-xs sm:text-sm font-semibold uppercase tracking-wider px-5 py-3.5 flex items-center gap-2 transition-all cursor-pointer rounded-sm"
                >
                  <Clock className="w-4 h-4 text-gold" />
                  <span>Join Live Walk-In Queue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(true)}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold px-4 py-3.5 flex items-center gap-2 transition-all cursor-pointer rounded-sm"
                >
                  <Phone className="w-4 h-4 text-gold" />
                  <span>Call Shop</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Highlights & Master Expertise (20+ Years) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Left: 20+ Years Points */}
          <div className="bg-[#121215] border border-white/10 p-6 sm:p-8">
            <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block mb-2">
              Heritage & Craftsmanship
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
              20+ Years of Mastery: Cornerstones of Excellence
            </h2>

            <div className="space-y-4">
              {barber.highlights.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
              {barber.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-white/5 text-gray-300 px-3 py-1.5 border border-white/10 rounded-sm font-medium font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Signature Techniques */}
          <div className="bg-[#121215] border border-white/10 p-6 sm:p-8">
            <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block mb-2">
              Master Techniques
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
              {barber.name}'s Signature Methods
            </h2>

            <div className="space-y-5">
              {barber.signatureTechniques.map((tech, idx) => (
                <div key={idx} className="p-4 bg-[#17171C] border border-white/5 rounded-sm">
                  <h3 className="text-sm font-bold text-gold flex items-center gap-2 mb-1">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>{tech.title}</span>
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Portfolio Cuts by This Barber - Clickable with Modal */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <div>
              <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
                Signature Portfolio
              </span>
              <h2 className="text-2xl font-serif font-bold text-white">
                Featured Styles Handcrafted by {barber.name}
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">
              (Click image to inspect technique)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {barber.portfolioCuts.map((cut, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage({
                  src: cut.image,
                  alt: cut.title,
                  title: cut.title,
                  category: cut.tag,
                  barber: `${barber.name} (20+ Yrs Experience)`,
                  description: cut.description,
                })}
                className="group bg-[#151518] border border-white/10 hover:border-gold/60 overflow-hidden shadow-xl cursor-pointer transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-black">
                  <img 
                    src={cut.image} 
                    alt={cut.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm border border-gold/40 text-gold text-[10px] font-mono px-2.5 py-1 font-bold uppercase tracking-wider">
                    {cut.tag}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gold border border-white/10">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white group-hover:text-gold transition-colors">
                    {cut.title}
                  </h3>
                  <span className="text-[11px] text-gold/90 group-hover:text-gold flex items-center gap-1 font-mono">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Reviews for this Barber */}
        <div className="bg-[#121215] border border-white/10 p-6 sm:p-8 mb-12">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <div>
              <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
                Verified Client Feedback
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                What Clients Say About {barber.name}
              </h2>
            </div>
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {barber.clientReviews.map((rev, idx) => (
              <div key={idx} className="bg-[#17171C] border border-white/5 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{rev.author}</span>
                  <span className="text-[11px] text-gray-400 font-mono">{rev.date}</span>
                </div>
                <div className="flex text-gold mb-2">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-gold" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Booking Callout */}
        <div className="bg-gradient-to-r from-gold/20 via-[#1C1C22] to-gold/10 border border-gold/40 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-gold font-mono text-xs uppercase tracking-widest font-bold block mb-1">
              Guaranteed Private Chair
            </span>
            <h3 className="text-2xl font-serif font-bold text-white">
              Ready for your appointment with {barber.name}?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Reserve your exact time slot online or join our live walk-in waitlist queue.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToBooking(barber.id)}
              className="bg-gold hover:bg-gold-light text-black text-xs sm:text-sm font-bold uppercase tracking-widest px-6 py-3.5 shadow-lg active:scale-95 cursor-pointer rounded-sm"
            >
              Book Now
            </button>
            <button
              type="button"
              onClick={() => handleSelectBarber(otherBarber.id)}
              className="bg-[#151518] hover:bg-white/10 text-white border border-white/20 text-xs sm:text-sm font-semibold uppercase tracking-wider px-5 py-3.5 cursor-pointer rounded-sm"
            >
              Explore {otherBarber.name}'s Profile &rarr;
            </button>
          </div>
        </div>

      </main>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        image={selectedImage}
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onBookStyle={(style, bName) => {
          setSelectedImage(null);
          onNavigateToBooking(barber.id, style);
        }}
      />

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}

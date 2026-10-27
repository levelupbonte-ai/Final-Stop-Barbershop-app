import { useState } from 'react';
import { 
  Calendar, 
  Check, 
  Clock, 
  Phone, 
  Scissors, 
  ShieldCheck, 
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import CallShopModal from '../../components/CallShopModal';
import ImageLightboxModal, { LightboxImageItem } from '../../components/ImageLightboxModal';

interface BarberProfilePageProps {
  barberId: string;
  onBack?: () => void;
  onBackToHome?: () => void;
  onNavigateToBooking: (barberId?: string, service?: string) => void;
  onOpenWaitlist: (barberId?: string) => void;
  onSelectBarber?: (barberId: string) => void;
  onSwitchBarber?: (barberId: string) => void;
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

  const { barbers: MASTER_BARBERS } = useSiteData();
  const barber = MASTER_BARBERS.find(b => b.id === barberId) || MASTER_BARBERS[0];
  const handleBack = onBackToHome || onBack || (() => {});
  const handleSelectBarber = onSwitchBarber || onSelectBarber || (() => {});
  const otherBarber = MASTER_BARBERS.find(b => b.id !== barber?.id) ?? null;

  if (!barber) {
    return (
      <div className="pt-36 pb-24 text-gray-200 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-400">This profile is not available.</p>
        <button
          type="button"
          onClick={handleBack}
          className="btn-gold rounded-full! text-xs px-6 py-3"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 w-full font-sans">
      {/* Barber Hero Presentation Vessel */}
      <div className="card-luxury rounded-[2.75rem]! p-7 sm:p-11 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative z-10">
          {/* Barber Circular Medallion & Verified Rating */}
          <div className="flex flex-col items-center sm:items-start shrink-0 mx-auto sm:mx-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#24242A] via-[#161619] to-[#0A0A0B] border-2 border-gold flex flex-col items-center justify-center shadow-2xl">
              <span className="text-3xl sm:text-4xl font-serif font-black text-gold tracking-wider">
                {barber.initials}
              </span>
              <div className="flex items-center gap-1 mt-1 text-gold/80">
                <Scissors className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Master</span>
              </div>
            </div>

            <div className="mt-4 text-center sm:text-left">
              <span className="text-xs font-bold text-gold block tabular-nums">5.0 / 5.0</span>
              <span className="text-[10px] text-gray-400 font-mono">Google Verified</span>
            </div>
          </div>

          {/* Barber Header Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-2">
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

            {/* Action Pill Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
              <button
                type="button"
                onClick={() => onNavigateToBooking(barber.id)}
                className="btn-gold rounded-full! text-xs px-6 py-3.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book with {barber.name}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenWaitlist(barber.id)}
                className="btn-obsidian rounded-full! text-xs px-5 py-3.5"
              >
                <Clock className="w-4 h-4 text-gold" />
                <span>Join Live Walk-In Queue</span>
              </button>

              <a
                href={`tel:${barber.phoneRaw}`}
                className="btn-outline-gold rounded-full! text-xs px-5 py-3.5 font-mono"
                title={`Call ${barber.name} directly`}
              >
                <Phone className="w-4 h-4" />
                <span>Call {barber.name}: {barber.phone}</span>
              </a>

              {otherBarber && (
                <button
                  type="button"
                  onClick={() => handleSelectBarber(otherBarber.id)}
                  className="text-gray-400 hover:text-gold text-xs px-3 py-3.5 flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <span>View {otherBarber.name}&apos;s Profile</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gold" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Highlights & Master Expertise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        {/* Left: Master Craft Points */}
        <div className="card-luxury rounded-[2.25rem]! p-7 sm:p-9">
          <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block mb-2">
            Heritage &amp; Craftsmanship
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
            Cornerstones of Excellence
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

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-gray-300">
            {barber.tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-gold/50">&middot;</span>}
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Signature Techniques */}
        <div className="card-luxury rounded-[2.25rem]! p-7 sm:p-9">
          <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block mb-2">
            Master Techniques
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
            {barber.name}&apos;s Signature Methods
          </h2>

          <div className="divide-y divide-white/[0.08]">
            {barber.signatureTechniques.map((tech, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
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

      {/* Portfolio Cuts by This Barber */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/10">
          <div>
            <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
              Signature Portfolio
            </span>
            <h2 className="text-2xl font-serif font-bold text-white">
              Featured Styles Handcrafted by {barber.name}
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">
            Click image to inspect technique
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {barber.portfolioCuts.map((cut, idx) => {
            const isArch = idx % 3 === 1;
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedImage({
                  src: cut.image,
                  alt: cut.title,
                  title: cut.title,
                  category: cut.tag,
                  barber: `${barber.name} (Master Barber)`,
                  description: cut.description,
                })}
                className={`group relative overflow-hidden shadow-xl cursor-pointer border border-white/10 hover:border-gold/60 transition-all duration-500 aspect-[4/5] bg-[#0E0D12] ${
                  isArch ? 'rounded-t-[9rem] rounded-b-[2.25rem]' : 'rounded-[2.25rem]'
                }`}
              >
                <img 
                  src={cut.image} 
                  alt={cut.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09080C] via-[#09080C]/25 to-transparent" />

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gold border border-white/15">
                  <ZoomIn className="w-4 h-4" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-gold uppercase tracking-wider block mb-1">
                      {cut.tag}
                    </span>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-gold transition-colors">
                      {cut.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-gold/90 group-hover:text-gold flex items-center gap-1 font-mono shrink-0">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Reviews for this Barber (Zero Star Icons) */}
      <div className="card-luxury rounded-[2.75rem]! p-7 sm:p-10 mb-14">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
              Verified Client Feedback
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              What Clients Say About {barber.name}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-gold tabular-nums">
            5.0 / 5.0 Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {barber.clientReviews.map((rev, idx) => (
            <div key={idx} className="rounded-[1.75rem] bg-white/[0.025] border border-white/[0.07] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{rev.author}</span>
                <span className="text-[11px] text-gold font-mono tabular-nums">{rev.rating}.0 / 5.0 &middot; {rev.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed italic font-serif">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Booking Callout */}
      <div className="card-luxury rounded-[2.5rem]! p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
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
            className="btn-gold rounded-full! text-xs px-7 py-3.5"
          >
            <span>Book Now</span>
          </button>
          {otherBarber && (
            <button
              type="button"
              onClick={() => handleSelectBarber(otherBarber.id)}
              className="btn-obsidian rounded-full! text-xs px-6 py-3.5"
            >
              <span>Explore {otherBarber.name}&apos;s Profile &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        image={selectedImage}
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onBookStyle={(style) => {
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

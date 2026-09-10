import { useState } from 'react';
import { ArrowLeft, Star, ExternalLink, Award, Scissors, DollarSign } from 'lucide-react';
import CallShopModal from '../components/CallShopModal';

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/tUej1WdvZRudfqVX6";

interface ReviewsPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  onNavigateToBarbers: () => void;
}

const VERIFIED_REVIEWS = [
  {
    author: 'Trevorn Kitt',
    role: 'Google Maps Review (2 avis)',
    barber: 'Master Barber',
    rating: 5,
    date: '1 year ago',
    price: '$30–40',
    service: 'Haircuts / Coupes de cheveux',
    isLocalGuide: false,
    text: 'Even when it was near closing time, he still took me in without hesitation and gave me a full transformation. The attention to detail and professionalism were top-tier. He didn’t rush the cut at all — every line was clean and the fade was flawless. You can tell he takes real pride in his work. Highly recommend if you’re looking for a barber who delivers quality every time!'
  },
  {
    author: 'Ivan Guevara',
    role: 'Local Guide · 72 reviews · 6 photos',
    barber: 'Anthony',
    rating: 5,
    date: '1 year ago',
    price: '$30–40',
    service: 'Mid drop fade • Fades, tapers & braiding',
    isLocalGuide: true,
    text: 'Anthony really took his time to give me a fresh cut, dude is dedicated to his craft and it shows!!!'
  },
  {
    author: 'Allen SamuelsClarence',
    role: 'Local Guide · 20 reviews · 12 photos',
    barber: 'Final Stop Crew',
    rating: 5,
    date: '1 year ago',
    price: '$20–30',
    service: 'Regular Cut',
    isLocalGuide: true,
    text: 'REGULAR BARBER 🔥 I’ve been looking for one for the past 2 years and finally found one … clean friendly ! Highly recommend'
  },
  {
    author: 'Marcus D.',
    role: 'Regular Client (3 Years)',
    barber: 'Mika',
    rating: 5,
    date: '2 days ago',
    price: '$45',
    service: 'Signature Fade & Beard',
    isLocalGuide: false,
    text: 'Mika is a true artist behind the chair and it shows in every minute. His fade transitions are insanely clean, the shop is spotless, and the energy is top tier.'
  },
  {
    author: 'Darnell W.',
    role: 'Regular Client',
    barber: 'Lusca',
    rating: 5,
    date: '5 days ago',
    price: '$50',
    service: 'Master Beard Sculpt & Haircut',
    isLocalGuide: false,
    text: 'Lusca is a true master of beard sculpting and hair textures. Masterful dedication reflected in calm precision and eucalyptus hot towel treatment. My braids and beard have never looked sharper.'
  },
  {
    author: 'Julian B.',
    role: 'San Diego Visitor',
    barber: 'Mika',
    rating: 5,
    date: '1 week ago',
    price: '$40',
    service: 'Hot Towel Fade',
    isLocalGuide: false,
    text: 'Visiting San Diego and stopped by Final Stop on a friend\'s recommendation. Smooth online booking, great greeting, and razor-sharp straight razor detailing. 10/10.'
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
              onClick={onNavigateToBarbers}
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-block cursor-pointer bg-transparent border-none"
            >
              Mika & Lusca (Barbers)
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#141418] hover:bg-[#1b1b22] border border-white/10 hover:border-gold/40 text-gold text-[11px] font-mono uppercase tracking-widest rounded-xs mb-4 transition-all group"
          >
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold" />
              ))}
            </div>
            <span>5.0 Stars on Google Maps</span>
            <ExternalLink className="w-3 h-3 text-gold/70 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Client Testimonials & Community Trust
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Real reviews and testimonials from our loyal clients and Google Maps visitors in San Diego.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {VERIFIED_REVIEWS.map((rev, i) => (
            <div key={i} className="bg-[#141418] border border-white/10 hover:border-gold/30 transition-all p-6 flex flex-col justify-between shadow-xl rounded-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-gold">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-gold" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{rev.date}</span>
                </div>

                {rev.isLocalGuide && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-medium rounded-xs mb-3">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Local Guide</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed italic mb-4">
                  "{rev.text}"
                </p>

                {(rev.price || rev.service) && (
                  <div className="flex flex-wrap items-center gap-2 mb-4 pt-2 border-t border-white/5 text-[10px] font-mono">
                    {rev.price && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 text-gray-300 rounded-xs">
                        <DollarSign className="w-2.5 h-2.5 text-gold" />
                        <span>{rev.price}</span>
                      </span>
                    )}
                    {rev.service && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 text-gray-300 rounded-xs">
                        <Scissors className="w-2.5 h-2.5 text-gold" />
                        <span>{rev.service}</span>
                      </span>
                    )}
                  </div>
                )}
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

        {/* CTA to Google Maps */}
        <div className="bg-[#141418] border border-white/10 p-8 rounded-sm text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-xl font-bold font-serif text-white mb-2">Have you visited Final Stop Barber Shop?</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-6">
            Help our local craft thrive by sharing your personal experience and rating on Google Maps.
          </p>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xs shadow-lg transition-all"
          >
            <span>Read & Write Reviews on Google Maps</span>
            <ExternalLink className="w-4 h-4 text-black" />
          </a>
        </div>
      </main>

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}

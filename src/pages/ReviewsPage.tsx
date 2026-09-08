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
    role: 'Regular Client (3 Years)',
    barber: 'Mika (20+ Yrs)',
    rating: 5,
    date: '2 days ago',
    text: 'Mika has over 20 years behind the chair and it shows in every minute. His fade transitions are insanely clean, the shop is spotless, and the energy is top tier.'
  },
  {
    author: 'Darnell W.',
    role: 'Regular Client',
    barber: 'Lusca (20+ Yrs)',
    rating: 5,
    date: '5 days ago',
    text: 'Lusca is a true master of beard sculpting and hair textures. 20 years of dedication reflected in calm precision and eucalyptus hot towel treatment. My braids and beard have never looked sharper.'
  },
  {
    author: 'Julian B.',
    role: 'San Diego Visitor',
    barber: 'Mika (20+ Yrs)',
    rating: 5,
    date: '1 week ago',
    text: 'Visiting San Diego and stopped by Final Stop on a friend\'s recommendation. Smooth online booking, great greeting, and razor-sharp straight razor detailing. 10/10.'
  },
  {
    author: 'Anthony V.',
    role: 'Loyal Client',
    barber: 'Lusca (20+ Yrs)',
    rating: 5,
    date: '2 weeks ago',
    text: 'Lusca\'s eucalyptus hot towel ritual is the most therapeutic part of my week. You simply will not find barbers with this level of tenure and craft anywhere else in SD.'
  },
  {
    author: 'Samir K.',
    role: 'Regular Client',
    barber: 'Mika (20+ Yrs)',
    rating: 5,
    date: '3 weeks ago',
    text: 'Punctuality, precision, and consistency. Mika never misses a line. Night and day compared to industrial barber franchises.'
  },
  {
    author: 'Cedric M.',
    role: 'Locs & Fade Client',
    barber: 'Lusca (20+ Yrs)',
    rating: 5,
    date: '1 month ago',
    text: 'Impeccable loc retwist and hairline line-up. Lusca knows textured and afro hair inside and out.'
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
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBarbers}
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-block cursor-pointer bg-transparent border-none"
            >
              Mika & Lusca (20+ Yrs)
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
          <div className="flex items-center justify-center gap-1.5 text-gold mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-gold" />
            ))}
          </div>
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            5.0 Stars on Google &bull; Over 450 Reviews
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Client Testimonials & Community Trust
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Discover why San Diego residents have trusted their grooming and signature styles to Mika and Lusca for over two decades.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {VERIFIED_REVIEWS.map((rev, i) => (
            <div key={i} className="bg-[#141418] border border-white/10 p-6 flex flex-col justify-between shadow-xl rounded-sm">
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

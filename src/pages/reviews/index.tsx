import { useState } from 'react';
import { ArrowLeft, Star, ExternalLink, Award, Scissors, DollarSign } from 'lucide-react';
import CallShopModal from '../../components/CallShopModal';

import { useSiteData } from '../../lib/site/SiteDataProvider';

interface ReviewsPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  onNavigateToBarbers: () => void;
}


export default function ReviewsPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: ReviewsPageProps) {
  const { reviews: VERIFIED_REVIEWS, site, barbers } = useSiteData();
  const GOOGLE_MAPS_URL = site.contact.mapsUrl || undefined;
  const teamNames = barbers.map((b) => b.name).join(' & ');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans">
      {/* Header - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#09090B]/95 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg">
        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="btn-obsidian text-xs px-3.5 py-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToBarbers}
              className="btn-obsidian text-xs px-3.5 py-2 hidden sm:inline-flex"
            >
              <span>{teamNames}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="btn-gold text-xs px-4 py-2"
            >
              <span>Book Appointment</span>
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
            <span>5.0 / 5.0 Verified on Google Maps</span>
            <ExternalLink className="w-3 h-3 text-gold/70 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Client Testimonials &amp; Community Trust
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
                  <span className="text-xs font-mono font-bold text-gold">
                    {rev.rating}.0 / 5.0
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">{rev.date}</span>
                </div>

                {rev.isLocalGuide && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-medium rounded-xs mb-3">
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

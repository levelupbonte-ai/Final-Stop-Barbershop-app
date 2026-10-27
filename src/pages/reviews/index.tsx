import { ExternalLink, Scissors, DollarSign, Quote } from 'lucide-react';
import { useSiteData } from '../../lib/site/SiteDataProvider';

interface ReviewsPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  onNavigateToBarbers: () => void;
}

export default function ReviewsPage(_props: ReviewsPageProps) {
  const { reviews: VERIFIED_REVIEWS, site } = useSiteData();
  const GOOGLE_MAPS_URL = site.contact.mapsUrl || undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 w-full font-sans">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gold text-[11px] font-mono uppercase tracking-[0.25em] mb-4 transition-all group"
        >
          <span>5.0 / 5.0 Verified on Google Maps</span>
          <ExternalLink className="w-3 h-3 text-gold/70 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
          Client Testimonials &amp; Community Trust
        </h1>
        <div className="divider-gold-fade max-w-xs mx-auto mb-4"></div>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Real reviews and testimonials from our loyal clients and Google Maps visitors in San Diego.
        </p>
      </div>

      {/* Sculptural Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-16">
        {VERIFIED_REVIEWS.map((rev, i) => (
          <div
            key={i}
            className={`card-luxury rounded-[2.25rem]! p-7 sm:p-8 flex flex-col justify-between ${
              i % 3 === 1 ? 'lg:-translate-y-3' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-gold/50" />
                  <span className="text-xs font-mono font-bold text-gold tabular-nums">
                    {rev.rating}.0 / 5.0
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{rev.date}</span>
              </div>

              {rev.isLocalGuide && (
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 mb-3">
                  Google Local Guide
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic font-serif mb-5">
                &ldquo;{rev.text}&rdquo;
              </p>

              {(rev.price || rev.service) && (
                <div className="flex flex-wrap items-center gap-3 mb-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-gray-400">
                  {rev.price && (
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5 text-gold" />
                      <span>{rev.price}</span>
                    </span>
                  )}
                  {rev.service && (
                    <span className="inline-flex items-center gap-1">
                      <Scissors className="w-2.5 h-2.5 text-gold" />
                      <span>{rev.service}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{rev.author}</h4>
                <span className="text-[10px] text-gray-400 block">{rev.role}</span>
              </div>
              <span className="text-[10px] font-mono text-gold font-bold uppercase tracking-wider">
                {rev.barber}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Curved CTA to Google Maps */}
      <div className="card-luxury rounded-[2.5rem]! p-8 sm:p-10 text-center max-w-2xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mb-2">
          Have You Visited Final Stop Barber Shop?
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-6">
          Help our local craft thrive by sharing your personal experience and rating on Google Maps.
        </p>
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold rounded-full! text-xs px-7 py-3.5"
        >
          <span>Read &amp; Write Reviews on Google Maps</span>
          <ExternalLink className="w-4 h-4 text-black" />
        </a>
      </div>
    </div>
  );
}

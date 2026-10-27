import { ExternalLink, MessageSquarePlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteData } from '../lib/site/SiteDataProvider';

const AVATAR_COLORS = ['bg-[#1E3A8A]', 'bg-[#B45309]', 'bg-[#065F46]', 'bg-[#7C2D12]', 'bg-[#4C1D95]'];

export default function Testimonials() {
  const { reviews: allReviews, site } = useSiteData();
  const GOOGLE_MAPS_URL = site.contact.mapsUrl || undefined;
  const reviews = allReviews.slice(0, 3).map((r, i) => ({
    name: r.author,
    subtitle: r.role,
    date: r.date,
    content: r.text,
    rating: r.rating,
    price: r.price,
    service: r.service,
    barberMention: r.barber,
    isLocalGuide: r.isLocalGuide,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length]
  }));

  return (
    <section id="testimonials" className="py-24 bg-[#0F0F10] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header & Google Badge (No Star Icons) */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center mb-16"
        >
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-obsidian px-4 py-2.5 mb-5 rounded-full! group"
            title="View live reviews on Google Maps"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span className="text-white text-xs font-bold tracking-wider uppercase group-hover:text-gold transition-colors">Google Maps Reviews</span>
            <span className="text-white/20">&middot;</span>
            <span className="text-gold font-bold text-xs tabular-nums">5.0 / 5.0 Verified</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gold transition-colors ml-0.5" />
          </a>

          <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight mb-4 text-white">
            Client <span className="font-serif italic font-bold text-gold">Testimonials</span>
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Authentic customer reviews pulled directly from our verified Google Maps business listing.
          </p>
        </motion.div>

        {/* Reviews Grid with Staggered Scroll Animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="card-luxury p-7 flex flex-col justify-between relative group hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-gold uppercase tracking-widest">
                    {review.rating}.0 / 5.0 Verified
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    {review.date}
                  </span>
                </div>

                {review.isLocalGuide && (
                  <div className="inline-flex items-center gap-1.5 text-amber-400 text-[11px] font-medium mb-3">
                    <span>Verified Local Guide</span>
                  </div>
                )}
                
                <p className="text-gray-200 mb-6 italic font-serif text-sm sm:text-base leading-relaxed">
                  "{review.content}"
                </p>

                {/* Unboxed Service Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-6 pt-3 border-t border-white/8 text-[11px] font-mono text-gray-400">
                  {review.price && (
                    <span className="text-gray-300 tabular-nums">{review.price}</span>
                  )}
                  {review.price && review.service && <span className="text-gold/50">&middot;</span>}
                  {review.service && (
                    <span className="text-gray-300">{review.service}</span>
                  )}
                  {(review.price || review.service) && review.barberMention && <span className="text-gold/50">&middot;</span>}
                  {review.barberMention && (
                    <span className="text-gold font-semibold">Barber: {review.barberMention}</span>
                  )}
                </div>
              </div>
              
              {/* Reviewer info */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${review.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md rounded-full`}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm leading-snug">{review.name}</h4>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      {review.subtitle}
                    </span>
                  </div>
                </div>
                
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Google Maps"
                  className="opacity-60 group-hover:opacity-100 hover:scale-110 transition-all p-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons to Google Maps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-obsidian rounded-full! px-6 py-3.5 text-xs whitespace-nowrap"
          >
            <span>View All Reviews on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </a>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-gold rounded-full! px-6 py-3.5 text-xs whitespace-nowrap"
          >
            <MessageSquarePlus className="w-4 h-4 text-black" />
            <span>Leave a Google Review</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}

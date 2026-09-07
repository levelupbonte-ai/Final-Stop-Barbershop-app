import { Star, ExternalLink, MessageSquarePlus } from 'lucide-react';

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9";

export default function Testimonials() {
  const reviews = [
    {
      name: "Malik R.",
      date: "2 weeks ago",
      content: "Hands down one of the top barbershops in San Diego! The fade is razor sharp and the beard work is surgical precision. Great vibe, clean shop, and top hospitality.",
      rating: 5,
      avatarColor: "bg-[#1E3A8A]"
    },
    {
      name: "Derrick K.",
      date: "1 month ago",
      content: "Flawless service every single visit. The barber takes the time to listen and tailor the cut to perfection. Clean shop, great music, and on-time appointments. 100% recommended.",
      rating: 5,
      avatarColor: "bg-[#B45309]"
    },
    {
      name: "Anthony M.",
      date: "1 month ago",
      content: "Old-school barbershop hospitality with modern high-precision craft. The hot eucalyptus towel and straight razor neck shave are unbeatable. My regular go-to spot.",
      rating: 5,
      avatarColor: "bg-[#065F46]"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#0F0F10] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header & Google Badge */}
        <div className="flex flex-col items-center text-center mb-16">
          {/* Google Official Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#151517] border border-white/10 mb-4 shadow-lg">
            {/* Google G Multi-Color Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span className="text-white text-xs font-bold tracking-wider uppercase">Google Maps Reviews</span>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1">
              <span className="text-gold font-bold text-xs">5.0</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Client Testimonials
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Authentic feedback from our community, published directly on our official Google Business profile.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, i) => (
            <div 
              key={i} 
              className="bg-[#151517] p-8 border border-white/5 relative group hover:border-gold/30 transition-all flex flex-col justify-between"
            >
              {/* Header inside card: Stars & Google Badge */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    {review.date}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-8 italic font-serif text-base leading-relaxed">
                  "{review.content}"
                </p>
              </div>
              
              {/* Reviewer info */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${review.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{review.name}</h4>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified Google Review
                    </span>
                  </div>
                </div>
                
                <svg className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons to Google Maps */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#151517] hover:bg-white/10 text-white border border-white/20 hover:border-gold px-6 py-3.5 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95"
          >
            <span>View All Google Reviews</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </a>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black px-6 py-3.5 text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(197,160,89,0.3)] active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4 text-black" />
            <span>Write a Google Review</span>
          </a>
        </div>

      </div>
    </section>
  );
}

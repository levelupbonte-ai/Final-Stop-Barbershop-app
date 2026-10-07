import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  Clock, 
  Scissors, 
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import CallShopModal from '../components/CallShopModal';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface ServicesPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: (serviceId?: string) => void;
  onNavigateToBarbers: () => void;
}



export default function ServicesPage({
  onBackToHome,
  onNavigateToBooking,
  onNavigateToBarbers
}: ServicesPageProps) {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { services: OFFICIAL_SERVICES, barbers, site } = useSiteData();
  const CATEGORIES = ['All', ...Array.from(new Set(OFFICIAL_SERVICES.map((s) => s.category)))];

  const filteredServices = OFFICIAL_SERVICES.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              className="text-xs text-gray-400 hover:text-gold transition-colors hidden sm:inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-sm cursor-pointer bg-transparent"
            >
              <span>View {barbers.map((b) => b.name).join(' & ')} (Barbers)</span>
              <ChevronRight className="w-3.5 h-3.5 text-gold" />
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
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Official Shop Rates & Real Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Master Haircuts, Beard Care & Grooming
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Exact prices from our shop terminal with zero hidden fees. Pay upon service completion at {site.contact.address}.
          </p>
        </div>

        {/* Search & Category Tabs */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by haircut, beard, fade, lineup, shave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121215] border border-white/15 focus:border-gold pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 rounded-sm outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' 
                ? OFFICIAL_SERVICES.length 
                : OFFICIAL_SERVICES.filter(s => s.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-mono px-3.5 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gold text-black font-bold shadow-md'
                      : 'bg-[#141418] text-gray-400 border border-white/10 hover:text-white hover:border-white/30'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#141418] border border-white/10 hover:border-gold/60 transition-all p-6 flex flex-col justify-between shadow-2xl relative group rounded-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    {service.badge && (
                      <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 mb-1.5">
                        {service.badge}
                      </span>
                    )}
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                      {service.name}
                    </h2>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mt-0.5">
                      {service.category}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold font-mono text-gold block">
                      {service.price}
                    </span>
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{service.duration}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Inclusions List */}
                <div className="space-y-1.5 mb-5 pt-3 border-t border-white/5">
                  {service.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-gray-400">
                      <Check className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book CTA */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  Pay in shop &bull; No deposit
                </span>

                <button
                  type="button"
                  onClick={() => onNavigateToBooking(service.id)}
                  className="bg-gold hover:bg-gold-light text-black text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
                >
                  Book Service &rarr;
                </button>
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

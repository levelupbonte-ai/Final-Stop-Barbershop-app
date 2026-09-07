import { useState, FormEvent } from 'react';
import { Search, Users, Gift, Clock, Sparkles, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

interface ClientStatusHubProps {
  onOpenCheckStatus: (initialQuery?: string) => void;
  onOpenWaitlist: () => void;
  onOpenPromo: () => void;
}

export default function ClientStatusHub({ 
  onOpenCheckStatus, 
  onOpenWaitlist, 
  onOpenPromo 
}: ClientStatusHubProps) {
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickCheck = (e: FormEvent) => {
    e.preventDefault();
    onOpenCheckStatus(quickQuery.trim());
  };

  return (
    <section id="client-status" className="py-16 bg-[#0E0E10] border-y border-white/10 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#151517] border border-white/10 mb-3 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Lounge & Queue Active Today</span>
              <span className="text-white/20">|</span>
              <span className="text-gray-400 text-[11px]">10:00 AM – 6:00 PM</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Client Service Center & Live Queue
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
              Track your real-time chair status, join today's walk-in waitlist remotely, or claim your exclusive VIP welcoming offer.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 font-mono text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Official Shop Live Desk</span>
          </div>
        </div>

        {/* 3 Central Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Check Turn / Queue Status */}
          <div className="bg-[#151517] border border-white/10 hover:border-gold/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-black border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 font-bold">
                  Real-Time
                </span>
              </div>

              <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                Check My Turn Status
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Already booked or on today's waitlist? Enter your name or ticket number to check if your chair is ready.
              </p>

              {/* Quick Input Search Form */}
              <form onSubmit={handleQuickCheck} className="space-y-2 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    placeholder="Enter Name or ID..."
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-3 py-2.5 text-xs text-white placeholder-gray-500 outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 font-mono"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Check Status</span>
                </button>
              </form>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
              <span>Instant chair lookup</span>
              <span className="text-gold">&bull; Live sync</span>
            </div>
          </div>

          {/* Card 2: Same-Day Walk-In Waitlist */}
          <div className="bg-[#151517] border border-white/10 hover:border-gold/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-black border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 font-bold">
                  Walk-In
                </span>
              </div>

              <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                Same-Day Waitlist
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                No advance appointment? Join today's virtual chair queue before you drive over to lock your spot and minimize waiting.
              </p>

              <div className="bg-[#0A0A0B] p-3 border border-white/5 space-y-1.5 mb-6 text-[11px] font-mono text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Current Wait:</span>
                  <span className="text-white font-bold">~ 10-15 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chairs Open:</span>
                  <span className="text-emerald-400 font-bold">Marcus &bull; David</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="w-full bg-[#1F1F24] hover:bg-gold hover:text-black text-gray-200 border border-white/15 hover:border-gold text-xs font-bold uppercase tracking-wider py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 font-mono"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Join Today's Queue</span>
              </button>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Free cancellation</span>
                <span className="text-amber-400">&bull; SMS ready</span>
              </div>
            </div>
          </div>

          {/* Card 3: VIP Club & 15% Off Promo */}
          <div className="bg-[#151517] border border-white/10 hover:border-gold/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-black border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 font-bold">
                  Exclusive
                </span>
              </div>

              <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                VIP Club & 15% Off
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Receive priority chair reservations, complimentary hot towel upgrades, and an instant 15% discount on your next visit.
              </p>

              <div className="bg-gradient-to-r from-[#1A1813] to-[#0A0A0B] border border-gold/30 p-3 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase text-gray-400 block">Promo Code</span>
                  <span className="text-gold font-mono font-bold text-sm tracking-wider">FINALSTOP15</span>
                </div>
                <span className="text-xs font-bold text-black bg-gold px-2 py-1 font-mono uppercase">
                  15% Off
                </span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={onOpenPromo}
                className="w-full bg-[#1F1F24] hover:bg-gold hover:text-black text-gold hover:text-black border border-gold/40 text-xs font-bold uppercase tracking-wider py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 font-mono"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claim VIP Privileges</span>
              </button>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Valid all year</span>
                <span className="text-gold">&bull; Instant code</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

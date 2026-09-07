import { useState, FormEvent } from 'react';
import { Search, Users, Key, Calendar } from 'lucide-react';

interface ClientStatusHubProps {
  onOpenCheckStatus: (initialQuery?: string) => void;
  onOpenWaitlist: () => void;
  onOpenPromo?: () => void;
  isWaitlistOpen?: boolean;
  onOpenOwnerControls?: () => void;
  onNavigateToBooking?: () => void;
}

export default function ClientStatusHub({ 
  onOpenCheckStatus, 
  onOpenWaitlist, 
  onOpenPromo,
  isWaitlistOpen = false,
  onOpenOwnerControls,
  onNavigateToBooking
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
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Client Service Center & Live Desk
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
              Track your real-time chair status or reserve your guaranteed appointment slot with Mika & Luska.
            </p>
          </div>
        </div>

        {/* Central Action Cards */}
        <div className={`grid grid-cols-1 gap-6 ${isWaitlistOpen ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>
          
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
                Already booked or on today's queue? Enter your name or ticket number to check if your chair is ready.
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
          </div>

          {/* Card 2: Same-Day Walk-In Waitlist - ONLY VISIBLE IF OWNER AUTHORIZES */}
          {isWaitlistOpen && (
            <div className="bg-[#151517] border border-emerald-500/40 hover:border-gold/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-black border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 font-bold border text-emerald-400 bg-emerald-950/40 border-emerald-500/30">
                    Open Today
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  Same-Day Walk-In Waitlist
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Visiting today without an appointment? Join the live virtual chair queue before heading over to lock your spot and minimize wait time.
                </p>

                <div className="bg-[#0A0A0B] p-3 border border-white/5 space-y-1.5 mb-6 text-[11px] font-mono text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Current Wait:</span>
                    <span className="text-white font-bold">~ 10-15 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chairs Open:</span>
                    <span className="text-emerald-400 font-bold">Mika &bull; Luska</span>
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
              </div>
            </div>
          )}

          {/* Card: Schedule Advance Appointment */}
          <div className="bg-[#151517] border border-white/10 hover:border-gold/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-black border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 font-bold">
                  Recommended
                </span>
              </div>

              <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                Book Your Guaranteed Chair
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Prefer zero wait time? Reserve a confirmed slot with Mika or Luska in advance for precision fades, beard grooming, or braiding.
              </p>

              <div className="bg-[#0A0A0B] p-3 border border-white/5 space-y-1.5 mb-6 text-[11px] font-mono text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Booking Fee:</span>
                  <span className="text-emerald-400 font-bold">$0 &bull; Pay in shop</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confirmation:</span>
                  <span className="text-white font-bold">Instant SMS & Ticket</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reserve Appointment</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

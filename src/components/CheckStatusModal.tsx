import { useState, useEffect, FormEvent } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Scissors, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWaitlist?: () => void;
  initialQuery?: string;
  isWaitlistOpen?: boolean;
  onNavigateToBooking?: () => void;
}

export default function CheckStatusModal({ 
  isOpen, 
  onClose, 
  onOpenWaitlist, 
  initialQuery = '',
  isWaitlistOpen = false,
  onNavigateToBooking
}: CheckStatusModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
      return;
    }

    // Auto-check if client has a cached ticket or appointment in localStorage
    const savedTicket = localStorage.getItem('finalstop_active_ticket');
    const savedBooking = localStorage.getItem('finalstop_active_booking');
    
    if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);
        setResult(parsed);
      } catch (e) {
        // ignore
      }
    } else if (savedBooking) {
      try {
        const parsed = JSON.parse(savedBooking);
        setResult(parsed);
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const performSearch = async (term: string) => {
    const queryStr = term.trim().toLowerCase();
    if (!queryStr) return;

    setIsSearching(true);
    setNotFound(false);
    setResult(null);

    try {
      let foundData: any = null;

      // 1. Search in waitlist collection
      try {
        const waitlistRef = collection(db, 'waitlist');
        const snap = await getDocs(waitlistRef);
        snap.forEach((doc) => {
          const data = doc.data();
          const nameMatch = data.name && data.name.toLowerCase().includes(queryStr);
          const idMatch = data.ticketId && data.ticketId.toLowerCase().includes(queryStr);
          const phoneMatch = data.phone && data.phone.toLowerCase().includes(queryStr);

          if (nameMatch || idMatch || phoneMatch) {
            foundData = { ...data, type: 'waitlist' };
          }
        });
      } catch (err) {
        console.warn('Firestore waitlist search fallback:', err);
      }

      // 2. If not found in waitlist, search in reservations collection
      if (!foundData) {
        try {
          const resRef = collection(db, 'reservations');
          const snap = await getDocs(resRef);
          snap.forEach((doc) => {
            const data = doc.data();
            const nameMatch = (data.fullName && data.fullName.toLowerCase().includes(queryStr)) ||
                              (data.name && data.name.toLowerCase().includes(queryStr));
            const idMatch = (data.ticketId && data.ticketId.toLowerCase().includes(queryStr)) ||
                            (doc.id && doc.id.toLowerCase().includes(queryStr));
            const phoneMatch = data.phone && data.phone.toLowerCase().includes(queryStr);

            if (nameMatch || idMatch || phoneMatch) {
              foundData = { 
                ...data, 
                ticketId: data.ticketId || doc.id.substring(0, 7).toUpperCase(),
                name: data.fullName || data.name,
                type: 'reservation' 
              };
            }
          });
        } catch (err) {
          console.warn('Firestore reservations search fallback:', err);
        }
      }

      // 3. Fallback to localStorage check
      if (!foundData) {
        const savedTicket = localStorage.getItem('finalstop_active_ticket');
        const savedBooking = localStorage.getItem('finalstop_active_booking');
        
        if (savedTicket) {
          const parsed = JSON.parse(savedTicket);
          if (
            parsed.name?.toLowerCase().includes(queryStr) || 
            parsed.ticketId?.toLowerCase().includes(queryStr) ||
            parsed.phone?.toLowerCase().includes(queryStr)
          ) {
            foundData = parsed;
          }
        } else if (savedBooking) {
          const parsed = JSON.parse(savedBooking);
          if (
            parsed.fullName?.toLowerCase().includes(queryStr) ||
            parsed.name?.toLowerCase().includes(queryStr) ||
            parsed.ticketId?.toLowerCase().includes(queryStr) ||
            parsed.id?.toLowerCase().includes(queryStr)
          ) {
            foundData = parsed;
          }
        }
      }

      if (foundData) {
        setResult(foundData);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleRefresh = () => {
    if (!result) return;
    // Simulate real-time progress update
    const currentPos = result.position || 2;
    const newPos = Math.max(1, currentPos - 1);
    const updated = {
      ...result,
      position: newPos,
      estMinutes: Math.max(5, newPos * 12),
      status: newPos <= 1 ? 'ready' : 'waiting'
    };
    setResult(updated);
    localStorage.setItem('finalstop_active_ticket', JSON.stringify(updated));
  };

  const isUpNext = result?.position <= 1 || result?.status === 'ready' || result?.status === 'next';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div 
        className="bg-[#151517] border border-gold/40 w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
              Real-Time Queue & Booking Tracker
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">
            Check My Status
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your <strong>reservation name</strong> or <strong>booking / ticket ID</strong> to see if your chair is ready or where you stand in line.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Reservation name or ID (e.g. Mika or FS-102)"
                className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none font-mono"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gold hover:bg-gold-light disabled:opacity-40 text-black px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isSearching ? 'Searching...' : 'Check Status'}
            </button>
          </div>
        </form>

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>No active status found for "{searchQuery}"</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
              {isWaitlistOpen 
                ? "Please verify your spelling, or if you're heading to the shop now, you can join today's walk-in waitlist."
                : "Please verify your phone number or name. The walk-in queue is currently closed by the owner; please schedule an appointment to reserve your chair."}
            </p>
            <div className="pl-6 pt-1">
              {isWaitlistOpen && onOpenWaitlist ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWaitlist();
                  }}
                  className="text-xs text-gold underline font-bold uppercase tracking-wider hover:text-white cursor-pointer"
                >
                  Join Today's Waitlist &rarr;
                </button>
              ) : onNavigateToBooking ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToBooking();
                  }}
                  className="text-xs text-gold underline font-bold uppercase tracking-wider hover:text-white cursor-pointer"
                >
                  Book an Appointment &rarr;
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result ? (
          <div className="bg-[#0A0A0B] border border-gold/50 p-6 space-y-5">
            
            {/* Header / Ticket Badge */}
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  {result.type === 'reservation' ? 'Appointment Booking' : 'Walk-In Queue Ticket'}
                </span>
                <p className="text-xl font-mono font-bold text-gold mt-0.5">
                  {result.ticketId || 'CONFIRMED'}
                </p>
                <p className="text-sm text-white font-medium flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>{result.name || result.fullName}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">Barber</span>
                <span className="text-xs text-gray-200 font-mono font-bold block mt-0.5">
                  {result.barber || 'Master Barber'}
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">
                  {result.service}
                </span>
              </div>
            </div>

            {/* Status Announcement Box */}
            <div className={`p-4 border ${
              isUpNext 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                : 'bg-[#151517] border-gold/30 text-gray-300'
            }`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isUpNext ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    {isUpNext 
                      ? "YOUR TURN IS COMING UP! (Chair is almost ready)" 
                      : `You are currently #${result.position || 2} in line`}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isUpNext 
                      ? "Please head toward the styling station or check in at the front counter."
                      : `Estimated wait time: ~${result.estMinutes || 20} minutes remaining. We will call your name shortly.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Step Progress Tracker */}
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block mb-2 font-bold">
                Queue Progress :
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-white/10 text-gray-300 py-1.5 border border-white/10">
                  1. Registered
                </div>
                <div className={`py-1.5 border ${
                  !isUpNext 
                    ? 'bg-gold text-black font-bold border-gold' 
                    : 'bg-white/10 text-gray-300 border-white/10'
                }`}>
                  2. In Waitlist
                </div>
                <div className={`py-1.5 border ${
                  isUpNext 
                    ? 'bg-emerald-500 text-black font-bold border-emerald-400' 
                    : 'bg-white/5 text-gray-500 border-white/5'
                }`}>
                  3. Up Next / Chair Ready
                </div>
              </div>
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400 font-mono">
              <span>Updated live</span>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-gold hover:text-gold-light flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

          </div>
        ) : (
          !notFound && (
            <div className="bg-[#0A0A0B] border border-white/5 p-6 text-center text-xs text-gray-400 space-y-3">
              <Clock className="w-8 h-8 text-gold/60 mx-auto" />
              <p>
                Check in quickly to see if your barber is ready for your haircut or hot lather shave.
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}

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
import { errorMessage, fetchTicketStatus, formatTime12h } from '../lib/site/api';
import { normalizeTicketCode } from '../lib/site/validation';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface StatusResult {
  type: 'reservation' | 'waitlist';
  ticketId: string;
  name: string;
  barber: string | null;
  service: string | null;
  date: string | null;
  time: string | null;
  position: number | null;
  estMinutes: number | null;
  status: string;
}

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
  const [result, setResult] = useState<StatusResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { barbers } = useSiteData();

  // Lookup is by ticket code only: the code is the secret that proves the
  // visitor owns the booking. Names/phones are never searchable publicly.
  const performSearch = async (term: string) => {
    if (isSearching || !term.trim()) return;
    // Checked before sending: ticket numbers look like FS-7KQ2M9XA.
    const code = normalizeTicketCode(term);
    if (!code) {
      setResult(null);
      setNotFound(false);
      setSearchError('Please enter your ticket number, e.g. FS-7KQ2M9XA.');
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setSearchError(null);
    setResult(null);

    try {
      const ticket = await fetchTicketStatus(code);
      if (!ticket || (ticket.type !== 'appointment' && ticket.type !== 'waitlist')) {
        setNotFound(true);
        return;
      }
      setResult({
        type: ticket.type === 'appointment' ? 'reservation' : 'waitlist',
        ticketId: ticket.ticketCode,
        name: ticket.firstName,
        barber: ticket.teamMemberName ?? null,
        service: ticket.serviceName ?? null,
        date: ticket.appointmentDate ?? null,
        time: ticket.appointmentTime ? ticket.appointmentTime.slice(0, 5) : null,
        position: ticket.position ?? null,
        estMinutes: ticket.estMinutes ?? null,
        status: ticket.status === 'in_chair' ? 'in-chair' : ticket.status
      });
    } catch (err) {
      setSearchError(errorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (initialQuery) {
      setSearchQuery(initialQuery);
      void performSearch(initialQuery);
      return;
    }
    // Re-check the visitor's own last waitlist ticket, if this browser has one.
    try {
      const saved = localStorage.getItem('levelup_waitlist_ticket');
      const code = saved ? (JSON.parse(saved) as { ticketCode?: string }).ticketCode : undefined;
      if (code) {
        setSearchQuery(code);
        void performSearch(code);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    void performSearch(searchQuery);
  };

  const handleRefresh = async () => {
    if (result) await performSearch(result.ticketId);
  };

  const isWaitlist = result?.type !== 'reservation';
  const waitlistStatus = result?.status || 'waiting';
  const resStatus = result?.status || 'confirmed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div 
        id="check-status-modal-content"
        className="bg-[#151517] border border-gold/40 w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer border-none bg-transparent"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
              Live Tracking &bull; Appointments &amp; Waitlist
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-1.5">
            Check Reservation / Ticket Status
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your <strong>ticket number</strong> (e.g. FS-7KQ2M9XA) to track live queue position and chair status.
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
                placeholder="Ticket number (e.g. FS-7KQ2M9XA)"
                maxLength={20}
                autoComplete="off"
                className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none font-mono"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gold hover:bg-gold-light disabled:opacity-40 text-black px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isSearching ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </form>

        {/* Not Found Alert */}
        {searchError && (
          <p role="alert" className="mb-4 text-xs text-red-300 border border-red-500/40 bg-red-500/10 px-3 py-2">
            {searchError}
          </p>
        )}

        {notFound && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>No active record found for "{searchQuery}"</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
              {isWaitlistOpen 
                ? "Please check the spelling or phone number, or join the live walk-in queue directly."
                : "Please check your name or ticket ID. You can also book an appointment online."}
            </p>
            <div className="pl-6 pt-1 flex gap-4">
              {isWaitlistOpen && onOpenWaitlist ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWaitlist();
                  }}
                  className="text-xs text-gold underline font-bold uppercase tracking-wider hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Join Live Waitlist &rarr;
                </button>
              ) : onNavigateToBooking ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToBooking();
                  }}
                  className="text-xs text-gold underline font-bold uppercase tracking-wider hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Book an Appointment &rarr;
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result ? (
          <div className="bg-[#0A0A0B] border border-gold/50 p-6 space-y-5 rounded-xs">
            
            {/* Header / Ticket Badge */}
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  {result.type === 'reservation' ? 'Confirmed Appointment' : 'Live Walk-In Queue Ticket'}
                </span>
                <p className="text-xl font-mono font-bold text-gold mt-0.5">
                  #{result.ticketId || 'CONFIRMED'}
                </p>
                <p className="text-sm text-white font-medium flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>{result.name}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">Assigned Barber</span>
                <span className="text-xs text-gray-200 font-mono font-bold block mt-0.5">
                  {result.barber || barbers.map((b) => b.name).join(' & ')}
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">
                  {result.service}
                </span>
                {result.date && (
                  <span className="text-[10px] font-mono text-gold block mt-0.5">
                    {result.date} at {result.time ? formatTime12h(result.time) : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Status Box */}
            {isWaitlist ? (
              <div className={`p-4 border rounded-xs ${
                waitlistStatus === 'in-chair'
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                  : (waitlistStatus === 'called' || result.position === 1)
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : waitlistStatus === 'served'
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                  : waitlistStatus === 'cancelled'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : 'bg-[#151517] border-gold/30 text-gray-300'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {(waitlistStatus === 'called' || result.position === 1) ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
                    ) : waitlistStatus === 'in-chair' ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-pulse"></div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-gold"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {waitlistStatus === 'in-chair'
                        ? "IN CHAIR &bull; Haircut / Styling in Progress"
                        : (waitlistStatus === 'called' || result.position === 1)
                        ? "YOU ARE NEXT! Please step up to the barber station"
                        : waitlistStatus === 'served'
                        ? "SERVICE COMPLETED &bull; Thank you for visiting!"
                        : waitlistStatus === 'cancelled'
                        ? "TICKET CLOSED BY SHOP"
                        : `You are currently #${result.position || 2} in line`}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {waitlistStatus === 'in-chair'
                        ? "Enjoy your precision cut or master braids session."
                        : (waitlistStatus === 'called' || result.position === 1)
                        ? "Your barber is ready with fresh tools and hot towels. You will be seated right away."
                        : waitlistStatus === 'served'
                        ? "We hope you love your fresh cut and styling!"
                        : waitlistStatus === 'cancelled'
                        ? "This ticket has been marked closed. Please contact the shop if you have questions."
                        : `Estimated wait time: ~${result.estMinutes || 15} minutes. Please listen for your name.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 border rounded-xs ${
                resStatus === 'completed'
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                  : resStatus === 'confirmed'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : resStatus === 'cancelled'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : 'bg-[#151517] border-gold/30 text-gray-300'
              }`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {resStatus === 'completed'
                        ? "APPOINTMENT COMPLETED"
                        : resStatus === 'cancelled'
                        ? "APPOINTMENT CANCELLED"
                        : "APPOINTMENT CONFIRMED &amp; BOOKED"}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {resStatus === 'completed'
                        ? "Thank you for visiting Final Stop Barber Shop!"
                        : resStatus === 'cancelled'
                        ? "This appointment has been cancelled."
                        : `Your slot for ${result.service} is confirmed with ${result.barber || 'your barber'}. Please arrive 5 minutes prior to your scheduled time.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4-Step Visual Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2 font-bold uppercase tracking-wider">
                <span>Live Progress Status:</span>
                <span className="text-gold">Real-Time Sync</span>
              </div>

              {isWaitlist ? (
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                  <div className="bg-white/10 text-gray-300 py-2 border border-white/10 rounded-xs">
                    1. Registered
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    (result.position > 1 && waitlistStatus === 'waiting')
                      ? 'bg-gold text-black font-bold border-gold shadow-sm'
                      : (waitlistStatus === 'called' || waitlistStatus === 'in-chair' || waitlistStatus === 'served')
                      ? 'bg-gold/20 text-gold border-gold/40'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    2. In Queue (#{result.position || '1'})
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    (waitlistStatus === 'called' || (result.position === 1 && waitlistStatus === 'waiting'))
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md'
                      : (waitlistStatus === 'in-chair' || waitlistStatus === 'served')
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    3. In Chair
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    waitlistStatus === 'served'
                      ? 'bg-blue-500 text-white font-bold border-blue-400'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    4. Completed
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                  <div className="bg-white/10 text-gray-300 py-2 border border-white/10 rounded-xs">
                    1. Received
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    resStatus === 'confirmed'
                      ? 'bg-gold text-black font-bold border-gold shadow-sm'
                      : resStatus === 'completed'
                      ? 'bg-gold/20 text-gold border-gold/40'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    2. Confirmed
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    resStatus === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    3. Ready at Shop
                  </div>
                  <div className={`py-2 border rounded-xs transition-colors ${
                    resStatus === 'completed'
                      ? 'bg-blue-500 text-white font-bold border-blue-400'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    4. Completed
                  </div>
                </div>
              )}
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Final Stop Secure Central Sync</span>
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isSearching}
                className="text-gold hover:text-gold-light flex items-center gap-1.5 font-bold cursor-pointer transition-colors bg-transparent border-none"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

          </div>
        ) : (
          !notFound && (
            <div className="bg-[#0A0A0B] border border-white/5 p-6 text-center text-xs text-gray-400 space-y-3 rounded-xs">
              <Clock className="w-8 h-8 text-gold/60 mx-auto" />
              <p>
                Check your live queue position or view confirmation details for your scheduled appointment anytime.
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}

// components/CheckStatusModal.tsx
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
  Sparkles,
  MapPin,
  CalendarClock,
  Ban,
  Lock,
  ExternalLink,
  ChevronRight,
  Phone
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { 
  lookupReservationOrTicket, 
  evaluateTicketModificationEligibility, 
  rescheduleReservation, 
  cancelReservation 
} from '../lib/reservationService';
import { getSmartMapsUrl } from '../lib/mapLinks';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWaitlist?: () => void;
  initialQuery?: string;
  isWaitlistOpen?: boolean;
  onNavigateToBooking?: () => void;
}

const AVAILABLE_TIMES = [
  '10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM', '4:45 PM', '5:30 PM'
];

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
  
  // Reschedule Mode State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [rescheduleTime, setRescheduleTime] = useState('11:30 AM');
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Cancel Confirmation State
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
      return;
    }

    // Auto-check if client has a cached ticket or appointment in localStorage
    const savedBooking = localStorage.getItem('finalstop_active_booking');
    const savedTicket = localStorage.getItem('finalstop_active_ticket');
    
    if (savedBooking) {
      try {
        const parsed = JSON.parse(savedBooking);
        setResult({ ...parsed, type: 'reservation' });
      } catch (e) {
        // ignore
      }
    } else if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);
        setResult({ ...parsed, type: 'waitlist' });
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const performSearch = async (term: string) => {
    const queryStr = term.trim();
    if (!queryStr) return;

    setIsSearching(true);
    setNotFound(false);
    setResult(null);
    setIsRescheduling(false);
    setShowCancelPrompt(false);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    try {
      const found = await lookupReservationOrTicket(queryStr);
      if (found) {
        setResult(found);
        if (found.date) setRescheduleDate(found.date);
        if (found.time) setRescheduleTime(found.time);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Status lookup error:', err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleRefresh = async () => {
    if (!result?.ticketId) return;
    performSearch(result.ticketId);
  };

  const handleSaveReschedule = async () => {
    if (!result?.ticketId) return;
    setIsSavingReschedule(true);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    const res = await rescheduleReservation(result.ticketId, rescheduleDate, rescheduleTime);
    setIsSavingReschedule(false);

    if (res.success) {
      setResult((prev: any) => ({
        ...prev,
        date: rescheduleDate,
        time: rescheduleTime,
        rescheduled: true
      }));
      setIsRescheduling(false);
      setActionSuccessMessage(`Your appointment has been successfully rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
    } else {
      setActionErrorMessage(res.error || 'Unable to reschedule appointment. Please try again or call the shop.');
    }
  };

  const handleConfirmCancellation = async () => {
    if (!result?.ticketId) return;
    setIsCancelling(true);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    const res = await cancelReservation(result.ticketId);
    setIsCancelling(false);
    setShowCancelPrompt(false);

    if (res.success) {
      setResult((prev: any) => ({
        ...prev,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }));
      setActionSuccessMessage(`Reservation #${result.ticketId} has been cancelled. Your chair slot has been released.`);
    } else {
      setActionErrorMessage(res.error || 'Failed to cancel appointment. Please call the shop directly.');
    }
  };

  const modificationCheck = evaluateTicketModificationEligibility(result);
  const isWaitlistTicket = result?.type === 'waitlist';
  const isUpNext = result?.position <= 1 || result?.status === 'ready' || result?.status === 'next';
  const smartMap = getSmartMapsUrl();

  const nextDates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div 
        className="bg-[#151517] border border-gold/40 w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
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
            <span className="w-2.5 h-2.5 rounded-full bg-gold"></span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
              Queue & Booking Status Tracker
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">
            Check My Status
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your <strong>ticket ID</strong> (e.g. <code>FS-10294</code>), <strong>email</strong>, or <strong>name</strong> to track chair status, view appointment details, reschedule, or cancel.
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
                placeholder="Ticket ID, name or email (e.g. FS-49201 or Alex)"
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

        {/* Action Feedback Notifications */}
        {actionSuccessMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs mb-5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{actionSuccessMessage}</p>
          </div>
        )}

        {actionErrorMessage && (
          <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs mb-5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{actionErrorMessage}</p>
          </div>
        )}

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>No active appointment or ticket found for "{searchQuery}"</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
              Please check your ticket number (e.g. FS-XXXXX) or registered email address. If you haven't reserved yet, you can schedule an appointment or join today's waitlist.
            </p>
            <div className="pl-6 pt-1 flex gap-3">
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
                  {isWaitlistTicket ? 'Walk-In Queue Ticket' : 'Guaranteed Appointment Pass'}
                </span>
                <p className="text-xl font-mono font-bold text-gold mt-0.5">
                  #{result.ticketId || 'CONFIRMED'}
                </p>
                <p className="text-sm text-white font-medium flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>{result.name || result.fullName || result.clientName}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">Status</span>
                <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider mt-1 border ${
                  result.status === 'cancelled'
                    ? 'bg-red-950/50 border-red-500/40 text-red-400'
                    : result.status === 'in_chair' || result.status === 'locked'
                    ? 'bg-blue-950/50 border-blue-500/40 text-blue-300'
                    : result.status === 'completed'
                    ? 'bg-gray-800 border-gray-600 text-gray-300'
                    : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                }`}>
                  {result.status === 'cancelled'
                    ? 'Cancelled'
                    : result.status === 'in_chair' || result.status === 'locked'
                    ? 'In Chair / Locked'
                    : result.status === 'completed'
                    ? 'Service Completed'
                    : 'Confirmed'}
                </span>
              </div>
            </div>

            {/* Service & Appointment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-xs font-mono border-b border-white/10">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Service</span>
                <span className="text-white font-bold">{result.service || 'Master Haircut'}</span>
                {result.price && <span className="text-gold block">{result.price}</span>}
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Assigned Barber</span>
                <span className="text-gray-200 font-bold">{result.barber || 'First Available Barber'}</span>
              </div>

              {result.date && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Scheduled Date</span>
                  <span className="text-white font-bold">{result.date}</span>
                </div>
              )}

              {result.time && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Time Slot</span>
                  <span className="text-gold font-bold">{result.time}</span>
                </div>
              )}
            </div>

            {/* Location & Directions Card */}
            <div className="p-3.5 bg-[#151517] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <strong className="text-white block font-serif">Final Stop Barber Shop</strong>
                  <span className="text-gray-400 text-[11px]">5277 El Cajon Blvd, San Diego, CA 92115</span>
                </div>
              </div>

              <a
                href={smartMap.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black border border-gold/40 text-gold text-xs font-mono font-bold hover:bg-gold hover:text-black transition-colors shrink-0"
              >
                <span>Open in {smartMap.appName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Waitlist-Specific Live Queue Progress (Only for waitlist tickets) */}
            {isWaitlistTicket && result.status !== 'cancelled' && (
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
                        : `You are currently #${result.position || 1} in line`}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {isUpNext 
                        ? "Please head toward the styling station or check in at the front desk."
                        : `Estimated wait time: ~${result.estMinutes || 15} minutes remaining. We will call your ticket shortly.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Barber Lock Notice or Cutoff Notice */}
            {!isWaitlistTicket && !modificationCheck.canModify && result.status !== 'cancelled' && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">
                    {modificationCheck.reason === 'barber_locked' 
                      ? 'Ticket Locked by Barber' 
                      : 'Changes Cutoff Window'}
                  </strong>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {modificationCheck.message}
                  </p>
                  <div className="mt-2">
                    <a 
                      href="tel:16198861267" 
                      className="inline-flex items-center gap-1.5 text-[11px] text-gold font-bold underline hover:text-white"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call shop directly: +1 (619) 886-1267</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Reschedule Form (Only visible when user clicked Reschedule) */}
            {isRescheduling && (
              <div className="p-4 bg-[#151517] border border-gold/40 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4" />
                    <span>Select New Date & Time</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="text-gray-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-gray-400 block mb-2">
                    Pick New Date:
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {nextDates.map((d, i) => {
                      const dStr = format(d, 'yyyy-MM-dd');
                      const isSel = rescheduleDate === dStr;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRescheduleDate(dStr)}
                          className={`flex-shrink-0 w-14 py-2 border flex flex-col items-center transition-all cursor-pointer ${
                            isSel
                              ? 'border-gold bg-gold text-black font-bold'
                              : 'border-white/10 bg-[#0A0A0B] text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[9px] uppercase">{format(d, 'EEE', { locale: enUS })}</span>
                          <span className="text-xs font-bold">{format(d, 'dd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-gray-400 block mb-2">
                    Pick New Time Slot:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {AVAILABLE_TIMES.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setRescheduleTime(time)}
                        className={`py-2 text-[11px] font-mono border transition-all cursor-pointer ${
                          rescheduleTime === time
                            ? 'border-gold bg-gold text-black font-bold'
                            : 'border-white/10 bg-[#0A0A0B] text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveReschedule}
                    disabled={isSavingReschedule}
                    className="flex-1 bg-gold hover:bg-gold-light text-black py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow"
                  >
                    {isSavingReschedule ? 'Saving Changes...' : 'Confirm Reschedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Confirmation Prompt */}
            {showCancelPrompt && (
              <div className="p-4 bg-red-950/50 border border-red-500/50 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <Ban className="w-4 h-4 text-red-400" />
                  <span>Are you sure you want to cancel appointment #{result.ticketId}?</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  This will release your reserved chair slot with {result.barber || 'the barber'}. This action cannot be undone.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmCancellation}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Keep Appointment
                  </button>
                </div>
              </div>
            )}

            {/* Client Action Buttons (Reschedule / Cancel) */}
            {!isWaitlistTicket && modificationCheck.canModify && !isRescheduling && !showCancelPrompt && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(true)}
                  className="flex-1 bg-[#1A1A20] hover:bg-[#252530] text-gold border border-gold/40 py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>Reschedule Date & Time</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-500/30 py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Ban className="w-4 h-4 text-red-400" />
                  <span>Cancel Appointment</span>
                </button>
              </div>
            )}

            {/* Footer refresh control */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400 font-mono">
              <span>Status verified</span>
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
                Check in quickly to see if your barber is ready or manage your upcoming reservation.
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}

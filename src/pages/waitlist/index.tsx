import { useState, useEffect, FormEvent } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Calendar, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Scissors
} from 'lucide-react';
import CallShopModal from '../../components/CallShopModal';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import { errorMessage, fetchPublicWaitlist, joinWaitlist } from '../../lib/site/api';
import { LIMITS, check, normalizeTicketCode, waitlistSchema } from '../../lib/site/validation';
import { useSubmitLock } from '../../lib/site/useSubmitLock';
import type { PublicQueueEntry } from '../../types/content';

interface StoredTicket {
  ticketCode: string;
  name: string;
  barber: string;
  service: string;
  position: number;
  estMinutes: number;
}

const TICKET_STORAGE_KEY = 'levelup_waitlist_ticket';

interface WaitlistPageProps {
  onBackToHome: () => void;
  onNavigateToBooking: () => void;
  initialBarber?: string;
  isWaitlistOpen?: boolean;
}

export default function WaitlistPage({
  onBackToHome,
  onNavigateToBooking,
  initialBarber,
  isWaitlistOpen = true
}: WaitlistPageProps) {
  const { services: OFFICIAL_SERVICES, barbers, site } = useSiteData();
  const [queue, setQueue] = useState<PublicQueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(
    initialBarber && barbers.some((b) => b.id === initialBarber) ? initialBarber : ''
  );
  const [selectedService, setSelectedService] = useState(OFFICIAL_SERVICES[0]?.id ?? '');
  const [activeTicket, setActiveTicket] = useState<StoredTicket | null>(null);
  const submitOnce = useSubmitLock();

  // Load the public queue (names are masked server-side, no contact details).
  const fetchQueue = async () => {
    setIsLoading(true);
    setQueueError(null);
    try {
      setQueue(await fetchPublicWaitlist());
    } catch (err) {
      setQueueError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchQueue();
    try {
      const saved = localStorage.getItem(TICKET_STORAGE_KEY);
      // Stored by this page, but still checked before display.
      const t = saved ? (JSON.parse(saved) as Partial<StoredTicket>) : null;
      if (
        t &&
        normalizeTicketCode(t.ticketCode) &&
        typeof t.name === 'string' &&
        t.name.length <= LIMITS.name &&
        Number.isFinite(t.position) &&
        Number.isFinite(t.estMinutes)
      ) {
        setActiveTicket({
          ticketCode: t.ticketCode as string,
          name: t.name,
          barber: String(t.barber ?? '').slice(0, LIMITS.shortText),
          service: String(t.service ?? '').slice(0, LIMITS.shortText),
          position: t.position as number,
          estMinutes: t.estMinutes as number
        });
      }
    } catch {
      // Storage unavailable: the ticket code is still shown after joining.
    }
  }, []);

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    return submitOnce(async () => {
      const input = {
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        serviceSlug: selectedService || null,
        teamMemberSlug: selectedBarber || null
      };
      // Mobile phone is required here; everything is checked before sending.
      const valid = check(waitlistSchema, input);
      if (!valid.ok || !valid.data.phone) {
        setSubmitError(valid.ok ? 'Please enter your mobile phone number.' : valid.message);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const ticket = await joinWaitlist(input);
        const stored: StoredTicket = {
          ticketCode: ticket.ticketCode,
          name: valid.data.name,
          barber: barbers.find((b) => b.id === selectedBarber)?.name ?? 'First Available',
          service: OFFICIAL_SERVICES.find((s) => s.id === selectedService)?.name ?? '',
          position: ticket.position,
          estMinutes: ticket.estMinutes
        };
        setActiveTicket(stored);
        try {
          localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(stored));
        } catch {
          // ignore
        }
        await fetchQueue();
      } catch (err) {
        setSubmitError(errorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    });
  };

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
              onClick={fetchQueue}
              className="btn-obsidian text-xs px-3.5 py-2"
              title="Refresh queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Queue</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToBooking()}
              className="btn-gold text-xs px-4 py-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Specific Slot</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
            Live Walk-In Queue
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Digital Walk-In Lounge & Live Queue
          </h1>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-3"></div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            No appointment? Check into the live walk-in queue. Monitor your exact place in line and head to the shop as your turn nears.
          </p>
        </div>

        {/* Active Ticket Banner if already joined */}
        {activeTicket && (
          <div className="bg-[#121215] border-2 border-gold p-6 sm:p-8 mb-10 shadow-2xl relative overflow-hidden rounded-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your Active Walk-In Pass</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Ticket #{activeTicket.ticketCode} &bull; {activeTicket.name}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Barber: <span className="text-gold font-bold">{activeTicket.barber}</span> &bull; Service: {activeTicket.service}
                </p>
              </div>

              <div className="text-right shrink-0 bg-gold/10 border border-gold/30 px-4 py-2 rounded-sm">
                <span className="text-[10px] uppercase font-mono text-gold block">Position</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  #{activeTicket.position}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">~{activeTicket.estMinutes} min</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Live Queue Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-gold" />
                    <span>Live Shop Queue</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-mono">
                    Real-time queue updates
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {isWaitlistOpen ? 'Queue Open' : 'Queue Temporarily Full'}
                  </span>
                </div>
              </div>

              {/* Queue Items */}
              {isLoading ? (
                <div className="py-12 text-center text-gray-500 font-mono text-sm">
                  Loading current queue...
                </div>
              ) : queueError ? (
                <div role="alert" className="py-12 text-center text-sm text-red-300">
                  {queueError}
                </div>
              ) : queue.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-10 h-10 text-gold/40 mx-auto mb-3" />
                  <h3 className="text-base font-serif font-bold text-white mb-1">No wait right now!</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    The chairs are open. Walk in now and take the seat immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item, idx) => (
                    <div
                      key={`${item.position}-${idx}`}
                      className={`p-4 border flex items-center justify-between transition-all rounded-xs ${
                        item.status === 'in_chair'
                          ? 'bg-gold/10 border-gold/50 text-white shadow-md'
                          : 'bg-[#18181D] border-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                          item.status === 'in_chair'
                            ? 'bg-gold text-black'
                            : 'bg-white/10 text-gold border border-white/10'
                        }`}>
                          #{idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.displayName}</span>
                            {item.status === 'in_chair' && (
                              <span className="text-[10px] bg-gold text-black font-bold uppercase px-1.5 py-0.5 rounded-xs">
                                In Chair
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            Barber: <strong className="text-gold">{item.teamMemberName ?? 'First Available'}</strong>{item.serviceName ? <> &bull; {item.serviceName}</> : null}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs text-gold block font-bold">
                          {item.status === 'in_chair' ? 'In Progress' : `~${item.estMinutes} min`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Join Waitlist Form */}
          <div className="space-y-6">
            <div className="bg-[#141418] border border-white/10 p-6 rounded-sm">
              <h2 className="text-lg font-serif font-bold text-white mb-1 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-gold" />
                <span>Join Live Walk-In Line</span>
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Enter your details to generate your queue pass.
              </p>

              <form onSubmit={handleJoin} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Marcus Taylor"
                    maxLength={LIMITS.name}
                    autoComplete="name"
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(619) 555-0199"
                    maxLength={LIMITS.phone + 10}
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Email Address (for pass confirmation)</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="marcus@example.com"
                    maxLength={LIMITS.email}
                    autoComplete="email"
                    inputMode="email"
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Preferred Barber *</label>
                  <select
                    value={selectedBarber}
                    onChange={(e) => setSelectedBarber(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none rounded-xs"
                  >
                    <option value="">First Available Master Barber (Fastest)</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] uppercase mb-1">Select Service *</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 px-3 py-2.5 text-white focus:border-gold focus:outline-none rounded-xs"
                  >
                    {OFFICIAL_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.price} - {s.duration})
                      </option>
                    ))}
                  </select>
                </div>

                {submitError && (
                  <p role="alert" className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-3 py-2 rounded-xs">
                    {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !isWaitlistOpen}
                  className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-black font-bold uppercase tracking-widest py-3 transition-all cursor-pointer rounded-sm shadow-md mt-2"
                >
                  {isSubmitting ? 'Generating Pass...' : 'Get My Digital Queue Pass'}
                </button>
              </form>
            </div>

            {/* Quick Assistance Box */}
            <div className="bg-[#121215] border border-white/10 p-5 font-mono text-xs rounded-sm">
              <span className="text-gold font-bold uppercase block mb-1">Need Immediate Assistance?</span>
              <p className="text-gray-400 text-[11px] mb-3">
                Call our direct line to verify exact walk-in volume right now.
              </p>
              <button
                type="button"
                onClick={() => setIsCallModalOpen(true)}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/15 py-2.5 flex items-center justify-center gap-2 cursor-pointer rounded-xs"
              >
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Call {site.contact.phones[0]?.display}</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      <CallShopModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
    </div>
  );
}

import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Send,
  Gift,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';
import { errorMessage, joinWaitlist, submitForm } from '../lib/site/api';
import { LIMITS, check, parseEmailOrPhone, waitlistSchema } from '../lib/site/validation';
import { useSubmitLock } from '../lib/site/useSubmitLock';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getServiceSpecialist
} from '../lib/site/specialist';

export type ModalMode = 'waitlist' | 'promo' | null;

interface WalkInHubModalProps {
  mode: ModalMode;
  onClose: () => void;
  onOpenStatusCheck?: () => void;
  isWaitlistOpen?: boolean;
  onNavigateToBooking?: () => void;
}

export default function WalkInHubModal({
  mode,
  onClose,
  onOpenStatusCheck,
  isWaitlistOpen = false,
  onNavigateToBooking
}: WalkInHubModalProps) {
  const { services: OFFICIAL_SERVICES, barbers, site } = useSiteData();

  // Waitlist form states — Two-Universe Specialist Selection
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>('lusca');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];
  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  const specialistServices = useMemo(() => {
    const filtered = OFFICIAL_SERVICES.filter((s) => getServiceSpecialist(s) === activeSpecialist);
    return filtered.length > 0 ? filtered : OFFICIAL_SERVICES;
  }, [OFFICIAL_SERVICES, activeSpecialist]);

  const [selectedService, setSelectedService] = useState(specialistServices[0]?.id ?? '');

  useEffect(() => {
    if (!specialistServices.some((s) => s.id === selectedService)) {
      setSelectedService(specialistServices[0]?.id ?? '');
    }
  }, [activeSpecialist, specialistServices, selectedService]);

  const [waitlistSuccess, setWaitlistSuccess] = useState<{
    ticketId: string;
    position: number;
    estMinutes: number;
    name: string;
    barber: string;
    service: string;
  } | null>(null);

  // Promo form states
  const [promoContact, setPromoContact] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  // Loading / error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitOnce = useSubmitLock();

  if (!mode) return null;

  // 1. Join the live walk-in queue
  const handleJoinWaitlist = (e: FormEvent) => {
    e.preventDefault();
    return submitOnce(async () => {
      const teamMemberSlug = activeBarberProfile?.id ?? activeSpecialist;
      const input = {
        name: clientName,
        phone: clientPhone,
        serviceSlug: selectedService || null,
        teamMemberSlug
      };
      const valid = check(waitlistSchema, input);
      if (!valid.ok || !valid.data.phone) {
        setSubmitError(valid.ok ? 'Please enter your mobile phone number.' : valid.message);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const ticket = await joinWaitlist(input);
        setWaitlistSuccess({
          ticketId: ticket.ticketCode,
          position: ticket.position,
          estMinutes: ticket.estMinutes,
          name: valid.data.name,
          barber: activeBarberProfile?.name ?? activeUniverseMeta.name,
          service: specialistServices.find((s) => s.id === selectedService)?.name ?? ''
        });
      } catch (err) {
        setSubmitError(errorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // 2. VIP club sign-up (email or phone)
  const handleJoinPromo = (e: FormEvent) => {
    e.preventDefault();
    return submitOnce(async () => {
      const contact = parseEmailOrPhone(promoContact);
      if (!contact.ok) {
        setSubmitError(contact.message);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await submitForm({
          formType: 'vip_signup',
          name: 'VIP member',
          email: contact.data.email ?? undefined,
          phone: contact.data.phone ?? undefined
        });
        setPromoSuccess(true);
      } catch (err) {
        setSubmitError(errorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const promo = site.promoPopup;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#151517] border border-gold/40 rounded-[2.5rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full bg-white/5 border border-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODE: WAITLIST (Walk-in for today) - When CLOSED by Owner */}
        {mode === 'waitlist' && !isWaitlistOpen && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-red-400 font-bold">
                Walk-In Waitlist &bull; Currently Closed
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
              Waitlist Closed by Owner
            </h3>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Today&rsquo;s walk-in waitlist is currently disabled by the shop owner. We are operating exclusively by appointment or all walk-in chairs are at full capacity.
            </p>

            <div className="bg-[#0A0A0B] border border-red-500/30 rounded-2xl p-4 space-y-2 mb-6">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed font-sans">
                  <span className="text-white font-mono font-bold block mb-0.5">
                    Need a cut or braids today?
                  </span>
                  Book directly with Lusca (Men&rsquo;s Barbering) or Mika (Women&rsquo;s Braids &amp; Locs) to guarantee your chair.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {onNavigateToBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToBooking();
                  }}
                  className="w-full btn-gold rounded-full! text-xs py-3.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 rounded-full text-gray-300 text-xs py-2.5 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

        {/* MODE: WAITLIST (Walk-in for today) - When OPEN */}
        {mode === 'waitlist' && isWaitlistOpen && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
                Same-Day Walk-In &bull; Live Queue
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
              Join Today&rsquo;s Waitlist
            </h3>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Choose your specialist below (**Lusca** for Men&rsquo;s Cuts &amp; Beards or **Mika** for Women&rsquo;s Braids &amp; Locs) to see their available walk-in services.
            </p>

            {waitlistSuccess ? (
              <div className="bg-[#0A0A0B] border border-gold/40 rounded-3xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-gold font-mono font-bold text-xs uppercase block">
                    Your Ticket is Active!
                  </span>
                  <p className="text-2xl font-mono font-bold text-white mt-1">
                    {waitlistSuccess.ticketId}
                  </p>
                  <p className="text-xs text-gray-300 mt-2">
                    Current Queue Position: <strong className="text-gold">#{waitlistSuccess.position}</strong> (~{waitlistSuccess.estMinutes} mins wait)
                  </p>
                </div>

                <div className="text-xs text-gray-400 font-mono pt-3 border-t border-white/10 space-y-1 text-left">
                  <p>&bull; <strong>Name:</strong> {waitlistSuccess.name}</p>
                  <p>&bull; <strong>Specialist:</strong> {waitlistSuccess.barber}</p>
                  <p>&bull; <strong>Service:</strong> {waitlistSuccess.service}</p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {onOpenStatusCheck && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStatusCheck();
                      }}
                      className="w-full btn-gold rounded-full! text-xs py-3"
                    >
                      Track My Turn Live &rarr;
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-white/10 hover:bg-white/20 rounded-full text-white font-bold uppercase tracking-wider text-xs py-2.5 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-4">
                {/* 1. Choose Specialist Universe */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gold font-bold block mb-2">
                    1. Select Your Specialist *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
                      const meta = SPECIALIST_UNIVERSES[specKey];
                      const isSelected = activeSpecialist === specKey;
                      return (
                        <button
                          key={specKey}
                          type="button"
                          onClick={() => setActiveSpecialist(specKey)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gold text-black border-gold font-bold shadow-md'
                              : 'bg-[#0A0A0B] text-gray-300 border-white/15 hover:border-gold/40'
                          }`}
                        >
                          <span className="block text-sm font-serif font-bold">{meta.name}</span>
                          <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-black/80' : 'text-gray-400'}`}>
                            {specKey === 'lusca' ? "Men's Cuts & Beard" : "Women's Braids & Locs"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Filtered Services for Selected Specialist */}
                <div>
                  <label className="text-[11px] uppercase font-mono text-gold font-bold block mb-1">
                    2. {activeUniverseMeta.name}&rsquo;s Exclusive Services *
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  >
                    {specialistServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.price} - {s.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Johnathan Smith"
                    maxLength={LIMITS.name}
                    autoComplete="name"
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. (619) 886-1267"
                    maxLength={LIMITS.phone + 10}
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none font-mono"
                  />
                </div>

                {submitError && (
                  <p role="alert" className="text-xs text-red-300 border border-red-500/40 bg-red-500/10 rounded-xl px-3 py-2">
                    {submitError}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-gold rounded-full! text-xs py-3.5"
                  >
                    <Send className="w-4 h-4 text-black" />
                    <span>
                      {isSubmitting
                        ? 'Securing your spot...'
                        : `Join ${activeUniverseMeta.name}'s Walk-In Queue`}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE: PROMO & VIP CLUB */}
        {mode === 'promo' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
                VIP Club &bull; Final Stop Barber Shop
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
              Get Exclusive Promos &amp; {promo.discountLabel}
            </h3>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Join our VIP Member list to receive {promo.discountLabel} your next cut, flash weekday deals, and priority access during peak hours.
            </p>

            {promoSuccess ? (
              <div className="bg-[#0A0A0B] border border-gold/50 rounded-3xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-gold font-mono font-bold text-xs uppercase block">
                    Welcome to the VIP Club!
                  </span>
                  <p className="text-sm text-gray-300 mt-1">
                    Here is your exclusive {promo.discountLabel} promo code:
                  </p>
                  <div className="mt-3 px-5 py-2.5 bg-gold/10 border border-gold rounded-full inline-block font-mono font-black text-xl text-gold tracking-widest">
                    {promo.code}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Mention this code at checkout during your visit at the salon.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full btn-gold rounded-full! text-xs py-3"
                  >
                    Got It, Thank You!
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleJoinPromo} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Email or Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={promoContact}
                    onChange={(e) => setPromoContact(e.target.value)}
                    placeholder="e.g. john@gmail.com or (619) 886-1267"
                    maxLength={LIMITS.email}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-1.5 block font-mono">
                    Zero spam guaranteed. We respect your privacy.
                  </span>
                </div>

                <div className="p-4 bg-[#0A0A0B] border border-white/5 rounded-2xl space-y-1.5 text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    <span>Member Benefits:</span>
                  </div>
                  <p>&bull; {promo.discountLabel} discount on your visit</p>
                  <p>&bull; Priority chair alerts on busy weekend shifts</p>
                </div>

                {submitError && (
                  <p role="alert" className="text-xs text-red-300 border border-red-500/40 bg-red-500/10 rounded-xl px-3 py-2">
                    {submitError}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-gold rounded-full! text-xs py-3.5"
                  >
                    <Gift className="w-4 h-4 text-black" />
                    <span>{isSubmitting ? 'Registering...' : `Claim My ${promo.discountLabel} Code`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Loader2,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Scissors,
  Printer,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday } from 'date-fns';
import CallShopModal from '../../components/CallShopModal';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import { bookAppointment, errorMessage, formatTime12h } from '../../lib/site/api';
import { BOOKING_WINDOW_DAYS, LIMITS, bookingSchema, check } from '../../lib/site/validation';
import { useSubmitLock } from '../../lib/site/useSubmitLock';
import {
  SPECIALIST_UNIVERSES,
  SpecialistKey,
  getBarberForSpecialist,
  getGalleryItemSpecialist,
  getServiceSpecialist,
  resolveSpecialistKey
} from '../../lib/site/specialist';
import type { BookingConfirmation, GalleryItem } from '../../types/content';

interface BookingPageProps {
  onBackToHome: () => void;
  initialBarber?: string;
  initialService?: string;
}

export default function BookingPage({ onBackToHome, initialBarber, initialService }: BookingPageProps) {
  const { services: SERVICES, barbers, gallery, site } = useSiteData();
  const TIME_SLOTS = site.booking.timeSlots;

  // Determine initial specialist ('lusca' for men's cuts/fades, 'mika' for women's braids/locs)
  // Prioritize initialService if provided so clicking a braid service always opens Mika's universe
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistKey>(() =>
    resolveSpecialistKey(initialService ? undefined : initialBarber, initialService, SERVICES)
  );

  // Step navigation: 1 = Specialist & Craft Menu, 2 = Date & Time, 3 = Guest Details, 4 = Confirm Pass
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter services strictly for the chosen specialist (never mix Lusca and Mika)
  const specialistServices = useMemo(() => {
    const filtered = SERVICES.filter((s) => getServiceSpecialist(s) === activeSpecialist);
    return filtered.length > 0 ? filtered : SERVICES;
  }, [SERVICES, activeSpecialist]);

  // Filter gallery models strictly for the chosen specialist
  const specialistGallery = useMemo(() => {
    const filtered = gallery.filter((g) => getGalleryItemSpecialist(g) === activeSpecialist);
    return filtered.length > 0 ? filtered : gallery;
  }, [gallery, activeSpecialist]);

  const activeBarberProfile = useMemo(
    () => getBarberForSpecialist(barbers, activeSpecialist),
    [barbers, activeSpecialist]
  );

  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(specialistServices.map((s) => s.category)))],
    [specialistServices]
  );

  // Selected Service & Selected Visual Model
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    if (initialService) {
      const byIdOrName = SERVICES.find(
        (s) =>
          s.id.toLowerCase() === initialService.toLowerCase() ||
          s.name.toLowerCase() === initialService.toLowerCase()
      );
      if (byIdOrName) return byIdOrName.id;
    }
    const initialPool = SERVICES.filter(
      (s) =>
        getServiceSpecialist(s) ===
        resolveSpecialistKey(initialService ? undefined : initialBarber, initialService, SERVICES)
    );
    return initialPool[0]?.id ?? SERVICES[0]?.id ?? '';
  });

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Sync specialist if initialService or initialBarber prop changes
  useEffect(() => {
    if (initialService) {
      const targetSpec = resolveSpecialistKey(undefined, initialService, SERVICES);
      setActiveSpecialist(targetSpec);
      const matched = SERVICES.find(
        (s) =>
          s.id.toLowerCase() === initialService.toLowerCase() ||
          s.name.toLowerCase() === initialService.toLowerCase()
      );
      if (matched) {
        setSelectedServiceId(matched.id);
      }
    } else if (initialBarber) {
      const targetSpec = resolveSpecialistKey(initialBarber, undefined, SERVICES);
      setActiveSpecialist(targetSpec);
    }
  }, [initialBarber, initialService, SERVICES]);

  // Ensure selectedServiceId always belongs to the active specialist
  useEffect(() => {
    setSelectedCategory('All');
    setSelectedModelId(null);
    if (!specialistServices.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(specialistServices[0]?.id ?? '');
    }
  }, [activeSpecialist, specialistServices, selectedServiceId]);

  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0] ?? '');
  const [weekOffset, setWeekOffset] = useState(0);

  // Guest Information
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  }>({});
  const submitOnce = useSubmitLock();

  // Submission & Result State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<BookingConfirmation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const selectedService =
    specialistServices.find((s) => s.id === selectedServiceId) || specialistServices[0];

  // Match a model from the active specialist's portfolio only
  const getSpecialistArtForService = (
    serviceName?: string,
    category?: string
  ): GalleryItem | null => {
    if (!specialistGallery || specialistGallery.length === 0) return null;
    if (selectedModelId) {
      const explicitModel = specialistGallery.find((g) => g.id === selectedModelId);
      if (explicitModel) return explicitModel;
    }
    const text = `${serviceName ?? ''} ${category ?? ''}`.toLowerCase();
    if (activeSpecialist === 'mika') {
      if (text.includes('loc') || text.includes('retwist') || text.includes('dread')) {
        return (
          specialistGallery.find(
            (g) =>
              g.title.toLowerCase().includes('loc') ||
              g.category.toLowerCase().includes('loc')
          ) || specialistGallery[0]
        );
      }
      if (text.includes('cornrow') || text.includes('stitch') || text.includes('feed')) {
        return (
          specialistGallery.find(
            (g) =>
              g.title.toLowerCase().includes('cornrow') ||
              g.title.toLowerCase().includes('feed')
          ) || specialistGallery[0]
        );
      }
      if (text.includes('boho') || text.includes('curl')) {
        return (
          specialistGallery.find(
            (g) =>
              g.title.toLowerCase().includes('boho') ||
              g.title.toLowerCase().includes('curl')
          ) || specialistGallery[0]
        );
      }
      return specialistGallery[0];
    } else {
      if (text.includes('beard') || text.includes('shave') || text.includes('razor')) {
        return (
          specialistGallery.find(
            (g) =>
              g.title.toLowerCase().includes('beard') ||
              g.category.toLowerCase().includes('beard')
          ) || specialistGallery[0]
        );
      }
      if (text.includes('taper')) {
        return (
          specialistGallery.find((g) => g.title.toLowerCase().includes('taper')) ||
          specialistGallery[0]
        );
      }
      return specialistGallery[0];
    }
  };

  const activeArtItem = getSpecialistArtForService(
    selectedService?.name,
    selectedService?.category
  );

  // When a client clicks a visual model card proposed by the specialist, match it to one of that specialist's services
  const handleSelectSpecialistModel = (model: GalleryItem) => {
    setSelectedModelId(model.id);
    const titleWords = model.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matchedService = specialistServices.find((s) => {
      const target = `${s.name} ${s.category} ${s.description}`.toLowerCase();
      return titleWords.some((w) => target.includes(w));
    });
    if (matchedService) {
      setSelectedServiceId(matchedService.id);
    }
  };

  const currentWeekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfToday(), weekOffset * 7 + i)
  );
  const lastBookableDay = addDays(startOfToday(), BOOKING_WINDOW_DAYS);
  const maxWeekOffset = Math.floor(BOOKING_WINDOW_DAYS / 7);

  const bookingInput = () => ({
    serviceSlug: selectedService?.id,
    date: selectedDate,
    time: selectedTime,
    teamMemberSlug: activeBarberProfile?.id ?? activeSpecialist,
    name: guestName,
    email: guestEmail,
    phone: guestPhone,
    notes: specialNotes
  });

  // Validation before going to Step 4
  const validateStep3 = () => {
    type GuestField = 'name' | 'email' | 'phone' | 'notes';
    const errors: Partial<Record<GuestField, string>> = {};
    const guest: Record<GuestField, string> = {
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      notes: specialNotes
    };
    const neutral: Record<GuestField, string> = {
      name: 'Valid Name',
      email: '',
      phone: '',
      notes: ''
    };
    for (let i = 0; i < 4; i++) {
      const r = check(bookingSchema, { ...bookingInput(), ...guest });
      const field = r.field as GuestField | undefined;
      if (r.ok || !field || !(field in neutral) || errors[field]) break;
      errors[field] = r.message;
      guest[field] = neutral[field];
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReservation = () =>
    submitOnce(async () => {
      const valid = check(bookingSchema, bookingInput());
      if (!valid.ok) {
        setSubmitError(valid.message);
        return;
      }
      if (!TIME_SLOTS.includes(selectedTime)) {
        setSubmitError('Please choose one of the available time slots.');
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const confirmation = await bookAppointment(bookingInput());
        setConfirmedData(confirmation);
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setSubmitError(errorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    });

  const handlePrintTicket = () => {
    window.print();
  };

  const filteredServices = specialistServices.filter(
    (service) => selectedCategory === 'All' || service.category === selectedCategory
  );

  const activeUniverseMeta = SPECIALIST_UNIVERSES[activeSpecialist];

  return (
    <div className="w-full overflow-x-clip font-sans">
      {/* Main Atelier Content */}
      <div className="pt-28 sm:pt-36 pb-16 px-5 sm:px-8 lg:px-12 xl:px-16 w-full max-w-7xl mx-auto">
        {isSuccess ? (
          /* =========================================================================
             CONFIRMED ATELIER PASS SCREEN
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto card-luxury p-8 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="text-emerald-400 font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
              Chair Reserved &middot; Pass Issued
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">
              We Look Forward to Welcoming You
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
              Thank you <strong className="text-white">{guestName.trim().split(' ')[0]}</strong>. Your private chair with{' '}
              <strong className="text-gold">{activeBarberProfile?.name ?? activeUniverseMeta.name}</strong> is reserved. A copy of your pass has been sent to{' '}
              <strong className="text-gold">{guestEmail || guestPhone}</strong>.
            </p>

            {/* Atelier Pass Summary Strip */}
            <div className="bg-[#0B0B0E] border border-gold/30 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-gold font-bold">
                  Pass #{confirmedData?.ticketCode}
                </span>
                <span className="text-xs font-mono text-emerald-400">Pay at Shop ($0 Deposit)</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <span className="text-white font-serif font-bold text-lg block">
                    {confirmedData?.serviceName}
                  </span>
                  <span className="text-xs text-gray-400">
                    Specialist: <strong className="text-gold">{activeBarberProfile?.name ?? activeUniverseMeta.name}</strong> ({activeUniverseMeta.universeTitle})
                  </span>
                </div>
                <span className="text-gold font-mono font-bold">
                  {confirmedData?.appointmentDate} &middot;{' '}
                  {confirmedData ? formatTime12h(confirmedData.appointmentTime) : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="btn-obsidian rounded-full! text-xs py-3.5 px-4"
              >
                <Printer className="w-4 h-4 text-gold" />
                <span>Print Pass</span>
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="btn-gold rounded-full! text-xs py-3.5 px-4"
              >
                <span>Back to Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentStep(1);
                  setGuestName('');
                  setGuestEmail('');
                  setGuestPhone('');
                }}
                className="btn-outline-gold rounded-full! text-xs py-3.5 px-4"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Book Another</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             TWO-WORLD SPECIALIST BOOKING EXPERIENCE (LUSCA MEN VS MIKA WOMEN/BRAIDS)
             ========================================================================= */
          <div>
            {/* Editorial Atelier Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/10 mb-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-gold font-mono text-[11px] uppercase tracking-[0.25em] font-bold mb-3">
                  <span>{activeUniverseMeta.craftBadge} &middot; {site.name}</span>
                </div>
                <h1
                  className="font-serif italic text-white leading-[1.02] tracking-tight"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
                >
                  Reserve with{' '}
                  <span className="not-italic font-sans font-black uppercase text-gold">
                    {activeUniverseMeta.name}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed max-w-xl">
                  {activeUniverseMeta.description}
                </p>
              </div>

              {/* Minimalist Stepper */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0 overflow-x-auto pb-2 lg:pb-0">
                {[
                  { num: 1, label: 'Specialist & Craft' },
                  { num: 2, label: 'Date & Time' },
                  { num: 3, label: 'Guest' },
                  { num: 4, label: 'Confirm' }
                ].map((s, idx) => {
                  const isActive = currentStep === s.num;
                  const isDone = currentStep > s.num;
                  return (
                    <div key={s.num} className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (s.num === 4 && !validateStep3()) return;
                          if (s.num <= currentStep) setCurrentStep(s.num as 1 | 2 | 3 | 4);
                        }}
                        className={`group flex items-center gap-2.5 bg-transparent border-none p-0 cursor-pointer transition-all ${
                          s.num > currentStep ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                            isActive
                              ? 'bg-gold text-black shadow-[0_0_20px_rgba(197,160,89,0.5)] scale-110'
                              : isDone
                              ? 'bg-gold/20 text-gold border border-gold/50'
                              : 'bg-white/5 text-gray-400 border border-white/15'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : `0${s.num}`}
                        </span>
                        <span
                          className={`text-xs uppercase tracking-[0.15em] font-bold ${
                            isActive ? 'text-white' : isDone ? 'text-gold' : 'text-gray-500'
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                      {idx < 3 && (
                        <div className={`w-5 sm:w-8 h-[1px] ${isDone ? 'bg-gold/60' : 'bg-white/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =====================================================================
                DEDICATED TWO-UNIVERSE SPECIALIST SELECTOR (LUSCA VS MIKA)
                ===================================================================== */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] text-gold">
                  Step 01A &middot; Choose Your Dedicated Specialist Universe
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Each master artisan offers their own exclusive menu &amp; models
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['lusca', 'mika'] as SpecialistKey[]).map((specKey) => {
                  const meta = SPECIALIST_UNIVERSES[specKey];
                  const profile = getBarberForSpecialist(barbers, specKey);
                  const isSelected = activeSpecialist === specKey;
                  const count = SERVICES.filter((s) => getServiceSpecialist(s) === specKey).length;
                  const modelCount = gallery.filter((g) => getGalleryItemSpecialist(g) === specKey).length;

                  return (
                    <button
                      key={specKey}
                      type="button"
                      onClick={() => {
                        setActiveSpecialist(specKey);
                        if (currentStep !== 1) setCurrentStep(1);
                      }}
                      className={`text-left p-6 sm:p-7 rounded-[2.25rem] border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-gold/[0.16] via-[#15141A] to-[#0C0C10] border-gold shadow-[0_20px_50px_rgba(197,160,89,0.22)]'
                          : 'bg-[#101014]/90 border-white/10 hover:border-gold/40 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-serif font-bold text-base border transition-all shrink-0 ${
                              isSelected
                                ? 'bg-gold text-black border-gold shadow-[0_0_20px_rgba(197,160,89,0.5)]'
                                : 'bg-[#18181F] text-gold border-gold/30 group-hover:border-gold'
                            }`}
                          >
                            <span>{profile?.initials ?? meta.name.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-gold">
                                {meta.craftBadge}
                              </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">
                              {profile?.name ?? meta.name} &mdash;{' '}
                              <span className="text-gold italic">{meta.universeTitle}</span>
                            </h2>
                            <p className="text-xs text-gray-300 mt-1">{meta.universeSubtitle}</p>
                          </div>
                        </div>

                        <span
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-sans font-extrabold uppercase tracking-[0.18em] shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-gold text-black border-gold'
                              : 'border-white/15 text-gray-400 group-hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Active Universe' : 'Switch'}
                        </span>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                        <span>
                          Exclusive Menu: <strong className="text-white">{count} Services</strong> &middot;{' '}
                          <strong className="text-gold">{modelCount} Portfolio Models</strong>
                        </span>
                        {profile?.phone && (
                          <span className="text-gray-300">Direct: {profile.phone}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Split Atelier Layout: Left = Specialist Models & Craft Menu / Steps, Right = Sticky Live Art & Chair Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* LEFT 7 COLUMNS: UNBOXED SALON MENU & STEPS */}
              <div className="lg:col-span-7">
                {/* ===============================================================
                    STEP 1: SPECIALIST'S VISUAL MODELS + EXCLUSIVE SERVICE MENU
                    =============================================================== */}
                {currentStep === 1 && (
                  <motion.div
                    key={activeSpecialist}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Visual Models Proposed Exclusively by the Selected Specialist */}
                    {specialistGallery.length > 0 && (
                      <div className="mb-9">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.22em] text-gold block">
                              Models Proposed by {activeUniverseMeta.name}
                            </span>
                            <h3 className="text-lg font-serif font-bold text-white">
                              Select a Signature Model or Choose from {activeUniverseMeta.name}&rsquo;s Menu Below
                            </h3>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {specialistGallery.length} {activeUniverseMeta.name} styles
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                          {specialistGallery.map((model) => {
                            const isModelActive = activeArtItem?.id === model.id;
                            return (
                              <div
                                key={model.id}
                                onClick={() => handleSelectSpecialistModel(model)}
                                className={`group relative aspect-[4/3] rounded-[1.5rem] overflow-hidden border cursor-pointer transition-all duration-300 ${
                                  isModelActive
                                    ? 'border-gold ring-2 ring-gold/40 shadow-[0_10px_30px_rgba(197,160,89,0.28)] scale-[1.01]'
                                    : 'border-white/10 hover:border-gold/50 opacity-85 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={model.imageUrl}
                                  alt={model.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                <div className="absolute top-2.5 right-2.5">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                                      isModelActive
                                        ? 'bg-gold text-black shadow-md'
                                        : 'bg-black/60 text-white/70 border border-white/20'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </span>
                                </div>
                                <div className="absolute bottom-2.5 left-3 right-3">
                                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-[0.18em] text-gold block truncate">
                                    {model.category}
                                  </span>
                                  <p className="text-xs font-serif font-bold text-white line-clamp-1">
                                    {model.title}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sleek Category Pills (Only Categories for Active Specialist) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar border-b border-white/10">
                      {CATEGORIES.map((cat) => {
                        const count =
                          cat === 'All'
                            ? specialistServices.length
                            : specialistServices.filter((s) => s.category === cat).length;
                        const isActive = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                              isActive
                                ? 'bg-gold text-black border-gold shadow-[0_4px_20px_rgba(197,160,89,0.35)]'
                                : 'bg-transparent text-gray-400 border-white/10 hover:text-white hover:border-white/25'
                            }`}
                          >
                            <span>{cat === 'All' ? `All ${activeUniverseMeta.name} Services` : cat}</span>
                            <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Fine Salon Menu Rows — Filtered Exclusively to Active Specialist */}
                    <div className="divide-y divide-white/[0.08]">
                      {filteredServices.map((service, index) => {
                        const isSelected = selectedService?.id === service.id;
                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25) }}
                            onClick={() => {
                              setSelectedServiceId(service.id);
                              setSelectedModelId(null);
                            }}
                            className={`group py-6 px-3 sm:px-5 -mx-3 sm:-mx-5 rounded-2xl transition-all duration-300 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-gold/[0.11] via-gold/[0.04] to-transparent'
                                : 'hover:bg-white/[0.025]'
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-4">
                              {/* Service Title & Badge */}
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                    isSelected
                                      ? 'bg-gold border-gold text-black scale-110 shadow-[0_0_12px_rgba(197,160,89,0.6)]'
                                      : 'border-white/25 text-transparent group-hover:border-gold/60'
                                  }`}
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>

                                <h3
                                  className={`text-lg sm:text-xl font-serif font-bold tracking-tight transition-colors truncate ${
                                    isSelected ? 'text-gold' : 'text-white group-hover:text-gold-light'
                                  }`}
                                >
                                  {service.name}
                                </h3>

                                {service.badge && (
                                  <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-[0.2em] text-gold/90 border border-gold/30 rounded-full px-2.5 py-0.5 shrink-0">
                                    {service.badge}
                                  </span>
                                )}
                              </div>

                              {/* Dotted Menu Leader Line */}
                              <div className="hidden sm:block flex-1 border-b border-dotted border-white/15 mx-2 relative -top-1" />

                              {/* Duration & Price */}
                              <div className="flex items-center gap-4 shrink-0">
                                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gold/70" />
                                  {service.duration}
                                </span>
                                <span className="text-xl sm:text-2xl font-serif font-bold text-gold tabular-nums">
                                  {service.price}
                                </span>
                              </div>
                            </div>

                            {/* Subtle Craft Description & Technique Notes */}
                            <div className="pl-8 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="max-w-xl">
                                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                                  {service.description}
                                </p>
                                {service.inclusions && service.inclusions.length > 0 && (
                                  <p className="text-[11px] font-mono text-gray-500 mt-1.5">
                                    {service.inclusions.slice(0, 3).join(' · ')}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedServiceId(service.id);
                                  setCurrentStep(2);
                                  window.scrollTo({ top: 100, behavior: 'smooth' });
                                }}
                                className={`self-start sm:self-center shrink-0 text-[11px] uppercase tracking-[0.15em] font-bold px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-gold text-black shadow-md'
                                    : 'bg-white/[0.05] text-gray-300 hover:bg-gold hover:text-black border border-white/10'
                                }`}
                              >
                                <span>Book with {activeUniverseMeta.name}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ===============================================================
                    STEP 2: DATE & TIME FOR YOUR CHOSEN SPECIALIST
                    =============================================================== */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-10"
                  >
                    {/* Dedicated Specialist Banner */}
                    <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-r from-gold/[0.12] via-white/[0.02] to-transparent border border-gold/35 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold text-black font-serif font-bold text-sm flex items-center justify-center shadow-[0_0_16px_rgba(197,160,89,0.4)]">
                          {activeBarberProfile?.initials ?? activeUniverseMeta.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-gold block">
                            Selected Specialist Chair
                          </span>
                          <h3 className="text-lg font-serif font-bold text-white">
                            {activeBarberProfile?.name ?? activeUniverseMeta.name} &mdash;{' '}
                            <span className="text-gold">{activeUniverseMeta.universeTitle}</span>
                          </h3>
                          <p className="text-xs text-gray-400">{selectedService?.name} ({selectedService?.price})</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-sans font-bold uppercase tracking-wider text-gold hover:text-white border border-gold/30 rounded-full px-4 py-2 bg-transparent cursor-pointer"
                      >
                        Change Service / Specialist
                      </button>
                    </div>

                    {/* 1. Pick Date */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-1">
                            01 &middot; Calendar
                          </span>
                          <h2 className="text-2xl font-serif font-bold text-white">
                            Select Day with {activeUniverseMeta.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={weekOffset === 0}
                            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                            className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:border-gold flex items-center justify-center disabled:opacity-30 cursor-pointer text-white"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={weekOffset >= maxWeekOffset}
                            onClick={() => setWeekOffset((w) => Math.min(maxWeekOffset, w + 1))}
                            className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:border-gold flex items-center justify-center disabled:opacity-30 cursor-pointer text-white"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                        {currentWeekDays.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isSelected = selectedDate === dateStr;
                          const isSunday = day.getDay() === 0 || day > lastBookableDay;

                          return (
                            <button
                              key={dateStr}
                              type="button"
                              disabled={isSunday}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`py-3.5 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                                isSunday
                                  ? 'opacity-30 bg-transparent border-white/5 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-gold text-black border-gold font-bold shadow-[0_6px_24px_rgba(197,160,89,0.35)] scale-[1.03]'
                                  : 'bg-white/[0.02] border-white/10 text-gray-300 hover:border-gold/50'
                              }`}
                            >
                              <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                                {format(day, 'EEE')}
                              </span>
                              <span className="text-xl font-serif font-bold my-0.5">
                                {format(day, 'd')}
                              </span>
                              <span className="text-[10px] font-mono opacity-75">
                                {isSunday ? 'Closed' : format(day, 'MMM')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Pick Time Slot */}
                    <div>
                      <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-1">
                        02 &middot; Time Slot
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-white mb-4">
                        Available Chair Hours for {activeUniverseMeta.name}
                      </h2>

                      <div className="flex flex-wrap gap-2.5">
                        {TIME_SLOTS.map((slot) => {
                          const isSelected = selectedTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2.5 px-5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gold text-black border-gold font-bold shadow-[0_4px_18px_rgba(197,160,89,0.35)]'
                                  : 'bg-white/[0.02] border-white/12 text-gray-300 hover:border-gold/50 hover:text-white'
                              }`}
                            >
                              {formatTime12h(slot)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2 Footer Navigation */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(1);
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-gold flex items-center gap-2 cursor-pointer bg-transparent border-none"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to {activeUniverseMeta.name}&rsquo;s Menu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(3);
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        className="btn-gold rounded-full! text-xs px-7 py-3.5"
                      >
                        <span>Continue to Guest Info</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ===============================================================
                    STEP 3: GUEST DETAILS (MINIMALIST ATELIER INPUTS)
                    =============================================================== */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-8"
                  >
                    <div>
                      <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-1">
                        Step 03 &middot; Personalization
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                        Your Guest Pass Details
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Enter your name and contact details so we can issue your reservation pass with{' '}
                        <strong className="text-gold">{activeBarberProfile?.name ?? activeUniverseMeta.name}</strong>.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => {
                              setGuestName(e.target.value);
                              if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                            }}
                            placeholder="Jordan Miller"
                            maxLength={LIMITS.name}
                            autoComplete="name"
                            className={`w-full bg-white/[0.03] border rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors ${
                              formErrors.name ? 'border-red-500' : 'border-white/15 focus:border-gold'
                            }`}
                          />
                          <User className="w-4 h-4 text-gold/70 absolute left-4 top-4" />
                        </div>
                        {formErrors.name && (
                          <p className="text-xs text-red-400 mt-1.5 font-mono">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">
                          Email Address (For Pass Confirmation) *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => {
                              setGuestEmail(e.target.value);
                              if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                            placeholder="jordan@example.com"
                            maxLength={LIMITS.email}
                            autoComplete="email"
                            inputMode="email"
                            className={`w-full bg-white/[0.03] border rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors ${
                              formErrors.email ? 'border-red-500' : 'border-white/15 focus:border-gold'
                            }`}
                          />
                          <Mail className="w-4 h-4 text-gold/70 absolute left-4 top-4" />
                        </div>
                        {formErrors.email && (
                          <p className="text-xs text-red-400 mt-1.5 font-mono">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-2">
                          Mobile Phone (Optional for SMS Updates)
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => {
                              setGuestPhone(e.target.value);
                              if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                            }}
                            placeholder="+1 (619) 000-0000"
                            maxLength={LIMITS.phone + 10}
                            autoComplete="tel"
                            inputMode="tel"
                            className={`w-full bg-white/[0.03] border rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors ${
                              formErrors.phone ? 'border-red-500' : 'border-white/15 focus:border-gold'
                            }`}
                          />
                          <Phone className="w-4 h-4 text-gold/70 absolute left-4 top-4" />
                        </div>
                        {formErrors.phone && (
                          <p className="text-xs text-red-400 mt-1.5 font-mono">{formErrors.phone}</p>
                        )}
                      </div>

                      {/* Special Notes */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-2">
                          Styling Notes or Texture Requests (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={specialNotes}
                          onChange={(e) => {
                            setSpecialNotes(e.target.value);
                            if (formErrors.notes) setFormErrors((prev) => ({ ...prev, notes: undefined }));
                          }}
                          placeholder={
                            activeSpecialist === 'mika'
                              ? 'e.g. Mid-back length knotless, boho human hair curls, gentle edges...'
                              : 'e.g. Low drop skin fade, keep crown length, sharp razor beard line...'
                          }
                          maxLength={LIMITS.notes}
                          className={`w-full bg-white/[0.03] border rounded-xl p-4 text-sm text-white placeholder-gray-500 outline-none transition-colors resize-none ${
                            formErrors.notes ? 'border-red-500' : 'border-white/15 focus:border-gold'
                          }`}
                        />
                        {formErrors.notes && (
                          <p className="text-xs text-red-400 mt-1.5 font-mono">{formErrors.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(2);
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-gold flex items-center gap-2 cursor-pointer bg-transparent border-none"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Schedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep3()) {
                            setCurrentStep(4);
                            window.scrollTo({ top: 100, behavior: 'smooth' });
                          }
                        }}
                        className="btn-gold rounded-full! text-xs px-7 py-3.5"
                      >
                        <span>Review Atelier Pass</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ===============================================================
                    STEP 4: FINAL ATELIER RESERVATION PASS CONFIRMATION
                    =============================================================== */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-8"
                  >
                    <div>
                      <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-1">
                        Step 04 &middot; Final Verification
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                        Confirm Your Atelier Pass
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400">
                        No advance deposit is required. You pay in shop only after your service with{' '}
                        <strong className="text-gold">{activeBarberProfile?.name ?? activeUniverseMeta.name}</strong> is completed.
                      </p>
                    </div>

                    {/* Perforated Atelier Pass */}
                    <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-[#131318] to-[#0B0B0E] p-6 sm:p-8 shadow-2xl space-y-6">
                      <div className="flex items-center justify-between border-b border-dashed border-white/15 pb-5">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold block">
                            {site.name} &middot; {activeUniverseMeta.universeTitle}
                          </span>
                          <h3 className="text-2xl font-serif font-bold text-white mt-1">
                            {selectedService?.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-gold block">
                            {selectedService?.price}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">
                            {selectedService?.duration}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                            Date &amp; Time
                          </span>
                          <span className="text-white font-bold text-sm block">{selectedDate}</span>
                          <span className="text-gold font-mono font-bold">
                            {formatTime12h(selectedTime)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                            Master Specialist
                          </span>
                          <span className="text-white font-bold text-sm block">
                            {activeBarberProfile?.name ?? activeUniverseMeta.name}
                          </span>
                          <span className="text-gold text-[11px] block">
                            {activeUniverseMeta.universeTitle}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                            Guest Holder
                          </span>
                          <span className="text-white font-bold text-sm block">{guestName}</span>
                          <span className="text-gray-400 font-mono text-[11px] break-all">
                            {guestEmail}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold" />
                          {site.contact.address}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">$0 Due Today</span>
                      </div>
                    </div>

                    {submitError && (
                      <p
                        role="alert"
                        className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-4 py-3 rounded-xl"
                      >
                        {submitError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(3);
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-gold flex items-center gap-2 cursor-pointer bg-transparent border-none"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Edit Guest Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmReservation}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto btn-gold rounded-full! text-xs sm:text-sm px-10 py-4 font-black"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Issuing Atelier Pass...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Confirm with {activeUniverseMeta.name}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* RIGHT 5 COLUMNS: STICKY ARTISAN LOOKBOOK & LIVE CHAIR PREVIEW */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                <div className="rounded-3xl overflow-hidden border border-white/12 bg-[#0E0E12] shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
                  {/* Live Visual Hair Artistry Showcase (Strictly From Active Specialist) */}
                  {activeArtItem && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeArtItem.imageUrl}
                          initial={{ opacity: 0.3, scale: 1.06 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0.3 }}
                          transition={{ duration: 0.5 }}
                          src={activeArtItem.imageUrl}
                          alt={activeArtItem.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/30 to-transparent" />

                      <div className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md border border-gold/40 rounded-full px-3.5 py-1 flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase tracking-widest text-gold">
                        <span>{activeUniverseMeta.name} Exclusive Model</span>
                      </div>

                      <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                            {activeUniverseMeta.universeTitle}
                          </span>
                          <p className="text-sm font-serif font-bold text-white line-clamp-1">
                            {activeArtItem.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-gold text-xs font-bold shrink-0">
                          <span>5.0</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Craft Details & Live Summary */}
                  <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.18em] text-gray-400">
                        Dedicated Specialist
                      </span>
                      <span className="text-xs font-serif font-bold text-gold">
                        {activeBarberProfile?.name ?? activeUniverseMeta.name} ({activeUniverseMeta.universeTitle})
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold block mb-1">
                          Selected Craft
                        </span>
                        <h3 className="text-xl font-serif font-bold text-white">
                          {selectedService?.name}
                        </h3>
                        <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          {selectedService?.duration} &middot; {selectedService?.category}
                        </span>
                      </div>
                      <span className="text-2xl font-serif font-bold text-gold tabular-nums">
                        {selectedService?.price}
                      </span>
                    </div>

                    {/* What's Included in the Craft */}
                    {selectedService?.inclusions && selectedService.inclusions.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 block mb-2.5">
                          {activeUniverseMeta.name}&rsquo;s Technique Includes
                        </span>
                        <ul className="space-y-2 text-xs text-gray-300">
                          {selectedService.inclusions.map((inc, i) => (
                            <li key={i} className="flex items-center gap-2.5">
                              <Scissors className="w-3 h-3 text-gold shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Primary Step CTA inside Sticky Atelier Card */}
                    {currentStep === 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(2);
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        className="w-full btn-gold rounded-full! text-xs py-4 font-black"
                      >
                        <span>Choose Date &amp; Time with {activeUniverseMeta.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <p className="text-[11px] font-mono text-center text-gray-500">
                      $0 Online Deposit &middot; Pay in Shop After Service
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CallShopModal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} />
    </div>
  );
}

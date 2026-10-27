import { useState, useEffect } from 'react';
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
  ArrowRight,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday } from 'date-fns';
import CallShopModal from '../../components/CallShopModal';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import { bookAppointment, errorMessage, formatTime12h } from '../../lib/site/api';
import { BOOKING_WINDOW_DAYS, LIMITS, bookingSchema, check } from '../../lib/site/validation';
import { useSubmitLock } from '../../lib/site/useSubmitLock';
import type { BookingConfirmation } from '../../types/content';

interface BookingPageProps {
  onBackToHome: () => void;
  initialBarber?: string;
  initialService?: string;
}

export default function BookingPage({ onBackToHome, initialBarber, initialService }: BookingPageProps) {
  // Step navigation: 1 = Craft Menu, 2 = Artisan & Time, 3 = Guest Details, 4 = Confirm Pass
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { services: SERVICES, barbers, gallery, site } = useSiteData();
  const CATEGORIES = ['All', ...Array.from(new Set(SERVICES.map((s) => s.category)))];
  const TIME_SLOTS = site.booking.timeSlots;
  const BARBERS = [
    { id: 'any', name: 'First Available Master Artist', role: 'Fastest Chair Availability', phone: '', initials: 'FS' },
    ...barbers.map((b) => ({ id: b.id, name: b.name, role: b.role, phone: b.phone, initials: b.initials }))
  ];

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialService && SERVICES.some(s => s.id === initialService) ? initialService : SERVICES[0]?.id
  );
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0] ?? '');
  const [selectedBarber, setSelectedBarber] = useState(
    initialBarber && barbers.some((b) => b.id === initialBarber) ? initialBarber : 'any'
  );
  const [weekOffset, setWeekOffset] = useState(0);

  // Guest Information (For Ticket and Reservation Number)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string; notes?: string }>({});
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

  const selectedService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0];

  // Match an authentic portfolio artwork image to the currently selected service / category
  const getArtImageForService = (serviceName?: string, category?: string) => {
    if (!gallery || gallery.length === 0) return null;
    const text = `${serviceName ?? ''} ${category ?? ''}`.toLowerCase();
    if (text.includes('braid') || text.includes('loc') || text.includes('cornrow') || text.includes('twist')) {
      return gallery.find((g) => g.barber.toLowerCase().includes('mika') || g.category.toLowerCase().includes('braid')) || gallery[0];
    }
    if (text.includes('beard') || text.includes('shave')) {
      return gallery.find((g) => g.title.toLowerCase().includes('beard') || g.category.toLowerCase().includes('beard')) || gallery[1] || gallery[0];
    }
    return gallery.find((g) => g.barber.toLowerCase().includes('lusca') || g.category.toLowerCase().includes('fade')) || gallery[0];
  };

  const activeArtItem = getArtImageForService(selectedService?.name, selectedService?.category);

  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => 
    addDays(startOfToday(), weekOffset * 7 + i)
  );
  const lastBookableDay = addDays(startOfToday(), BOOKING_WINDOW_DAYS);
  const maxWeekOffset = Math.floor(BOOKING_WINDOW_DAYS / 7);

  const bookingInput = () => ({
    serviceSlug: selectedService?.id,
    date: selectedDate,
    time: selectedTime,
    teamMemberSlug: selectedBarber === 'any' ? null : selectedBarber,
    name: guestName,
    email: guestEmail,
    phone: guestPhone,
    notes: specialNotes
  });

  // Validation before going to Step 4
  const validateStep3 = () => {
    type GuestField = 'name' | 'email' | 'phone' | 'notes';
    const errors: Partial<Record<GuestField, string>> = {};
    const guest: Record<GuestField, string> = { name: guestName, email: guestEmail, phone: guestPhone, notes: specialNotes };
    const neutral: Record<GuestField, string> = { name: 'Valid Name', email: '', phone: '', notes: '' };
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

  const filteredServices = SERVICES.filter(
    (service) => selectedCategory === 'All' || service.category === selectedCategory
  );

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
              Thank you <strong className="text-white">{guestName.trim().split(' ')[0]}</strong>. Your private chair is reserved. A copy of your pass has been sent to <strong className="text-gold">{guestEmail || guestPhone}</strong>.
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
                <span className="text-white font-serif font-bold text-lg">{confirmedData?.serviceName}</span>
                <span className="text-gold font-mono font-bold">
                  {confirmedData?.appointmentDate} &middot; {confirmedData ? formatTime12h(confirmedData.appointmentTime) : ''}
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
             ARTISAN SALON ATELIER BOOKING EXPERIENCE (ZERO HEAVY BOXES)
             ========================================================================= */
          <div>
            
            {/* Editorial Atelier Header + Visual Art Strip */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/10 mb-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-gold font-mono text-[11px] uppercase tracking-[0.25em] font-bold mb-3">
                  <span>The Artisan Atelier &middot; {site.name}</span>
                </div>
                <h1
                  className="font-serif italic text-white leading-[1.02] tracking-tight"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
                >
                  Reserve Your <span className="not-italic font-sans font-black uppercase text-gold">Master Chair</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed max-w-xl">
                  Every haircut, zero skin fade, and protective braid style is handcrafted to your cranial structure and hair texture. Select your craft below.
                </p>
              </div>

              {/* Minimalist Stepper (Unboxed Architectural Line) */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0 overflow-x-auto pb-2 lg:pb-0">
                {[
                  { num: 1, label: 'Craft' },
                  { num: 2, label: 'Schedule' },
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

            {/* 2-Column Split Atelier Layout: Left = Interactive Salon Menu / Steps, Right = Sticky Live Art & Chair Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* LEFT 7 COLUMNS: UNBOXED SALON MENU & STEPS */}
              <div className="lg:col-span-7">
                
                {/* ===============================================================
                    STEP 1: THE ARTISAN SERVICE MENU (EDITORIAL LIST, NO BIG BOXES)
                    =============================================================== */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    {/* Sleek Category Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar border-b border-white/10">
                      {CATEGORIES.map((cat) => {
                        const count = cat === 'All'
                          ? SERVICES.length
                          : SERVICES.filter((s) => s.category === cat).length;
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
                            <span>{cat}</span>
                            <span className={`ml-1.5 text-[10px] opacity-75`}>({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Fine Salon Menu Rows — Separated by Hairline Dividers */}
                    <div className="divide-y divide-white/[0.08]">
                      {filteredServices.map((service, index) => {
                        const isSelected = selectedServiceId === service.id;
                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25) }}
                            onClick={() => setSelectedServiceId(service.id)}
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

                              {/* Duration & Price + Instant Select Action */}
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
                                <span>Book Craft</span>
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
                    STEP 2: CHOOSE MASTER ARTISAN, DATE & TIME
                    =============================================================== */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-10"
                  >
                    {/* 1. Select Master Artisan */}
                    <div>
                      <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-2">
                        01 &middot; Master Artisan
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-white mb-5">
                        Choose Your Artist
                      </h2>

                      <div className="divide-y divide-white/10 border-y border-white/10">
                        {BARBERS.map((barber) => {
                          const isSelected = selectedBarber === barber.id;
                          return (
                            <div
                              key={barber.id}
                              onClick={() => setSelectedBarber(barber.id)}
                              className={`py-4 px-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                                isSelected ? 'bg-gold/[0.09]' : 'hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-sm border transition-all ${
                                    isSelected
                                      ? 'bg-gold text-black border-gold shadow-[0_0_16px_rgba(197,160,89,0.4)]'
                                      : 'bg-[#121216] text-gold border-white/15'
                                  }`}
                                >
                                  {barber.initials}
                                </div>
                                <div>
                                  <h3 className={`font-serif font-bold text-base ${isSelected ? 'text-gold' : 'text-white'}`}>
                                    {barber.name}
                                  </h3>
                                  <p className="text-xs text-gray-400">{barber.role}</p>
                                </div>
                              </div>

                              <span
                                className={`text-xs font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                                  isSelected
                                    ? 'bg-gold text-black border-gold font-bold'
                                    : 'border-white/15 text-gray-400'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Pick Date */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-1">
                            02 &middot; Calendar
                          </span>
                          <h2 className="text-2xl font-serif font-bold text-white">
                            Select Day
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

                    {/* 3. Pick Time Slot */}
                    <div>
                      <span className="text-gold font-mono text-[11px] uppercase tracking-[0.22em] font-bold block mb-1">
                        03 &middot; Time Slot
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-white mb-4">
                        Available Chair Hours
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
                        <span>Back to Craft Menu</span>
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
                        Enter your name and contact details so we can issue your reservation pass.
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
                          placeholder="e.g. Low drop fade, keep crown length, sensitive scalp..."
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
                        No advance deposit is required. You pay in shop only after your cut or style is completed.
                      </p>
                    </div>

                    {/* Perforated Atelier Pass */}
                    <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-[#131318] to-[#0B0B0E] p-6 sm:p-8 shadow-2xl space-y-6">
                      <div className="flex items-center justify-between border-b border-dashed border-white/15 pb-5">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold block">
                            {site.name}
                          </span>
                          <h3 className="text-2xl font-serif font-bold text-white mt-1">
                            {selectedService.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-gold block">
                            {selectedService.price}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">{selectedService.duration}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                            Date &amp; Time
                          </span>
                          <span className="text-white font-bold text-sm block">
                            {selectedDate}
                          </span>
                          <span className="text-gold font-mono font-bold">
                            {formatTime12h(selectedTime)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                            Master Artisan
                          </span>
                          <span className="text-white font-bold text-sm block">
                            {BARBERS.find((b) => b.id === selectedBarber)?.name || 'First Available'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                            Guest Holder
                          </span>
                          <span className="text-white font-bold text-sm block">{guestName}</span>
                          <span className="text-gray-400 font-mono text-[11px] break-all">{guestEmail}</span>
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
                      <p role="alert" className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-4 py-3 rounded-xl">
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
                            <span>Confirm Appointment Now</span>
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
                  
                  {/* Live Visual Hair Artistry Showcase */}
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

                      <div className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md border border-gold/40 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gold">
                        <span>Signature Craft</span>
                      </div>

                      <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                            Artistry Preview
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
                          Artisan Technique Includes
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
                        <span>Choose Date &amp; Time</span>
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

      <CallShopModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

    </div>
  );
}

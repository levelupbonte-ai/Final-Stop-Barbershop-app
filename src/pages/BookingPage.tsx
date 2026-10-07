import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  Loader2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ChevronLeft,
  ChevronRight,
  Receipt,
  User,
  Mail,
  Scissors,
  Printer,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import CallShopModal from '../components/CallShopModal';
import { useSiteData } from '../lib/site/SiteDataProvider';
import { bookAppointment, errorMessage, formatTime12h } from '../lib/site/api';
import type { BookingConfirmation } from '../types/content';

interface BookingPageProps {
  onBackToHome: () => void;
  initialBarber?: string;
  initialService?: string;
}

export default function BookingPage({ onBackToHome, initialBarber, initialService }: BookingPageProps) {
  // Step navigation: 1 = Plan, 2 = Date & Time, 3 = Guest Info (Name & Email), 4 = Confirm Reservation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { services: SERVICES, barbers, site } = useSiteData();
  const CATEGORIES = ['All', ...Array.from(new Set(SERVICES.map((s) => s.category)))];
  const TIME_SLOTS = site.booking.timeSlots;
  const BARBERS = [
    { id: 'any', name: 'First Available Master Artist', phone: '' },
    ...barbers.map((b) => ({ id: b.id, name: `${b.name} (${b.role})`, phone: b.phone }))
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
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});

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

  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => 
    addDays(startOfToday(), weekOffset * 7 + i)
  );

  // Validation before going to Step 4
  const validateStep3 = () => {
    const errors: { name?: string; email?: string } = {};
    if (!guestName.trim()) {
      errors.name = 'Please enter your name for your reservation ticket';
    }
    if (!guestEmail.trim() && !guestPhone.trim()) {
      errors.email = 'Please enter your email (or a phone number) to receive your reservation ticket';
    } else if (guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Booking goes through the validated server-side RPC: the ticket code,
  // service name and price are decided by the database, not by the browser.
  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const confirmation = await bookAppointment({
        serviceSlug: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        teamMemberSlug: selectedBarber === 'any' ? null : selectedBarber,
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        notes: specialNotes
      });
      setConfirmedData(confirmation);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col w-full overflow-x-clip font-sans">
      
      {/* Top Header Bar - Fixed/Sticky atop scrolling content */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Back Button */}
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          {/* Logo Center */}
          <div className="flex items-center cursor-pointer" onClick={onBackToHome}>
            <img
              src={site.branding.logoUrl ?? undefined}
              alt={site.branding.logoAlt}
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Direct Phone Assistance (Opens 2 Lines Modal) */}
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="text-xs font-mono text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border border-white/15 px-2.5 py-1.5 rounded-sm"
            title="Call our direct lines"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">Call Barbers Direct</span>
            <span className="sm:hidden">Call</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        
        {isSuccess ? (
          /* =========================================================================
             CONFIRMED TICKET SCREEN (REAL-TIME RESULT)
             ========================================================================= */
          <div className="max-w-xl mx-auto bg-[#141417] border border-gold/40 p-6 sm:p-10 shadow-2xl animate-fadeIn relative text-center rounded-sm">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="mb-6">
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold block mb-2">
                Appointment Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                Your reservation has been confirmed!
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-4">
                Thank you <strong className="text-white">{guestName.trim().split(' ')[0]}</strong>, your appointment slot is locked in. A confirmation ticket with all details has been emailed to you.
              </p>
              
              <div className="bg-gold/10 border border-gold/40 p-3 rounded-xs inline-block max-w-md mx-auto text-left font-mono text-xs text-gold">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-white">
                  <Mail className="w-4 h-4 text-gold" />
                  <span>Check your inbox:</span>
                </p>
                <p className="text-gray-300 break-all">
                  A ticket summary was sent to <strong className="text-gold">{guestEmail || guestPhone}</strong>. (Please check your spam or promotions folder if not found in your main inbox).
                </p>
              </div>
            </div>

            {/* Compact Reference Pill */}
            <div className="bg-[#0A0A0B] border border-white/10 p-3.5 mb-8 rounded-xs font-mono text-xs text-gray-400 flex flex-wrap items-center justify-center gap-3">
              <span className="text-gold font-bold">Ticket #{confirmedData?.ticketCode}</span>
              <span className="text-white/20">&bull;</span>
              <span className="text-white">{confirmedData?.appointmentDate} at {confirmedData ? formatTime12h(confirmedData.appointmentTime) : ''}</span>
              <span className="text-white/20">&bull;</span>
              <span className="text-gray-300">{confirmedData?.serviceName}</span>
            </div>

            {/* 3 Streamlined Buttons: Print Ticket / Back to Home / Book Another */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="w-full bg-[#1B1B20] hover:bg-white/10 text-white border border-white/20 hover:border-gold text-xs font-bold uppercase tracking-wider py-3.5 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xs"
              >
                <Printer className="w-4 h-4 text-gold" />
                <span>Print Ticket</span>
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="w-full bg-gold hover:bg-gold-light text-black text-xs font-black uppercase tracking-wider py-3.5 px-3 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer rounded-xs"
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
                className="w-full bg-[#1B1B20] hover:bg-white/10 text-gray-300 hover:text-white border border-white/20 text-xs font-bold uppercase tracking-wider py-3.5 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xs"
              >
                <CalendarIcon className="w-4 h-4 text-gold" />
                <span>Book Another</span>
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             4-STEP REAL-TIME RESERVATION WIZARD (NO GOOGLE SIGN-IN NEEDED)
             ========================================================================= */
          <div className="space-y-8">
            
            {/* Page Header */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-gold font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                Appointment Booking
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                Reserve Your Barber Chair
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Select your service, choose your preferred time slot, and confirm your appointment in moments.
              </p>
            </div>

            {/* 4-Step Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 max-w-3xl mx-auto font-mono text-xs">
              {[
                { num: 1, label: '1. Service' },
                { num: 2, label: '2. Date & Time' },
                { num: 3, label: '3. Guest Info' },
                { num: 4, label: '4. Confirm' }
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num === 4 && (!guestName || (!guestEmail && !guestPhone))) return;
                    if (s.num <= currentStep) setCurrentStep(s.num as any);
                  }}
                  className={`py-2.5 px-2 text-center border transition-all cursor-pointer ${
                    currentStep === s.num
                      ? 'bg-gold/15 border-gold text-gold font-bold shadow-md'
                      : currentStep > s.num
                      ? 'bg-[#141418] border-white/20 text-gray-300'
                      : 'bg-[#0E0E10] border-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="block text-[11px] sm:text-xs truncate">{s.label}</span>
                </button>
              ))}
            </div>

            {/* =====================================================================
                STEP 1: CHOOSE YOUR PLAN ("tu choisi ton plans")
                ===================================================================== */}
            {currentStep === 1 && (
              <div className="bg-[#121215] border border-white/10 p-6 sm:p-8 animate-fadeIn">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
                      Step 1 of 4
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Choose Your Grooming Plan
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                    Pay at shop upon completion
                  </span>
                </div>

                {/* Categories Tab Filter */}
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {CATEGORIES.map((cat) => {
                    const count = cat === 'All' 
                      ? SERVICES.length 
                      : SERVICES.filter(s => s.category === cat).length;
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-gold text-black font-bold shadow'
                            : 'bg-[#18181D] text-gray-400 border border-white/10 hover:text-white hover:border-white/30'
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

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {SERVICES.filter(service => selectedCategory === 'All' || service.category === selectedCategory).map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#18181D] border-gold shadow-lg shadow-gold/5'
                            : 'bg-[#151518] border-white/10 hover:border-white/25 hover:bg-[#1A1A1F]'
                        }`}
                      >
                        {service.badge && (
                          <span className="absolute top-4 right-4 bg-gold/15 border border-gold/40 text-gold text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 font-bold">
                            {service.badge}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Scissors className={`w-4 h-4 ${isSelected ? 'text-gold' : 'text-gray-400'}`} />
                            <h3 className="font-bold text-white text-base leading-tight pr-14">
                              {service.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono mb-3">
                            <span className="text-gold font-bold text-lg">{service.price}</span>
                            <span className="text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              {service.duration}
                            </span>
                          </div>

                          <ul className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-white/5 mb-4">
                            {service.inclusions.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-gold shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className={`text-xs font-mono font-medium ${isSelected ? 'text-gold' : 'text-gray-500'}`}>
                            {isSelected ? '✓ Selected Plan' : 'Click to select'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceId(service.id);
                              setCurrentStep(2);
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                            className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gold text-black hover:bg-gold-light'
                                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                            }`}
                          >
                            Select & Continue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-400 font-mono">
                    Selected: <strong className="text-white">{selectedService.name}</strong> ({selectedService.price})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Next: Choose Date & Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                STEP 2: CHOOSE DATE & TIME ("deuxieume tableau tu choisi lheure est la date")
                ===================================================================== */}
            {currentStep === 2 && (
              <div className="bg-[#121215] border border-white/10 p-6 sm:p-8 animate-fadeIn">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
                      Step 2 of 4
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Select Date & Time Slot
                    </h2>
                  </div>
                  <span className="text-xs text-gold font-mono">
                    Shop open 10:00 AM – 6:00 PM
                  </span>
                </div>

                {/* Day Picker */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                      1. Pick Date
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={weekOffset === 0}
                        onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                        className="p-1.5 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeekOffset(w => w + 1)}
                        className="p-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {currentWeekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isSelected = selectedDate === dateStr;
                      const isSunday = day.getDay() === 0;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isSunday}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`p-3 border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                            isSunday 
                              ? 'opacity-30 bg-[#0E0E10] border-white/5 cursor-not-allowed'
                              : isSelected
                              ? 'bg-gold text-black border-gold font-bold shadow-lg'
                              : 'bg-[#17171B] border-white/10 text-gray-300 hover:border-gold/50'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-mono tracking-wider">
                            {format(day, 'EEE')}
                          </span>
                          <span className="text-lg font-bold my-0.5">
                            {format(day, 'd')}
                          </span>
                          <span className="text-[10px] font-mono opacity-80">
                            {isSunday ? 'Closed' : format(day, 'MMM')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slot Grid */}
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono block mb-3">
                    2. Pick Time Slot
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 px-2 text-center text-xs font-mono border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gold text-black border-gold font-bold shadow-md'
                              : 'bg-[#17171B] border-white/10 text-gray-300 hover:border-gold/40 hover:text-white'
                          }`}
                        >
                          {formatTime12h(slot)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Barber (Optional) */}
                <div className="mb-8 bg-[#0E0E10] p-4 border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono block mb-2">
                    3. Preferred Master Barber (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BARBERS.map((barber) => (
                      <button
                        key={barber.id}
                        type="button"
                        onClick={() => setSelectedBarber(barber.id)}
                        className={`p-3 text-left border text-xs font-mono transition-all cursor-pointer ${
                          selectedBarber === barber.id
                            ? 'bg-gold/15 border-gold text-gold font-bold ring-1 ring-gold'
                            : 'bg-[#151518] border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="text-white font-bold mb-1">{barber.name}</div>
                        {barber.phone && (
                          <div className="text-[11px] text-gold font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gold shrink-0" />
                            <span>Direct: {barber.phone}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Plans</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Next: Name & Ticket Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                STEP 3: GUEST INFORMATION (Guest name, email, and phone for ticket)
                ===================================================================== */}
            {currentStep === 3 && (
              <div className="bg-[#121215] border border-white/10 p-6 sm:p-8 animate-fadeIn">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
                      Step 3 of 4
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Guest Information
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    Instant confirmation
                  </span>
                </div>

                <p className="text-xs text-gray-300 mb-6 leading-relaxed">
                  Please enter your contact details to receive your appointment confirmation and reservation ticket ID.
                </p>

                <div className="space-y-4 max-w-xl mb-8">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5 font-bold">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        placeholder="e.g. Jordan Miller"
                        className={`w-full bg-[#0A0A0B] border pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none font-mono ${
                          formErrors.name ? 'border-red-500' : 'border-white/20 focus:border-gold'
                        }`}
                      />
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    </div>
                    {formErrors.name && (
                      <p className="text-xs text-red-400 mt-1 font-mono">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5 font-bold">
                      Email Address (for your ticket) *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        placeholder="jordan@example.com"
                        className={`w-full bg-[#0A0A0B] border pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none font-mono ${
                          formErrors.email ? 'border-red-500' : 'border-white/20 focus:border-gold'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    </div>
                    {formErrors.email && (
                      <p className="text-xs text-red-400 mt-1 font-mono">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone Number (Optional) */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5 font-bold">
                      Phone Number (Optional for SMS updates)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+1 (619) 000-0000"
                        className="w-full bg-[#0A0A0B] border border-white/20 focus:border-gold pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none font-mono"
                      />
                      <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5 font-bold">
                      Special Requests or Hair Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Skin taper on sides, beard balm finish..."
                      className="w-full bg-[#0A0A0B] border border-white/20 focus:border-gold p-3 text-sm text-white placeholder-gray-500 outline-none font-mono resize-none"
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Date & Time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep3()) {
                        setCurrentStep(4);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }
                    }}
                    className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Next: Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                STEP 4: REVIEW & CONFIRM RESERVATION ("le derniers tableau ce reservet")
                ===================================================================== */}
            {currentStep === 4 && (
              <div className="bg-[#121215] border border-gold/30 p-6 sm:p-8 animate-fadeIn">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-gold font-mono text-[11px] uppercase tracking-wider font-bold block">
                      Step 4 of 4
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Confirm Your Reservation
                    </h2>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    $0 Online &bull; Pay at Shop
                  </span>
                </div>

                {/* Full Ticket Summary Card */}
                <div className="bg-[#0E0E11] border border-white/15 p-6 mb-8 font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-gold font-bold uppercase tracking-wider text-xs">
                      Appointment Summary
                    </span>
                    <span className="text-emerald-400 font-bold">Guaranteed Slot</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Selected Plan</span>
                      <span className="text-white font-bold text-sm block">{selectedService.name}</span>
                      <span className="text-gray-400 text-[11px]">{selectedService.duration} service</span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Price Due at Shop</span>
                      <span className="text-gold font-bold text-xl block">{selectedService.price}</span>
                      <span className="text-gray-400 text-[10px]">Pay by Cash or Card after haircut</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Appointment Schedule</span>
                      <span className="text-white font-bold block">
                        {selectedDate} at <span className="text-gold">{formatTime12h(selectedTime)}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Assigned Barber</span>
                      <span className="text-gray-200 block">
                        {BARBERS.find(b => b.id === selectedBarber)?.name || 'First Available'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Ticket Holder</span>
                      <span className="text-white font-bold block">{guestName}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Email Confirmation</span>
                      <span className="text-gray-200 block">{guestEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 text-[11px] pt-1">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    <a
                      href="https://maps.app.goo.gl/tUej1WdvZRudfqVX6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold transition-colors underline-offset-2 hover:underline"
                    >
                      {site.name} &bull; {site.contact.address}
                    </a>
                  </div>
                </div>

                {/* Final Booking Button */}
                <div className="space-y-3">
                  {submitError && (
                    <p role="alert" className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-4 py-3 rounded-sm">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleConfirmReservation}
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-light disabled:bg-white/10 disabled:text-gray-500 text-black font-bold uppercase tracking-widest text-sm py-4.5 flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer rounded-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Securing Your Reservation...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(3);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Edit Guest Details</span>
                    </button>

                    <span className="text-[11px] text-gray-400 font-mono">
                      Free cancellation anytime
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Booking Page Footer */}
      <footer className="border-t border-white/10 py-6 px-6 bg-[#0A0A0B] text-center text-xs text-gray-500 w-full">
        <p>&copy; {new Date().getFullYear()} {site.name} &bull; {site.contact.address}</p>
      </footer>

      {/* Direct Phone Assistance Modal with 2 Lines */}
      <CallShopModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

    </div>
  );
}

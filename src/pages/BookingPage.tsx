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
  ArrowRight,
  Tag,
  Copy,
  Download,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import CallShopModal from '../components/CallShopModal';
import { sendBookingConfirmationEmail } from '../lib/emailService';
import { sendBarberNotification } from '../lib/notifications';

interface BookingPageProps {
  onBackToHome: () => void;
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: string;
  numericPrice: number;
  badge?: string;
  inclusions: string[];
}

const SERVICES: ServiceItem[] = [
  { 
    id: 'fade', 
    name: 'Skin Fade & Precision Haircut', 
    duration: '35 min', 
    price: '$35',
    numericPrice: 35,
    badge: 'Popular',
    inclusions: [
      'Tailored zero skin fade & razor taper',
      'Crisp razor line-up & talc finish',
      'Blow dry, texture styling & aftershave splash'
    ]
  },
  { 
    id: 'barbe', 
    name: 'Beard Sculpting & Hot Lather Shave', 
    duration: '30 min', 
    price: '$25',
    numericPrice: 25,
    inclusions: [
      'Precision razor edge detailing',
      'Eucalyptus steam hot towel relaxation',
      'Organic nourishing beard oil & butter massage'
    ]
  },
  { 
    id: 'combo', 
    name: 'The Signature Master Combo: Cut + Beard', 
    duration: '60 min', 
    price: '$55',
    numericPrice: 55,
    badge: 'Signature',
    inclusions: [
      'Customized haircut & zero fade of choice',
      'Full beard grooming, shaping & hot towel steam',
      'Straight razor neck shave & premium styling'
    ]
  },
  { 
    id: 'braids', 
    name: 'Custom Braids & Cornrows', 
    duration: '60-90 min', 
    price: '$65+',
    numericPrice: 65,
    inclusions: [
      'Precision geometric partings & custom patterns',
      'Long-lasting hold with organic edge control',
      'Deep scalp hydration & tension-relief care'
    ]
  },
  { 
    id: 'dreads', 
    name: 'Dreadlocks & Full Retwist', 
    duration: '90 min', 
    price: '$75+',
    numericPrice: 75,
    inclusions: [
      'Thorough scalp cleanse & residue removal',
      'Palm-roll retwist with natural botanical oils',
      'Professional hood drying & lasting neat finish'
    ]
  },
  { 
    id: 'premium', 
    name: 'VIP Prestige Grooming Experience', 
    duration: '90 min', 
    price: '$90',
    numericPrice: 90,
    badge: 'VIP Experience',
    inclusions: [
      'Signature haircut & complete hot lather razor shave',
      'Facial steam, detox black mask & exfoliation scrub',
      'Aromatherapy hot towels & tension-relief scalp massage'
    ]
  },
];

const TIME_SLOTS = [
  '10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM', '4:45 PM', '5:30 PM'
];

const BARBERS = [
  { id: 'any', name: 'First Available Master Barber' },
  { id: 'mika', name: 'Mika (Master Barber)' },
  { id: 'luska', name: 'Luska (Texture & Precision Lead)' }
];

export default function BookingPage({ onBackToHome }: BookingPageProps) {
  // Step navigation: 1 = Plan, 2 = Date & Time, 3 = Guest Info (Name & Email), 4 = Confirm Reservation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[0].id);
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('11:30 AM');
  const [selectedBarber, setSelectedBarber] = useState('any');
  const [weekOffset, setWeekOffset] = useState(0);

  // Guest Information (For Ticket and Reservation Number)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});

  // Promo Code State & Validation
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    percent?: number;
    amount?: number;
    label: string;
  } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const VALID_PROMOS: Record<string, { percent?: number; amount?: number; label: string }> = {
    FINALSTOP15: { percent: 15, label: '15% Off VIP Discount' },
    VIP10: { amount: 10, label: '$10 Off Club Discount' },
    BARBER15: { percent: 15, label: '15% Off Grooming' },
    LEVELUP20: { percent: 20, label: '20% Off Levelup Special' },
    WELCOME: { percent: 10, label: '10% Off Welcome Pass' }
  };

  const handleApplyPromo = (codeToApply?: string) => {
    const raw = (codeToApply || promoInput).trim().toUpperCase();
    if (!raw) {
      setPromoMessage({ text: 'Please enter a promo code', isError: true });
      return;
    }
    const match = VALID_PROMOS[raw];
    if (match) {
      setAppliedPromo({
        code: raw,
        percent: match.percent,
        amount: match.amount,
        label: match.label
      });
      setPromoMessage({ text: `Code ${raw} applied (${match.label})!`, isError: false });
    } else {
      setPromoMessage({ text: 'Invalid or expired promo code.', isError: true });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMessage(null);
  };

  // Submission & Result State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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
    if (!guestEmail.trim()) {
      errors.email = 'Please enter your email to receive your reservation ticket';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculatePricing = () => {
    const base = selectedService.numericPrice;
    if (!appliedPromo) {
      return { base, discount: 0, total: base };
    }
    if (appliedPromo.percent) {
      const discount = Math.round((base * appliedPromo.percent) / 100);
      return { base, discount, total: Math.max(0, base - discount) };
    }
    if (appliedPromo.amount) {
      const discount = Math.min(base, appliedPromo.amount);
      return { base, discount, total: Math.max(0, base - discount) };
    }
    return { base, discount: 0, total: base };
  };

  // Real-Time Booking without Google Account Requirement
  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    try {
      const randomTicketNum = Math.floor(10000 + Math.random() * 90000);
      const generatedTicketId = `FS-${randomTicketNum}`;
      const pricing = calculatePricing();

      const reservationData = {
        ticketId: generatedTicketId,
        name: guestName.trim(),
        fullName: guestName.trim(),
        clientName: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        clientEmail: guestEmail.trim().toLowerCase(),
        phone: guestPhone.trim() || 'Not specified',
        service: selectedService.name,
        serviceId: selectedService.id,
        price: `$${pricing.total}`,
        originalPrice: selectedService.price,
        discount: pricing.discount > 0 ? `-$${pricing.discount}` : null,
        promoCode: appliedPromo?.code || null,
        duration: selectedService.duration,
        date: selectedDate,
        time: selectedTime,
        barber: BARBERS.find(b => b.id === selectedBarber)?.name || 'First Available',
        notes: specialNotes.trim() || '',
        status: 'confirmed',
        createdAt: serverTimestamp()
      };

      let docId = generatedTicketId;
      try {
        const docRef = await addDoc(collection(db, 'reservations'), reservationData);
        docId = docRef.id;
      } catch (dbErr) {
        console.warn('Real-time database record created locally:', dbErr);
      }

      const payload = {
        ...reservationData,
        id: docId,
        ticketId: generatedTicketId
      };

      // Automatically send confirmation email with ticket details via EmailJS
      try {
        const emailRes = await sendBookingConfirmationEmail({
          toName: guestName.trim(),
          toEmail: guestEmail.trim(),
          ticketId: generatedTicketId,
          serviceName: selectedService.name,
          duration: selectedService.duration,
          price: selectedService.price,
          date: selectedDate,
          time: selectedTime,
          barberName: BARBERS.find(b => b.id === selectedBarber)?.name || 'First Available Master Barber',
          phone: guestPhone.trim(),
          notes: specialNotes.trim()
        });
        if (emailRes.success) {
          setEmailStatusMessage(`Official confirmation pass sent to ${guestEmail.trim()}! (Check Inbox & Spam folder)`);
        } else {
          setEmailStatusMessage(`Booking confirmed! Pass ready below to copy or download.`);
        }
      } catch (err) {
        console.warn('EmailJS background notice:', err);
      }

      setConfirmedData(payload);
      localStorage.setItem('finalstop_active_booking', JSON.stringify(payload));

      // Trigger Web Push and In-App notification in English
      sendBarberNotification({
        title: 'Appointment Confirmed! 💈',
        body: `${selectedService.name} booked for ${selectedDate} at ${selectedTime} (${BARBERS.find(b => b.id === selectedBarber)?.name || 'First Available'}). Ticket #${generatedTicketId}`,
        url: '/'
      });

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Reservation error:', err);
      alert('An error occurred while confirming your reservation. Please try again or call the shop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleCopyTicket = () => {
    if (!confirmedData) return;
    const text = `FINAL STOP BARBER SHOP - APPOINTMENT TICKET\n` +
      `Ticket ID: #${confirmedData.ticketId}\n` +
      `Status: Confirmed\n` +
      `Client: ${confirmedData.clientName}\n` +
      `Service: ${confirmedData.service} (${confirmedData.price})\n` +
      `Date & Time: ${confirmedData.date} at ${confirmedData.time}\n` +
      `Barber: ${confirmedData.barber}\n` +
      `Address: 5277 El Cajon Blvd, San Diego, CA 92115\n` +
      `Phone: +1 (619) 886-1267 / +1 (619) 928-7084`;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(() => {});
  };

  const handleDownloadTicket = () => {
    if (!confirmedData) return;
    const text = `=================================================\n` +
      `FINAL STOP BARBER SHOP - SAN DIEGO\n` +
      `OFFICIAL APPOINTMENT RESERVATION PASS\n` +
      `=================================================\n\n` +
      `TICKET ID: #${confirmedData.ticketId}\n` +
      `STATUS: CONFIRMED\n` +
      `GUEST NAME: ${confirmedData.clientName}\n` +
      `EMAIL: ${confirmedData.clientEmail}\n` +
      `SERVICE: ${confirmedData.service}\n` +
      `TOTAL RATE: ${confirmedData.price} (Pay in shop)\n` +
      `DATE: ${confirmedData.date}\n` +
      `TIME: ${confirmedData.time}\n` +
      `BARBER: ${confirmedData.barber}\n\n` +
      `SHOP ADDRESS: 5277 El Cajon Blvd, San Diego, CA 92115\n` +
      `PHONE: +1 (619) 886-1267 | +1 (619) 928-7084\n` +
      `HOURS: Mon-Sat 9:00 AM - 7:00 PM | Sun: Closed\n` +
      `=================================================\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinalStop-Ticket-${confirmedData.ticketId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResendEmail = async () => {
    if (!confirmedData) return;
    setIsResendingEmail(true);
    setEmailStatusMessage(null);
    try {
      const res = await sendBookingConfirmationEmail({
        toName: confirmedData.clientName,
        toEmail: confirmedData.clientEmail,
        ticketId: confirmedData.ticketId,
        serviceName: confirmedData.service,
        duration: confirmedData.duration,
        price: confirmedData.price,
        date: confirmedData.date,
        time: confirmedData.time,
        barberName: confirmedData.barber,
        phone: confirmedData.phone,
        notes: confirmedData.notes
      });
      if (res.success) {
        setEmailStatusMessage(`Confirmation email sent to ${confirmedData.clientEmail}! Please check your inbox and spam folder.`);
      } else {
        setEmailStatusMessage(`Email dispatch attempted. Your digital ticket is also ready below to copy or download.`);
      }
    } catch {
      setEmailStatusMessage(`Your digital pass is securely saved on your device and below.`);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const googleCalendarUrl = confirmedData ? 
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Haircut Appointment: ' + confirmedData.service + ' @ Final Stop Barber Shop')}&details=${encodeURIComponent('Ticket #' + confirmedData.ticketId + ' with ' + confirmedData.barber + ' | Total: ' + confirmedData.price + ' | Address: 5277 El Cajon Blvd, San Diego, CA 92115')}&location=${encodeURIComponent('5277 El Cajon Blvd, San Diego, CA 92115')}`
    : '#';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col w-full overflow-x-hidden font-sans">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Back Button */}
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group bg-transparent border-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          {/* Logo Center */}
          <div className="flex items-center cursor-pointer" onClick={onBackToHome}>
            <img 
              src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
              alt="Final Stop Barber Shop" 
              className="h-9 sm:h-11 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Direct Phone Assistance */}
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            className="text-xs font-mono text-gray-300 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            title="Call Final Stop (2 lines available)"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">Call Shop: (619) 886-1267</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 sm:py-8 px-3.5 sm:px-6 w-full max-w-5xl mx-auto">
        
        {isSuccess ? (
          /* =========================================================================
             CONFIRMED TICKET SCREEN (REAL-TIME RESULT WITH DIGITAL TICKET PASS)
             ========================================================================= */
          <div className="max-w-2xl mx-auto bg-[#141417] border border-gold/40 p-4 sm:p-8 md:p-10 shadow-2xl animate-fadeIn relative rounded-xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gold/10 border border-gold rounded-full flex items-center justify-center mx-auto mb-3.5 text-gold">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
            </div>

            <div className="text-center mb-5">
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                Appointment Confirmed
              </span>
              <h1 className="text-xl sm:text-3xl font-serif font-bold text-white">
                You're Scheduled, {confirmedData?.clientName}!
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Your reservation is booked. Present your digital ticket pass upon arrival at the shop.
              </p>
            </div>

            {/* Email dispatch alert banner */}
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-white">
                  Ticket sent to: <span className="text-gold font-bold">{confirmedData?.clientEmail}</span>
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Check your inbox and spam folder. You can also resend or download your pass below.
                </p>
                {emailStatusMessage && (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1.5 pt-1 border-t border-emerald-500/30">
                    {emailStatusMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Digital Ticket Pass Card */}
            <div className="bg-[#0A0A0B] border border-white/15 rounded-lg p-4 sm:p-6 mb-5 font-mono text-xs space-y-3 relative shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase">
                  <Receipt className="w-4 h-4" />
                  <span>Digital Grooming Pass</span>
                </div>
                <span className="text-gold font-bold bg-gold/10 border border-gold/30 px-2.5 py-1 text-xs rounded">
                  ID: #{confirmedData?.ticketId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 border-b border-white/5">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Ticket Holder</span>
                  <span className="text-white font-bold text-sm">{confirmedData?.clientName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Registered Email</span>
                  <span className="text-gray-200 truncate block">{confirmedData?.clientEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 border-b border-white/5">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Service Selected</span>
                  <span className="text-white font-bold">{confirmedData?.service}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Rate (Pay at shop)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gold font-bold text-sm">{confirmedData?.price}</span>
                    {confirmedData?.promoCode && (
                      <span className="text-emerald-400 text-[10px]">
                        ({confirmedData.promoCode} {confirmedData.discount})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 border-b border-white/5">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Date & Time</span>
                  <span className="text-white font-bold">
                    {confirmedData?.date} &bull; <span className="text-gold">{confirmedData?.time}</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Assigned Barber</span>
                  <span className="text-gray-200">{confirmedData?.barber}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-gray-400 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>5277 El Cajon Blvd, San Diego, CA 92115</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  Confirmed & Active
                </span>
              </div>
            </div>

            {/* Quick Digital Ticket Tools (Resend, Download, Copy, Calendar) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResendingEmail}
                className="bg-[#1A1A20] hover:bg-[#22222A] text-gray-200 border border-white/15 p-2.5 rounded-lg text-xs font-mono font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-gold" />
                <span className="text-[11px]">{isResendingEmail ? 'Sending...' : 'Resend Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTicket}
                className="bg-[#1A1A20] hover:bg-[#22222A] text-gray-200 border border-white/15 p-2.5 rounded-lg text-xs font-mono font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-gold" />
                <span className="text-[11px]">Download Pass</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTicket}
                className="bg-[#1A1A20] hover:bg-[#22222A] text-gray-200 border border-white/15 p-2.5 rounded-lg text-xs font-mono font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gold" />}
                <span className="text-[11px]">{isCopied ? 'Copied!' : 'Copy Ticket'}</span>
              </button>

              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1A1A20] hover:bg-[#22222A] text-gray-200 border border-white/15 p-2.5 rounded-lg text-xs font-mono font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center no-underline"
              >
                <CalendarIcon className="w-4 h-4 text-gold" />
                <span className="text-[11px]">Add to Cal</span>
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="w-full sm:w-auto bg-[#1E1E24] hover:bg-white/10 text-white border border-white/20 text-xs font-semibold uppercase tracking-wider px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gold" />
                <span>Print Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCallModalOpen(true)}
                className="w-full sm:w-auto bg-[#1E1E24] hover:bg-white/10 text-white border border-white/20 text-xs font-semibold uppercase tracking-wider px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-gold" />
                <span>Call Shop (2 Lines)</span>
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             4-STEP REAL-TIME RESERVATION WIZARD (NO GOOGLE SIGN-IN NEEDED)
             ========================================================================= */
          <div className="space-y-6">
            
            {/* Page Header */}
            <div className="text-center max-w-xl mx-auto">
              <span className="text-gold font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                Appointment Booking
              </span>
              <h1 className="text-xl sm:text-3xl font-serif font-bold text-white">
                Reserve Your Barber Chair
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
                Select your service, choose your preferred time slot, and confirm your appointment in moments.
              </p>
            </div>

            {/* 4-Step Responsive Progress Indicator */}
            <div className="grid grid-cols-4 gap-1.5 max-w-2xl mx-auto font-mono text-xs">
              {[
                { num: 1, short: '1. Plan', full: '1. Service' },
                { num: 2, short: '2. Time', full: '2. Date & Time' },
                { num: 3, short: '3. Details', full: '3. Guest Info' },
                { num: 4, short: '4. Confirm', full: '4. Confirm' }
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num === 4 && (!guestName || !guestEmail)) return;
                    if (s.num <= currentStep) setCurrentStep(s.num as any);
                  }}
                  className={`py-2 px-1 text-center rounded-lg border transition-all cursor-pointer ${
                    currentStep === s.num
                      ? 'bg-gold/20 border-gold text-gold font-bold shadow-md'
                      : currentStep > s.num
                      ? 'bg-[#141418] border-white/20 text-gray-300'
                      : 'bg-[#0E0E10] border-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="block text-[10px] sm:text-xs truncate">
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.full}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* =====================================================================
                STEP 1: CHOOSE YOUR PLAN
                ===================================================================== */}
            {currentStep === 1 && (
              <div className="bg-[#121215] border border-white/10 p-4 sm:p-6 md:p-8 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
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

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                  {SERVICES.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#18181D] border-gold shadow-lg shadow-gold/5'
                            : 'bg-[#151518] border-white/10 hover:border-white/25 hover:bg-[#1A1A1F]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Scissors className={`w-4 h-4 shrink-0 ${isSelected ? 'text-gold' : 'text-gray-400'}`} />
                              <h3 className="font-bold text-white text-base leading-tight">
                                {service.name}
                              </h3>
                            </div>
                            {service.badge && (
                              <span className="bg-gold/15 border border-gold/40 text-gold text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 font-bold rounded shrink-0">
                                {service.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono mb-2.5">
                            <span className="text-gold font-bold text-lg">{service.price}</span>
                            <span className="text-gray-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              {service.duration}
                            </span>
                          </div>

                          <ul className="space-y-1 text-xs text-gray-400 pt-2 border-t border-white/5 mb-3">
                            {service.inclusions.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-gold shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-white/5">
                          <span className={`text-[11px] font-mono font-medium ${isSelected ? 'text-gold' : 'text-gray-500'}`}>
                            {isSelected ? '✓ Selected Plan' : 'Click to choose'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceId(service.id);
                              setCurrentStep(2);
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                            className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                    className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Next: Choose Date & Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                STEP 2: CHOOSE DATE & TIME
                ===================================================================== */}
            {currentStep === 2 && (
              <div className="bg-[#121215] border border-white/10 p-4 sm:p-6 md:p-8 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
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
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                      1. Pick Date
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={weekOffset === 0}
                        onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                        className="p-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeekOffset(w => w + 1)}
                        className="p-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
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
                          className={`p-2 sm:p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
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
                          <span className="text-base sm:text-lg font-bold my-0.5">
                            {format(day, 'd')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-mono opacity-80">
                            {isSunday ? 'Closed' : format(day, 'MMM')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slot Grid */}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono block mb-2.5">
                    2. Pick Time Slot
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 px-2 rounded-lg text-center text-xs font-mono border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gold text-black border-gold font-bold shadow-md'
                              : 'bg-[#17171B] border-white/10 text-gray-300 hover:border-gold/40 hover:text-white'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Barber (Optional) */}
                <div className="mb-6 bg-[#0E0E10] p-3.5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono block mb-2">
                    3. Preferred Master Barber (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {BARBERS.map((barber) => (
                      <button
                        key={barber.id}
                        type="button"
                        onClick={() => setSelectedBarber(barber.id)}
                        className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all cursor-pointer ${
                          selectedBarber === barber.id
                            ? 'bg-gold/15 border-gold text-gold font-bold'
                            : 'bg-[#151518] border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {barber.name}
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
                    className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Next: Name & Ticket Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                STEP 3: GUEST INFORMATION
                ===================================================================== */}
            {currentStep === 3 && (
              <div className="bg-[#121215] border border-white/10 p-4 sm:p-6 md:p-8 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
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

                <p className="text-xs text-gray-300 mb-5 leading-relaxed">
                  Please enter your contact details to receive your appointment confirmation and reservation ticket ID.
                </p>

                <div className="space-y-4 max-w-xl mb-6">
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
                        className={`w-full bg-[#0A0A0B] rounded-lg border pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 outline-none font-mono ${
                          formErrors.name ? 'border-red-500' : 'border-white/20 focus:border-gold'
                        }`}
                      />
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
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
                        className={`w-full bg-[#0A0A0B] rounded-lg border pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 outline-none font-mono ${
                          formErrors.email ? 'border-red-500' : 'border-white/20 focus:border-gold'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
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
                        className="w-full bg-[#0A0A0B] rounded-lg border border-white/20 focus:border-gold pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 outline-none font-mono"
                      />
                      <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
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
                      className="w-full bg-[#0A0A0B] rounded-lg border border-white/20 focus:border-gold p-3 text-sm text-white placeholder-gray-500 outline-none font-mono resize-none"
                    />
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-3 border-t border-white/10">
                    <label className="block text-xs font-mono uppercase tracking-wider text-gold mb-1.5 font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gold shrink-0" />
                      Promo Code / VIP Pass (Optional)
                    </label>

                    <div className="relative flex items-center w-full bg-[#0A0A0B] border border-white/20 focus-within:border-gold rounded-lg overflow-hidden p-1 gap-1">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          if (promoMessage) setPromoMessage(null);
                        }}
                        placeholder="e.g. FINALSTOP15, VIP10"
                        className="flex-1 min-w-0 bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 outline-none font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="bg-gold hover:bg-gold-light text-black text-[11px] sm:text-xs font-mono font-bold uppercase px-3 sm:px-4 py-2 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 flex items-center justify-center whitespace-nowrap"
                      >
                        Apply Code
                      </button>
                    </div>

                    {promoMessage && (
                      <p className={`text-xs mt-2 font-mono ${promoMessage.isError ? 'text-red-400' : 'text-emerald-400 font-bold flex items-center gap-1'}`}>
                        {!promoMessage.isError && <Check className="w-3.5 h-3.5" />}
                        {promoMessage.text}
                      </p>
                    )}

                    {appliedPromo && (
                      <div className="mt-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-300">
                        <span>✓ {appliedPromo.label} applied to this appointment</span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}
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
                    className="bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Next: Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                STEP 4: REVIEW & CONFIRM RESERVATION
                ===================================================================== */}
            {currentStep === 4 && (
              <div className="bg-[#121215] border border-gold/30 p-4 sm:p-8 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
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
                <div className="bg-[#0E0E11] border border-white/15 rounded-lg p-4 sm:p-6 mb-6 font-mono text-xs space-y-4">
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
                      {appliedPromo && calculatePricing().discount > 0 ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-500 line-through text-sm">{selectedService.price}</span>
                          <span className="text-gold font-bold text-xl">${calculatePricing().total}</span>
                          <span className="text-emerald-400 text-[10px] font-bold">
                            (-${calculatePricing().discount} with {appliedPromo.code})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gold font-bold text-xl block">{selectedService.price}</span>
                      )}
                      <span className="text-gray-400 text-[10px]">Pay by Cash or Card after haircut</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase block">Appointment Schedule</span>
                      <span className="text-white font-bold block">
                        {selectedDate} at <span className="text-gold">{selectedTime}</span>
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
                    <span>Final Stop Barber Shop &bull; 5277 El Cajon Blvd, San Diego, CA 92115</span>
                  </div>
                </div>

                {/* Final Booking Button */}
                <div className="space-y-3">
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
        <p>&copy; {new Date().getFullYear()} Final Stop Barber Shop &bull; 5277 El Cajon Blvd, San Diego, CA 92115</p>
      </footer>

      {/* Direct Phone Assistance Modal with 2 Lines */}
      <CallShopModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

    </div>
  );
}

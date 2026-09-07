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
  Receipt
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { loginWithGoogle, db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingPageProps {
  onBackToHome: () => void;
}

interface ServiceItem {
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
    badge: 'VIP',
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

export default function BookingPage({ onBackToHome }: BookingPageProps) {
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[2].id);
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0];

  const handleBooking = async () => {
    if (!selectedTime) {
      alert("Please select a time slot for your appointment.");
      return;
    }

    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = await loginWithGoogle();
      } catch (err) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const reservationData = {
        userId: currentUser.uid,
        name: currentUser.displayName || 'Distinguished Guest',
        fullName: currentUser.displayName || 'Distinguished Guest',
        email: currentUser.email,
        service: selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'reservations'), reservationData);

      const payload = {
        ...reservationData,
        id: docRef.id,
        ticketId: docRef.id.substring(0, 7).toUpperCase(),
        clientName: currentUser.displayName || 'Distinguished Guest',
        clientEmail: currentUser.email
      };

      setConfirmedData(payload);
      localStorage.setItem('finalstop_active_booking', JSON.stringify(payload));
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Booking error:', err);
      alert("An error occurred while confirming your reservation. Please try again or call the shop.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => 
    addDays(startOfToday(), weekOffset * 7 + i)
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col w-full overflow-x-hidden">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Normal Back Button without bubble */}
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition-colors py-1 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold" />
            <span>Back to Home</span>
          </button>

          {/* Logo Center */}
          <div className="flex items-center cursor-pointer" onClick={onBackToHome}>
            <img 
              src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" 
              alt="Final Stop Barber Shop" 
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Direct Phone Assistance */}
          <a
            href="tel:16198861267"
            className="text-xs font-mono text-gray-400 hover:text-gold transition-colors flex items-center gap-1.5"
            title="Direct Shop Assistance"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">+1 (619) 886-1267</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 w-full max-w-6xl mx-auto">
        
        {isSuccess ? (
          /* Confirmation Screen */
          <div className="max-w-2xl mx-auto bg-[#151517] border border-gold/40 p-8 md:p-12 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 bg-gold/10 border border-gold rounded-full flex items-center justify-center mx-auto mb-5 text-gold">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="text-center mb-8">
              <span className="text-gold font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                Booking Confirmed
              </span>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
                You're Scheduled, {confirmedData?.clientName}!
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">
                Your chair is reserved at Final Stop Barber Shop in San Diego.
              </p>
            </div>

            {/* Ticket Recap */}
            <div className="bg-[#0A0A0B] border border-white/10 p-6 mb-8 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase">
                  <Receipt className="w-4 h-4" />
                  <span>Reservation Details</span>
                </div>
                <span className="text-gold font-bold">ID: {confirmedData?.ticketId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-bold">Service:</span>
                <span className="text-white font-bold">{confirmedData?.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-bold">Rate:</span>
                <span className="text-gold font-bold text-sm">{confirmedData?.price}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-bold">Duration:</span>
                <span className="text-gray-200">{confirmedData?.duration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-bold">Date:</span>
                <span className="text-white font-bold">{confirmedData?.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-bold">Time:</span>
                <span className="text-gold font-bold">{confirmedData?.time}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-400 font-bold">Location:</span>
                <span className="text-gray-300 text-right">5277 El Cajon Blvd, San Diego, CA</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-widest text-xs px-8 py-3.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Return to Home
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedTime('');
                }}
                className="w-full sm:w-auto text-gray-400 hover:text-white font-medium text-xs px-6 py-3.5 transition-colors cursor-pointer"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        ) : (
          /* Main Booking Grid */
          <div>
            
            {/* Page Header */}
            <div className="mb-10 text-center sm:text-left">
              <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-2">
                Final Stop Barber Shop &bull; San Diego
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
                Reserve Your Appointment
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Choose your service, preferred date, and time slot. No upfront deposit required—pay conveniently in the shop upon completion.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Form Column */}
              <div className="flex-1 w-full space-y-8 bg-[#151517] p-6 sm:p-8 border border-white/10 shadow-2xl">
                
                {/* Step 1: Prestations */}
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gold text-black font-bold text-xs flex items-center justify-center font-mono">
                        1
                      </span>
                      <h2 className="text-sm uppercase tracking-widest font-bold text-white font-mono">
                        Services & Rates
                      </h2>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono">
                      6 signature experiences
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SERVICES.map((service) => {
                      const isSelected = service.id === selectedServiceId;
                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-gold bg-gold/[0.08] shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                              : 'border-white/10 bg-[#0A0A0B] hover:border-white/25'
                          }`}
                        >
                          {service.badge && (
                            <span className="absolute top-3 right-3 bg-gold text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 font-mono">
                              {service.badge}
                            </span>
                          )}

                          <div>
                            <h3 className={`text-sm font-serif font-bold mb-1 ${isSelected ? 'text-gold' : 'text-white'}`}>
                              {service.name}
                            </h3>

                            <div className="flex items-center gap-3 text-xs mb-3 font-mono">
                              <span className="text-gold font-bold text-base">
                                {service.price}
                              </span>
                              <span className="text-gray-500">&bull;</span>
                              <span className="text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gold" />
                                {service.duration}
                              </span>
                            </div>

                            <ul className="space-y-1.5 mb-4 text-[11px] text-gray-400">
                              {service.inclusions.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 leading-tight">
                                  <span className="text-gold font-bold">&bull;</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                            <span className={`text-[11px] ${isSelected ? 'text-gold font-bold' : 'text-gray-500'}`}>
                              {isSelected ? 'Selected' : 'Click to select'}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-gold stroke-[2.5]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gold text-black font-bold text-xs flex items-center justify-center font-mono">
                        2
                      </span>
                      <h2 className="text-sm uppercase tracking-widest font-bold text-white font-mono">
                        Select Appointment Date
                      </h2>
                    </div>

                    {/* Week switcher */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                        disabled={weekOffset === 0}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous week"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] uppercase font-mono text-gold px-1 font-bold">
                        {weekOffset === 0 ? 'This Week' : `Week +${weekOffset}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWeekOffset(weekOffset + 1)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Next week"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {currentWeekDays.map((date, i) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={`p-2.5 sm:p-3 border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-gold bg-gold text-black shadow-md font-bold'
                              : 'border-white/10 bg-[#0A0A0B] text-gray-300 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] font-mono uppercase mb-0.5">
                            {format(date, 'EEE')}
                          </span>
                          <span className="text-base font-bold leading-none my-0.5">
                            {format(date, 'dd')}
                          </span>
                          <span className="text-[9px] uppercase opacity-75">
                            {format(date, 'MMM')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Time Slot */}
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gold text-black font-bold text-xs flex items-center justify-center font-mono">
                        3
                      </span>
                      <h2 className="text-sm uppercase tracking-widest font-bold text-white font-mono">
                        Time Slot
                      </h2>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono">
                      10:00 AM - 6:00 PM
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-2 border text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-gold bg-gold text-black shadow-md'
                              : 'border-white/10 bg-[#0A0A0B] text-gray-300 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Summary Column */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-[#151517] border border-white/15 p-6 shadow-2xl sticky top-24">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                    <h3 className="text-sm uppercase tracking-widest font-bold text-gold font-mono flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      <span>Summary</span>
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="pb-3 border-b border-white/5">
                      <span className="text-gray-500 uppercase text-[10px] block mb-1">Service</span>
                      <p className="text-white font-serif font-bold text-sm leading-snug">
                        {selectedService.name}
                      </p>
                      <span className="text-gray-400 text-[11px] block mt-0.5">
                        Duration: {selectedService.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-2 border-b border-white/5">
                      <div>
                        <span className="text-gray-500 uppercase text-[10px] block">Date</span>
                        <p className="text-white font-bold mt-0.5">{selectedDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase text-[10px] block">Time</span>
                        <p className={`font-bold mt-0.5 ${selectedTime ? 'text-gold' : 'text-gray-500 italic'}`}>
                          {selectedTime || 'Select a time'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline py-2 border-b border-white/5">
                      <span className="text-gray-400 uppercase text-[11px]">Due at salon:</span>
                      <span className="text-2xl font-bold text-gold">{selectedService.price}</span>
                    </div>

                    <div className="p-3 bg-[#0A0A0B] border border-white/5 space-y-2 text-[11px] text-gray-400">
                      <div className="flex items-start gap-2 text-gray-200">
                        <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        <span>5277 El Cajon Blvd, San Diego, CA 92115</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 text-[10px] text-gray-400 space-y-1">
                        <p>&bull; <strong>Payment:</strong> Pay in shop after service</p>
                        <p>&bull; <strong>Policy:</strong> Free cancellation anytime</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={isSubmitting || !selectedTime}
                      className="w-full bg-gold hover:bg-gold-light disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving Appointment...</>
                      ) : (
                        <><CalendarIcon className="w-4 h-4" /> Confirm Appointment</>
                      )}
                    </button>

                    {!selectedTime && (
                      <p className="text-[10px] text-amber-500/90 text-center mt-2 font-mono">
                        Please choose a time slot in Step 3
                      </p>
                    )}

                    {!user && (
                      <p className="text-[10px] text-gray-500 text-center mt-3">
                        Secure 1-click Google sign-in.
                      </p>
                    )}
                  </div>

                  {/* Salon Assistance */}
                  <div className="mt-6 pt-4 border-t border-white/10 text-center">
                    <a
                      href="tel:16198861267"
                      className="text-[11px] text-gray-400 hover:text-gold transition-colors inline-flex items-center gap-1.5 font-mono"
                    >
                      <Phone className="w-3 h-3 text-gold" />
                      <span>Shop Assistance: +1 (619) 886-1267</span>
                    </a>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Booking Page Footer */}
      <footer className="border-t border-white/10 py-6 px-6 bg-[#0A0A0B] text-center text-xs text-gray-500 w-full">
        <p>&copy; {new Date().getFullYear()} Final Stop Barber Shop &bull; 5277 El Cajon Blvd, San Diego, CA 92115</p>
      </footer>

    </div>
  );
}

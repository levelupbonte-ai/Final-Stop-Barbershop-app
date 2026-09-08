import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Check, Clock, User, Scissors, Loader2, Phone, MapPin } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { loginWithGoogle, db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { OFFICIAL_SERVICES } from '../data/services';

const SERVICES = OFFICIAL_SERVICES.map(s => ({
  id: s.id,
  name: `${s.name} (${s.price})`,
  duration: s.duration,
  price: s.price
}));

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ReservationForm() {
  const [selectedService, setSelectedService] = useState(SERVICES[0].id);
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleBooking = async () => {
    setErrorMessage(null);
    if (!selectedTime) {
      setErrorMessage("Veuillez sélectionner un créneau horaire.");
      return;
    }
    
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = await loginWithGoogle();
      } catch (err) {
        setErrorMessage("Connexion annulée ou impossible.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const serviceObj = SERVICES.find(s => s.id === selectedService);
      
      // Save reservation
      await addDoc(collection(db, 'reservations'), {
        userId: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        service: serviceObj?.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 6000);
      setSelectedTime('');
    } catch (err) {
      console.error(err);
      setErrorMessage("Une erreur est survenue lors de la réservation. Veuillez réessayer ou contacter le salon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

  return (
    <section id="reservation" className="py-24 bg-dark-bg relative overflow-hidden">
      <div id="services" className="absolute -top-16 left-0 pointer-events-none"></div>
      
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Information */}
          <div className="flex-1 lg:py-6 flex flex-col justify-between">
            <div>
              <span className="text-gold text-[11px] uppercase tracking-[0.25em] font-mono font-bold block mb-3">
                Reserve Your Chair
              </span>
              <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
                Your Private Experience.
              </h2>
              <div className="h-1 w-20 bg-gold rounded-full mb-8"></div>
              <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
                Enjoy a privileged session in the hands of master barbers with over two decades of dedicated craft. Razor sharpness, absolute comfort, and elevated grooming products.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider">Phone</span>
                    <a href="tel:16198861267" className="font-mono text-white hover:text-gold transition-colors font-bold">
                      +1 (619) 886-1267
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider">Address</span>
                    <span className="text-white">5277 El Cajon Blvd, San Diego, CA 92115</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Salon Interior Showcase Card */}
            <div className="border border-white/10 overflow-hidden relative group shadow-xl">
              <img 
                src="https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png" 
                alt="Final Stop Barber Shop Interior" 
                className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end p-4">
                <div>
                  <span className="text-gold font-mono text-[9px] tracking-widest uppercase block mb-0.5">Final Stop Barber Shop</span>
                  <p className="text-white text-xs font-serif">5277 El Cajon Blvd, San Diego, CA &bull; Mon - Sat: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Form */}
          <div className="flex-1">
            <div className="bg-[#151517] p-6 md:p-8 border border-white/10 relative shadow-2xl">
              
              {success && (
                <div className="absolute inset-0 bg-[#151517] z-30 flex flex-col items-center justify-center p-8 text-center border border-green-800/40 animate-fadeIn">
                  <div className="w-16 h-16 bg-green-900/20 border border-green-500/30 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-serif">Appointment Confirmed!</h3>
                  <p className="text-gray-400 text-xs mb-6 max-w-sm">
                    Your spot is secured. Our barbers look forward to welcoming you at 5277 El Cajon Blvd.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="bg-gold text-black font-bold uppercase text-[11px] tracking-widest px-6 py-2.5 cursor-pointer"
                  >
                    New Reservation
                  </button>
                </div>
              )}

              <div className="space-y-6">
                
                {/* 1. Services */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-300 mb-2.5">
                    1. Select Service
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SERVICES.map(service => (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-3 border cursor-pointer transition-all ${
                          selectedService === service.id 
                            ? 'border-gold bg-gold/10' 
                            : 'border-white/10 bg-[#0A0A0B] hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-xs font-medium ${selectedService === service.id ? 'text-gold font-bold' : 'text-gray-200'}`}>
                            {service.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {service.duration}
                          </span>
                          <span className="font-bold text-white font-mono">{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Date */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-300 mb-2.5">
                    2. Appointment Date
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {dates.map((date, i) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex-shrink-0 w-14 py-2.5 border flex flex-col items-center transition-all ${
                            isSelected 
                              ? 'border-gold bg-gold text-black' 
                              : 'border-white/10 bg-[#0A0A0B] text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[10px] font-medium uppercase mb-0.5">{format(date, 'EEE', { locale: enUS })}</span>
                          <span className="text-base font-bold">{format(date, 'dd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Time */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-300 mb-2.5">
                    3. Time Slot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 border text-[11px] uppercase tracking-widest font-mono font-bold transition-all cursor-pointer ${
                          selectedTime === time
                            ? 'border-gold bg-gold text-black'
                            : 'border-white/10 bg-[#0A0A0B] text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono">
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleBooking}
                  disabled={isSubmitting || !selectedTime}
                  className="w-full bg-gold hover:bg-gold-light disabled:bg-white/10 disabled:text-gray-500 text-black text-xs font-bold uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving Appointment...</>
                  ) : (
                    <><CalendarIcon className="w-4 h-4" /> Confirm My Appointment</>
                  )}
                </button>
                
                {!user && (
                  <p className="text-[10px] text-center text-gray-500">
                    Quick verification with your Google account.
                  </p>
                )}

              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

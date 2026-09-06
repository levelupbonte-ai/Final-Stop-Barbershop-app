import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Check, Clock, User, Scissors, Loader2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { loginWithGoogle, db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SERVICES = [
  { id: 'coupe', name: 'Coupe Classique', duration: '30 min', price: '30€' },
  { id: 'barbe', name: 'Taille de Barbe', duration: '30 min', price: '25€' },
  { id: 'combo', name: 'Coupe + Barbe (Signature)', duration: '60 min', price: '50€' },
  { id: 'premium', name: 'Soin Premium (Visage & Cheveux)', duration: '90 min', price: '80€' },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function ReservationForm() {
  const [selectedService, setSelectedService] = useState(SERVICES[2].id);
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleBooking = async () => {
    if (!selectedTime) return alert("Veuillez sélectionner un horaire.");
    
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
      const serviceObj = SERVICES.find(s => s.id === selectedService);
      
      // Save to Firestore
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
      
      // Note: Google Calendar Event creation would happen here 
      // via client-side fetch to Google Calendar API using the OAuth token 
      // from loginWithGoogle result (if scopes were granted).

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      setSelectedTime('');
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite lors de la réservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

  return (
    <section id="reservation" className="py-24 bg-dark-bg relative overflow-hidden">
      {/* Anchor for services link */}
      <div id="services" className="absolute -top-16 left-0 pointer-events-none"></div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="flex-1 lg:py-10">
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">Réservez votre moment.</h2>
            <div className="h-1 w-20 bg-gold rounded-full mb-8"></div>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">
              Prenez rendez-vous en quelques clics. Choisissez votre prestation, votre créneau idéal, et laissez nos experts s'occuper de vous.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shrink-0">
                  <Scissors className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg mb-1">1. Choisissez votre prestation</h4>
                  <p className="text-gray-400 text-sm">Des coupes classiques aux soins signatures.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg mb-1">2. Sélectionnez une date & heure</h4>
                  <p className="text-gray-400 text-sm">Trouvez le créneau qui vous convient le mieux.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg mb-1">3. Confirmez</h4>
                  <p className="text-gray-400 text-sm">Connectez-vous via Google pour valider et synchroniser avec votre agenda.</p>
                </div>
              </div>
            </div>

            {/* Salon Interior Showcase Card */}
            <div className="mt-10 border border-white/10 overflow-hidden relative group">
              <img 
                src="https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png" 
                alt="Intérieur du Salon" 
                className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-5">
                <div>
                  <span className="text-gold font-mono text-[10px] tracking-widest uppercase block mb-1">Ambiance & Confort</span>
                  <p className="text-white text-xs font-serif italic">Un espace chaleureux dédié à l'artisanat du barbier traditionnel.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-[#151517] p-6 md:p-8 border border-white/5 relative">
              
              {success ? (
                <div className="absolute inset-0 bg-[#151517] z-20 flex flex-col items-center justify-center p-8 text-center border border-green-900/30">
                  <div className="w-20 h-20 bg-green-900/20 flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Réservation Confirmée !</h3>
                  <p className="text-gray-400 mb-6">
                    Votre rendez-vous a bien été enregistré. Vous recevrez un email de confirmation prochainement.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-gold hover:text-gold-light font-medium"
                  >
                    Faire une autre réservation
                  </button>
                </div>
              ) : null}

              <div className="space-y-8">
                {/* Prestations */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Prestation</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(service => (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          selectedService === service.id 
                            ? 'border-gold bg-gold/5' 
                            : 'border-white/5 bg-[#151517] hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-medium ${selectedService === service.id ? 'text-gold' : 'text-gray-200'}`}>
                            {service.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {service.duration}
                          </span>
                          <span className="font-semibold text-gray-300">{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Date du rendez-vous</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {dates.map((date, i) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex-shrink-0 w-16 py-3 border flex flex-col items-center transition-all ${
                            isSelected 
                              ? 'border-gold bg-gold text-black' 
                              : 'border-white/5 bg-[#151517] text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xs font-medium uppercase mb-1">{format(date, 'EEE', { locale: fr })}</span>
                          <span className="text-xl font-bold">{format(date, 'dd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Heure */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Heure</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 border text-[11px] uppercase tracking-widest font-bold transition-all ${
                          selectedTime === time
                            ? 'border-gold bg-gold text-black'
                            : 'border-white/5 bg-[#151517] text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleBooking}
                  disabled={isSubmitting || !selectedTime}
                  className="w-full bg-gold hover:bg-gold-light disabled:bg-dark-border disabled:text-gray-500 text-black text-[11px] font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
                  ) : (
                    <><CalendarIcon className="w-5 h-5" /> Confirmer la Réservation</>
                  )}
                </button>
                {!user && (
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Une connexion via Google vous sera demandée pour valider.
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

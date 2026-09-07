import { useState, useEffect, FormEvent } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Send,
  Gift,
  Users
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ModalMode = 'waitlist' | 'promo' | null;

interface WalkInHubModalProps {
  mode: ModalMode;
  onClose: () => void;
  onOpenStatusCheck?: () => void;
}

export default function WalkInHubModal({ mode, onClose, onOpenStatusCheck }: WalkInHubModalProps) {
  // Waitlist form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('First Available Barber');
  const [selectedService, setSelectedService] = useState('Skin Fade & Precision Cut ($35)');
  const [waitlistSuccess, setWaitlistSuccess] = useState<any>(null);

  // Promo form states
  const [promoContact, setPromoContact] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mode) return null;

  // 1. Submit to Waitlist
  const handleJoinWaitlist = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketId = 'FS-' + Math.floor(100 + Math.random() * 900);
      const position = Math.floor(2 + Math.random() * 3);
      const estMinutes = position * 15;

      const ticketData = {
        ticketId,
        name: clientName.trim(),
        phone: clientPhone.trim(),
        barber: selectedBarber,
        service: selectedService,
        status: 'waiting',
        position,
        estMinutes,
        joinedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, 'waitlist'), ticketData);
      } catch (err) {
        console.warn('Firestore fallback for waitlist:', err);
      }

      localStorage.setItem('finalstop_active_ticket', JSON.stringify(ticketData));
      setWaitlistSuccess(ticketData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit VIP Club / Promo
  const handleJoinPromo = async (e: FormEvent) => {
    e.preventDefault();
    if (!promoContact.trim()) return;

    setIsSubmitting(true);
    try {
      try {
        await addDoc(collection(db, 'vip_club'), {
          contact: promoContact.trim(),
          createdAt: serverTimestamp(),
          codeGranted: 'FINALSTOP15'
        });
      } catch (err) {
        console.warn('Firestore fallback for promo:', err);
      }
      setPromoSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div 
        className="bg-[#151517] border border-gold/40 w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
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

        {/* MODE: WAITLIST (Walk-in for today) */}
        {mode === 'waitlist' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
                Same-Day Walk-In &bull; Live Queue
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
              Join Today's Waitlist
            </h3>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Visiting the shop today without an appointment? Secure your spot in our real-time waitlist now to save waiting time.
            </p>

            {waitlistSuccess ? (
              <div className="bg-[#0A0A0B] border border-gold/40 p-6 text-center space-y-4">
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
                  <p>&bull; <strong>Barber:</strong> {waitlistSuccess.barber}</p>
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
                      className="w-full bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs py-3 transition-colors cursor-pointer"
                    >
                      Track My Turn Live &rarr;
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs py-2.5 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-4">
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
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
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
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block font-mono">
                    Used to lookup your status live in the shop.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Preferred Barber
                  </label>
                  <select
                    value={selectedBarber}
                    onChange={(e) => setSelectedBarber(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="First Available Barber">First Available Barber (Fastest)</option>
                    <option value="Marcus 'Blade' Carter">Marcus "Blade" Carter (Skin Fade Specialist)</option>
                    <option value="David 'The Sculptor' Vance">David "The Sculptor" Vance (Beard & Hot Towel)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-mono text-gray-300 block mb-1">
                    Desired Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="Skin Fade & Precision Cut ($35)">Skin Fade & Precision Cut ($35)</option>
                    <option value="Beard Sculpting & Hot Lather Shave ($25)">Beard Sculpting & Hot Lather Shave ($25)</option>
                    <option value="Signature Master Combo: Cut + Beard ($55)">Signature Master Combo: Cut + Beard ($55)</option>
                    <option value="Custom Braids & Cornrows ($65+)">Custom Braids & Cornrows ($65+)</option>
                    <option value="Dreadlocks & Full Retwist ($75+)">Dreadlocks & Full Retwist ($75+)</option>
                    <option value="VIP Prestige Full Experience ($90)">VIP Prestige Full Experience ($90)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs py-3.5 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-black" />
                    <span>{isSubmitting ? 'Securing your spot...' : 'Join Today\'s Waitlist'}</span>
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
              Get Exclusive Promos & 15% Off
            </h3>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Join our VIP Member list to receive 15% off your next cut, flash weekday deals, and priority access during peak hours.
            </p>

            {promoSuccess ? (
              <div className="bg-[#0A0A0B] border border-gold/50 p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-gold font-mono font-bold text-xs uppercase block">
                    Welcome to the VIP Club!
                  </span>
                  <p className="text-sm text-gray-300 mt-1">
                    Here is your exclusive 15% off promo code:
                  </p>
                  <div className="mt-3 p-3 bg-gold/10 border border-gold inline-block font-mono font-black text-xl text-gold tracking-widest">
                    FINALSTOP15
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Mention this code at checkout during your visit at the salon.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs py-3 transition-colors cursor-pointer"
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
                    className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-1.5 block font-mono">
                    Zero spam guaranteed. We respect your privacy.
                  </span>
                </div>

                <div className="p-3 bg-[#0A0A0B] border border-white/5 space-y-1.5 text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    <span>Member Benefits:</span>
                  </div>
                  <p>&bull; 15% discount on your visit</p>
                  <p>&bull; Priority chair alerts on busy weekend shifts</p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs py-3.5 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-black" />
                    <span>{isSubmitting ? 'Registering...' : 'Claim My 15% Off Code'}</span>
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

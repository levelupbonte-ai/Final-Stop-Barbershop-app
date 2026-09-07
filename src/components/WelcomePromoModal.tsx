import React, { useState, useEffect, FormEvent } from 'react';
import { X, Sparkles, Check, Copy, Gift, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface WelcomePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: () => void;
}

export default function WelcomePromoModal({ 
  isOpen, 
  onClose,
  onNavigateToBooking 
}: WelcomePromoModalProps) {
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    setIsSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, 'promos'), {
          contact: contact.trim(),
          promoCode: 'FINALSTOP15',
          discount: '15%',
          claimedAt: serverTimestamp(),
          source: 'welcome_popup'
        });
      }
    } catch (err) {
      console.warn('Could not record promo in Firebase, continuing locally:', err);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
      try {
        localStorage.setItem('finalstop_welcome_promo_claimed', 'true');
      } catch (e) {
        // ignore storage error
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FINALSTOP15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('finalstop_welcome_promo_dismissed', 'true');
    } catch (e) {
      // ignore
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={handleDismiss}
    >
      <div 
        className="bg-[#121215] border border-gold/40 w-full max-w-lg overflow-hidden shadow-2xl relative group"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold/50 via-gold to-gold/50"></div>

        {/* Close Button */}
        <button 
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gold p-1 transition-colors z-10 cursor-pointer bg-transparent border-none outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10 relative">
          {!isSuccess ? (
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold">
                  Limited Welcome Offer
                </span>
              </div>

              {/* Big Headline */}
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white uppercase tracking-tight leading-none mb-3">
                Unlock <span className="text-gold">15% Off</span> Your Next Cut
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                Join our VIP client list today. Get an instant 15% discount on your next chair visit, plus secret flash deals and priority queue updates.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 mb-5">
                <div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter phone number or email..."
                    className="w-full bg-[#0A0A0B] border border-white/20 focus:border-gold px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none font-mono transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs sm:text-sm py-3.5 flex items-center justify-center gap-2 font-mono transition-all shadow-xl active:scale-98 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-black" />
                  <span>{isSubmitting ? 'Securing your 15%...' : 'Get My 15% Off Code'}</span>
                </button>
              </form>

              {/* Dismiss Text */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[11px] font-mono text-gray-500 hover:text-gray-300 underline transition-colors cursor-pointer"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-2 space-y-5">
              <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold text-gold flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-7 h-7" />
              </div>

              <div>
                <span className="text-gold font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                  Offer Unlocked!
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Here is Your 15% Voucher
                </h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
                  Show this code at the shop counter or mention it during your next chair appointment.
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="bg-[#0A0A0B] border-2 border-dashed border-gold/60 p-4 max-w-xs mx-auto flex items-center justify-between gap-3">
                <span className="text-gold font-mono font-black text-xl tracking-widest">
                  FINALSTOP15
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-gold/10 hover:bg-gold text-gold hover:text-black text-xs font-mono font-bold uppercase border border-gold/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {onNavigateToBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToBooking();
                    }}
                    className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3 px-4 font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Book Appointment Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono uppercase tracking-wider py-3 px-4 border border-white/10 cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, FormEvent } from 'react';
import { X, Sparkles, Check, Gift, ArrowRight } from 'lucide-react';
import { errorMessage, submitForm } from '../lib/site/api';

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = contact.trim();
    if (!value) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const isEmail = value.includes('@');
      await submitForm({
        formType: 'vip_signup',
        name: 'VIP member',
        email: isEmail ? value : undefined,
        phone: isEmail ? undefined : value,
        data: { origin: 'welcome_modal' }
      });
      setIsSuccess(true);
      try {
        localStorage.setItem('levelup_welcome_promo_claimed', 'true');
      } catch {
        // ignore storage error
      }
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
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
                  Exclusive Guest Privileges
                </span>
              </div>

              {/* Big Headline */}
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white uppercase tracking-tight leading-tight mb-3">
                Join the <span className="text-gold">VIP Guest List</span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                Register your email or phone number to receive private promotional coupons, seasonal holiday discounts, and priority queue notifications when released by our master barbers.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 mb-5">
                <div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter your email or phone number..."
                    className="w-full bg-[#0A0A0B] border border-white/20 focus:border-gold px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none font-mono transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider text-xs sm:text-sm py-3.5 flex items-center justify-center gap-2 font-mono transition-all shadow-xl active:scale-98 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-black" />
                  <span>{isSubmitting ? 'Registering...' : 'Join Private VIP Club'}</span>
                </button>
                {submitError && (
                  <p role="alert" className="text-xs text-red-300 mt-2">
                    {submitError}
                  </p>
                )}
              </form>

              {/* Dismiss Text */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[11px] font-mono text-gray-500 hover:text-gray-300 underline transition-colors cursor-pointer"
                >
                  No thanks, continue without privileges
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
                  Registration Confirmed
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Welcome to the VIP Club
                </h3>
                <p className="text-xs text-gray-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  You are officially on our private list. Promotional coupons and member-only specials will be delivered straight to your inbox and SMS when issued.
                </p>
              </div>

              {/* Status Note */}
              <div className="bg-[#0A0A0B] border border-gold/40 p-4 max-w-sm mx-auto text-left">
                <p className="text-xs text-gold font-mono uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping inline-block"></span>
                  VIP Member Active
                </p>
                <p className="text-[11px] text-gray-400 font-sans">
                  Keep an eye on your messages for upcoming private chair specials and holiday promos.
                </p>
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
                    <span>Book Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono uppercase tracking-wider py-3 px-4 border border-white/10 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

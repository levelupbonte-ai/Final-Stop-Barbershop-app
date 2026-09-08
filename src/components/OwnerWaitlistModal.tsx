import React, { useState, FormEvent } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, X, Power, Key } from 'lucide-react';
import { verifyOwnerPin, setIsWaitlistOpen, DEFAULT_OWNER_PIN } from '../lib/waitlistService';

interface OwnerWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWaitlistOpen: boolean;
  onStatusChange: (isOpen: boolean) => void;
  onOpenFullAdmin?: () => void;
}

export default function OwnerWaitlistModal({
  isOpen,
  onClose,
  isWaitlistOpen,
  onStatusChange,
  onOpenFullAdmin,
}: OwnerWaitlistModalProps) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleVerifyPin = (e: FormEvent) => {
    e.preventDefault();
    if (verifyOwnerPin(pin)) {
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect PIN. (Default PIN: 1234)');
    }
  };

  const handleToggle = (openStatus: boolean) => {
    setIsWaitlistOpen(openStatus);
    onStatusChange(openStatus);
    setSuccessMessage(
      openStatus 
        ? "The walk-in waitlist is now OPEN! Clients can join the queue online." 
        : "The walk-in waitlist has been CLOSED. Clients can only book appointments."
    );
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleResetAndClose = () => {
    setPin('');
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#151517] border border-gold/40 w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-gold/10 border border-gold/40 text-gold flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
            Shop Owner Control Panel
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
          Walk-In Waitlist Control
        </h3>
        
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          The walk-in queue is only visible and available to customers when you manually turn it ON.
        </p>

        {/* Notification message */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs mb-4 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {!isAuthenticated ? (
          /* Step 1: Owner PIN verification */
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-gray-300 block mb-1.5 flex items-center justify-between">
                <span>Enter Owner PIN</span>
                <span className="text-[10px] text-gray-500 lowercase">(Default: {DEFAULT_OWNER_PIN})</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="e.g. 1234"
                  maxLength={8}
                  autoFocus
                  className="w-full bg-[#0A0A0B] border border-white/15 focus:border-gold px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors font-mono tracking-widest"
                />
                <Key className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-all cursor-pointer font-mono shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Owner Controls</span>
            </button>
          </form>
        ) : (
          /* Step 2: Controls */
          <div className="space-y-5">
            {/* Current Status Box */}
            <div className={`p-4 border font-mono ${
              isWaitlistOpen 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-950/30 border-red-500/40 text-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider">Current State:</span>
                <span className={`text-xs font-bold uppercase px-2.5 py-0.5 border ${
                  isWaitlistOpen 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                    : 'bg-red-500/20 border-red-500 text-red-300'
                }`}>
                  {isWaitlistOpen ? '🟢 OPEN TO CUSTOMERS' : '🔴 CLOSED / DISABLED'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 font-sans leading-relaxed">
                {isWaitlistOpen 
                  ? "Clients can currently see the queue and request a walk-in spot from the website." 
                  : "Clients currently see 'Closed by Owner' and can only book advance appointments."}
              </p>
            </div>

            {/* Switch Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleToggle(true)}
                disabled={isWaitlistOpen}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border flex flex-col items-center justify-center gap-1.5 transition-all font-mono ${
                  isWaitlistOpen
                    ? 'opacity-40 border-emerald-500/30 bg-emerald-950/20 text-emerald-400 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 cursor-pointer shadow-lg active:scale-95'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>Open Waitlist</span>
                <span className="text-[9px] font-normal normal-case opacity-80">(Accept Walk-ins)</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggle(false)}
                disabled={!isWaitlistOpen}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border flex flex-col items-center justify-center gap-1.5 transition-all font-mono ${
                  !isWaitlistOpen
                    ? 'opacity-40 border-red-500/30 bg-red-950/20 text-red-400 cursor-default'
                    : 'bg-red-600 hover:bg-red-500 text-white border-red-400 cursor-pointer shadow-lg active:scale-95'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>Close Waitlist</span>
                <span className="text-[9px] font-normal normal-case opacity-80">(Appointments only)</span>
              </button>
            </div>

            {onOpenFullAdmin && (
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  onOpenFullAdmin();
                }}
                className="w-full mb-3 bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 py-2.5 px-4 text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accéder à la Console Firestore & Réservations &rarr;</span>
              </button>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500 font-mono">
              <span>Owner Mode Active</span>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="text-gold hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

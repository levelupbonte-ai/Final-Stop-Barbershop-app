// src/lib/waitlistService.ts

export const WAITLIST_STORAGE_KEY = 'finalstop_waitlist_open';
export const OWNER_PIN_KEY = 'finalstop_owner_pin';
export const DEFAULT_OWNER_PIN = '1234';

/**
 * Checks whether the waitlist is currently opened by the shop owner.
 * Defaults to false (closed until owner explicitly activates it).
 */
export function getIsWaitlistOpen(): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem(WAITLIST_STORAGE_KEY);
  return val === 'true';
}

/**
 * Updates the waitlist open status and notifies all active components.
 */
export function setIsWaitlistOpen(isOpen: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WAITLIST_STORAGE_KEY, isOpen ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('waitlist-status-changed', { detail: { isOpen } }));
}

/**
 * Validates the owner PIN. Default is 1234.
 */
export function verifyOwnerPin(pin: string): boolean {
  if (typeof window === 'undefined') return pin === DEFAULT_OWNER_PIN;
  const customPin = localStorage.getItem(OWNER_PIN_KEY);
  if (customPin) {
    return pin.trim() === customPin.trim();
  }
  return pin.trim() === DEFAULT_OWNER_PIN;
}

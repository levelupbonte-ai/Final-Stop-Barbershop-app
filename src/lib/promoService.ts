// lib/promoService.ts
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface PromoDefinition {
  code: string;
  percent?: number;
  amount?: number;
  label: string;
  description: string;
  expiresAt?: string; // YYYY-MM-DD
  singleUsePerClient: boolean;
}

export const SYSTEM_PROMOS: Record<string, PromoDefinition> = {
  FINALSTOP15: {
    code: 'FINALSTOP15',
    percent: 15,
    label: '15% Off VIP Discount',
    description: '15% off your master service appointment',
    expiresAt: '2026-12-31',
    singleUsePerClient: true,
  },
  VIP10: {
    code: 'VIP10',
    amount: 10,
    label: '$10 Off Club Pass',
    description: '$10 credit applied to your haircut or beard grooming',
    expiresAt: '2026-12-31',
    singleUsePerClient: true,
  },
  WELCOME15: {
    code: 'WELCOME15',
    percent: 15,
    label: '15% Off First Visit Pass',
    description: '15% off welcome gift for new guests',
    expiresAt: '2026-12-31',
    singleUsePerClient: true,
  },
  BARBER10: {
    code: 'BARBER10',
    amount: 10,
    label: '$10 Off Chair Special',
    description: '$10 discount on any barber chair service',
    expiresAt: '2026-12-31',
    singleUsePerClient: true,
  },
  LEVELUP20: {
    code: 'LEVELUP20',
    percent: 20,
    label: '20% Off LevelUp Special',
    description: '20% special promotional discount',
    expiresAt: '2026-12-31',
    singleUsePerClient: true,
  },
};

const LOCAL_STORAGE_KEY = 'finalstop_redeemed_promos';

interface PromoRedemptionRecord {
  code: string;
  email: string;
  ticketId: string;
  redeemedAt: string;
}

export const getRedeemedPromos = (): PromoRedemptionRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Checks if a promo code has already been redeemed on this browser or with this email.
 */
export const isPromoAlreadyRedeemed = (code: string, email?: string): boolean => {
  const normCode = code.trim().toUpperCase();
  const normEmail = email?.trim().toLowerCase();
  const list = getRedeemedPromos();

  return list.some(item => {
    if (item.code.toUpperCase() !== normCode) return false;
    if (normEmail && item.email.toLowerCase() === normEmail) return true;
    return true; // Single-use per device/browser session
  });
};

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  label?: string;
  percent?: number;
  amount?: number;
  errorMessage?: string;
}

/**
 * Validates a promo code against active system codes, expiration date, and prior redemptions.
 */
export const validatePromo = async (code: string, userEmail?: string): Promise<PromoValidationResult> => {
  const raw = code.trim().toUpperCase();
  if (!raw) {
    return { valid: false, code: raw, errorMessage: 'Please enter a promo code.' };
  }

  // 1. Check local redemption history
  if (isPromoAlreadyRedeemed(raw, userEmail)) {
    return {
      valid: false,
      code: raw,
      errorMessage: `Promo code "${raw}" has already been used and has expired for this account.`
    };
  }

  // 2. Check Firestore remote redemption if userEmail is provided
  if (userEmail) {
    try {
      const redemptionId = `${raw}_${userEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const snap = await getDoc(doc(db, 'promo_redemptions', redemptionId));
      if (snap.exists()) {
        return {
          valid: false,
          code: raw,
          errorMessage: `Promo code "${raw}" has already been redeemed by ${userEmail}.`
        };
      }
    } catch {
      // Non-blocking offline fallback
    }
  }

  // 3. Match against system codes or dynamic generated codes
  let match: PromoDefinition | null = SYSTEM_PROMOS[raw] || null;

  if (!match && raw.startsWith('WELCOME-')) {
    match = {
      code: raw,
      percent: 15,
      label: '15% Off Welcome Pass',
      description: 'Single-use dynamic welcome pass',
      expiresAt: '2026-12-31',
      singleUsePerClient: true,
    };
  }

  if (!match) {
    return {
      valid: false,
      code: raw,
      errorMessage: 'Invalid promo code. Please check your spelling.'
    };
  }

  // 4. Expiration date check
  if (match.expiresAt) {
    const today = new Date().toISOString().split('T')[0];
    if (today > match.expiresAt) {
      return {
        valid: false,
        code: raw,
        errorMessage: `Promo code "${raw}" expired on ${match.expiresAt}.`
      };
    }
  }

  return {
    valid: true,
    code: match.code,
    label: match.label,
    percent: match.percent,
    amount: match.amount,
  };
};

/**
 * Marks a promo code as redeemed/consumed once an appointment is successfully booked.
 */
export const recordPromoRedeemed = async (code: string, email: string, ticketId: string): Promise<void> => {
  const normCode = code.trim().toUpperCase();
  const normEmail = email.trim().toLowerCase();

  const record: PromoRedemptionRecord = {
    code: normCode,
    email: normEmail,
    ticketId,
    redeemedAt: new Date().toISOString()
  };

  // 1. Save in localStorage
  const current = getRedeemedPromos();
  current.push(record);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (_) {}

  // 2. Save in Firestore promo_redemptions collection
  try {
    const redemptionId = `${normCode}_${normEmail.replace(/[^a-z0-9]/g, '_')}`;
    await setDoc(doc(db, 'promo_redemptions', redemptionId), {
      code: normCode,
      email: normEmail,
      ticketId,
      redeemedAt: serverTimestamp(),
      clientDevice: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    });
  } catch (err) {
    console.debug('Firestore promo redemption logged locally:', err);
  }
};

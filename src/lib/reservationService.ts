// lib/reservationService.ts
import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

export interface ReservationRecord {
  id?: string;
  ticketId: string;
  name: string;
  clientName?: string;
  fullName?: string;
  email: string;
  clientEmail?: string;
  phone?: string;
  service: string;
  serviceId?: string;
  price: string;
  originalPrice?: string;
  discount?: string | null;
  promoCode?: string | null;
  duration: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:30 AM"
  barber: string;
  notes?: string;
  status: 'confirmed' | 'in_chair' | 'locked' | 'completed' | 'cancelled';
  barberAccepted?: boolean;
  createdAt?: any;
  updatedAt?: any;
  cancelledAt?: any;
}

/**
 * Checks if the appointment is eligible for client modifications or cancellation.
 * Rules:
 * 1. Must NOT be locked / in chair / completed / barber-accepted.
 * 2. Must NOT be cancelled.
 * 3. Must be at least 2 hours prior to the scheduled appointment time.
 */
export const evaluateTicketModificationEligibility = (
  reservation: Partial<ReservationRecord>
): {
  canModify: boolean;
  reason?: 'barber_locked' | 'within_cutoff' | 'already_cancelled' | 'past_date';
  message?: string;
} => {
  if (!reservation) {
    return { canModify: false, message: 'No reservation loaded.' };
  }

  // 1. Check if cancelled
  if (reservation.status === 'cancelled') {
    return {
      canModify: false,
      reason: 'already_cancelled',
      message: 'This appointment has already been cancelled.'
    };
  }

  // 2. Check if barber locked or accepted the ticket
  if (
    reservation.status === 'in_chair' ||
    reservation.status === 'locked' ||
    reservation.status === 'completed' ||
    reservation.barberAccepted === true
  ) {
    return {
      canModify: false,
      reason: 'barber_locked',
      message: 'Your barber has already accepted/locked this ticket. Online changes are closed. Please call the shop directly.'
    };
  }

  // 3. Check 2-hour cutoff rule based on appointment date and time
  if (reservation.date && reservation.time) {
    try {
      const [year, month, day] = reservation.date.split('-').map(Number);
      
      // Parse time string e.g. "11:30 AM", "2:15 PM"
      const timeMatch = reservation.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3].toUpperCase();

        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;

        const appointmentDateTime = new Date(year, month - 1, day, hours, minutes, 0);
        const now = new Date();

        const diffMs = appointmentDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 0) {
          return {
            canModify: false,
            reason: 'past_date',
            message: 'This appointment date or time has already passed.'
          };
        }

        if (diffHours < 2) {
          return {
            canModify: false,
            reason: 'within_cutoff',
            message: 'Modifications must be made at least 2 hours before your appointment. Please call the shop directly at +1 (619) 886-1267 for immediate assistance.'
          };
        }
      }
    } catch (e) {
      console.warn('Error parsing appointment date/time for cutoff:', e);
    }
  }

  return { canModify: true };
};

/**
 * Searches Firestore for a reservation or waitlist ticket by ID, email, or phone.
 */
export const lookupReservationOrTicket = async (queryTerm: string): Promise<any | null> => {
  const cleanTerm = queryTerm.trim();
  const lowerTerm = cleanTerm.toLowerCase();
  if (!cleanTerm) return null;

  // 1. Direct Document lookup in reservations (e.g. "FS-12345")
  try {
    const directDocSnap = await getDoc(doc(db, 'reservations', cleanTerm.toUpperCase()));
    if (directDocSnap.exists()) {
      return { id: directDocSnap.id, ...directDocSnap.data(), type: 'reservation' };
    }
  } catch (err) {
    console.debug('Direct doc lookup fallback:', err);
  }

  // 2. Query reservations collection by ticketId, email, or phone
  try {
    const resRef = collection(db, 'reservations');
    
    // By ticketId
    const qTicket = query(resRef, where('ticketId', '==', cleanTerm.toUpperCase()));
    const snapTicket = await getDocs(qTicket);
    if (!snapTicket.empty) {
      const docItem = snapTicket.docs[0];
      return { id: docItem.id, ...docItem.data(), type: 'reservation' };
    }

    // By email
    if (lowerTerm.includes('@')) {
      const qEmail = query(resRef, where('email', '==', lowerTerm));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const docItem = snapEmail.docs[0];
        return { id: docItem.id, ...docItem.data(), type: 'reservation' };
      }
    }

    // Full scan of recent reservations
    const snapAll = await getDocs(resRef);
    let matched: any = null;
    snapAll.forEach(d => {
      const data = d.data();
      const idMatch = (data.ticketId && data.ticketId.toUpperCase() === cleanTerm.toUpperCase()) || d.id.toUpperCase() === cleanTerm.toUpperCase();
      const emailMatch = data.email && data.email.toLowerCase() === lowerTerm;
      const phoneMatch = data.phone && data.phone.replace(/\D/g, '').includes(cleanTerm.replace(/\D/g, ''));
      const nameMatch = data.name && data.name.toLowerCase().includes(lowerTerm);

      if (idMatch || emailMatch || (cleanTerm.length >= 4 && (phoneMatch || nameMatch))) {
        matched = { id: d.id, ...data, type: 'reservation' };
      }
    });

    if (matched) return matched;
  } catch (err) {
    console.warn('Firestore reservations query fallback:', err);
  }

  // 3. Query waitlist collection
  try {
    const waitlistRef = collection(db, 'waitlist');
    const snapWaitlist = await getDocs(waitlistRef);
    let matchedWaitlist: any = null;

    snapWaitlist.forEach(d => {
      const data = d.data();
      const idMatch = data.ticketId && data.ticketId.toUpperCase() === cleanTerm.toUpperCase();
      const nameMatch = data.name && data.name.toLowerCase().includes(lowerTerm);
      const phoneMatch = data.phone && data.phone.replace(/\D/g, '').includes(cleanTerm.replace(/\D/g, ''));

      if (idMatch || nameMatch || phoneMatch) {
        matchedWaitlist = { id: d.id, ...data, type: 'waitlist' };
      }
    });

    if (matchedWaitlist) return matchedWaitlist;
  } catch (err) {
    console.warn('Firestore waitlist search fallback:', err);
  }

  // 4. LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const savedBooking = localStorage.getItem('finalstop_active_booking');
    if (savedBooking) {
      try {
        const parsed = JSON.parse(savedBooking);
        const idMatch = parsed.ticketId && parsed.ticketId.toUpperCase() === cleanTerm.toUpperCase();
        const emailMatch = parsed.email && parsed.email.toLowerCase() === lowerTerm;
        const nameMatch = parsed.name && parsed.name.toLowerCase().includes(lowerTerm);
        if (idMatch || emailMatch || nameMatch) {
          return { ...parsed, type: 'reservation' };
        }
      } catch (_) {}
    }

    const savedTicket = localStorage.getItem('finalstop_active_ticket');
    if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);
        const idMatch = parsed.ticketId && parsed.ticketId.toUpperCase() === cleanTerm.toUpperCase();
        const nameMatch = parsed.name && parsed.name.toLowerCase().includes(lowerTerm);
        if (idMatch || nameMatch) {
          return { ...parsed, type: 'waitlist' };
        }
      } catch (_) {}
    }
  }

  return null;
};

/**
 * Reschedules an active reservation to a new date and time.
 */
export const rescheduleReservation = async (
  ticketId: string,
  newDate: string,
  newTime: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const normTicketId = ticketId.trim().toUpperCase();

    // 1. Update Firestore
    try {
      const docRef = doc(db, 'reservations', normTicketId);
      await updateDoc(docRef, {
        date: newDate,
        time: newTime,
        updatedAt: serverTimestamp(),
        rescheduled: true
      });
    } catch (dbErr) {
      // If document was created with an auto-id instead of ticketId, search and update
      try {
        const q = query(collection(db, 'reservations'), where('ticketId', '==', normTicketId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, {
            date: newDate,
            time: newTime,
            updatedAt: serverTimestamp(),
            rescheduled: true
          });
        }
      } catch (fallbackErr) {
        console.warn('Firestore reschedule update fallback:', fallbackErr);
      }
    }

    // 2. Update localStorage
    if (typeof window !== 'undefined') {
      const savedBooking = localStorage.getItem('finalstop_active_booking');
      if (savedBooking) {
        try {
          const parsed = JSON.parse(savedBooking);
          if (parsed.ticketId === normTicketId) {
            parsed.date = newDate;
            parsed.time = newTime;
            localStorage.setItem('finalstop_active_booking', JSON.stringify(parsed));
          }
        } catch (_) {}
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error rescheduling reservation:', err);
    return { success: false, error: err.message || 'Failed to update reservation.' };
  }
};

/**
 * Cancels an active reservation.
 */
export const cancelReservation = async (
  ticketId: string,
  reason = 'Cancelled by client'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const normTicketId = ticketId.trim().toUpperCase();

    // 1. Update Firestore
    try {
      const docRef = doc(db, 'reservations', normTicketId);
      await updateDoc(docRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelReason: reason
      });
    } catch (dbErr) {
      try {
        const q = query(collection(db, 'reservations'), where('ticketId', '==', normTicketId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, {
            status: 'cancelled',
            cancelledAt: serverTimestamp(),
            cancelReason: reason
          });
        }
      } catch (fallbackErr) {
        console.warn('Firestore cancel update fallback:', fallbackErr);
      }
    }

    // 2. Update localStorage
    if (typeof window !== 'undefined') {
      const savedBooking = localStorage.getItem('finalstop_active_booking');
      if (savedBooking) {
        try {
          const parsed = JSON.parse(savedBooking);
          if (parsed.ticketId === normTicketId) {
            parsed.status = 'cancelled';
            parsed.cancelledAt = new Date().toISOString();
            localStorage.setItem('finalstop_active_booking', JSON.stringify(parsed));
          }
        } catch (_) {}
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error cancelling reservation:', err);
    return { success: false, error: err.message || 'Failed to cancel reservation.' };
  }
};

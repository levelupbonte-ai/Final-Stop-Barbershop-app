import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  deleteField
} from 'firebase/firestore';
import { db, auth, storage } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { OFFICIAL_SERVICES, ServiceItem } from '../data/services';

export interface FirestoreReservation {
  id?: string;
  ticketId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  price: string;
  date: string;
  time: string;
  barber: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: any;
}

export interface FirestoreWaitlistEntry {
  id?: string;
  ticketId: string;
  name: string;
  phone: string;
  email?: string;
  barber: string;
  service: string;
  position: number;
  estMinutes: number;
  status: 'waiting' | 'called' | 'in-chair' | 'served' | 'cancelled';
  joinedAt: string;
  joinedDate?: string;
  createdAt?: any;
}

export interface ProQuoteRequest {
  id?: string;
  ticketId: string;
  clientName: string;
  companyName?: string;
  phone: string;
  email: string;
  serviceType: string;
  headcount: number;
  eventDate: string;
  location?: string;
  estimatedBudget?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'quoted' | 'approved' | 'declined';
  createdAt?: any;
}

export interface ShopSocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  twitter?: string;
}

export interface ShopConfig {
  waitlistOpen: boolean;
  promoPopupEnabled?: boolean;
  announcement?: string;
  phone1: string;
  phone2: string;
  address: string;
  hoursWeekday: string;
  hoursSunday: string;
  adminAccessCode?: string;
  socialLinks?: ShopSocialLinks;
}

export interface CollectedClientContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'appointment' | 'waitlist' | 'vip_club' | 'user_account';
  lastActivity?: string;
  notes?: string;
}

export interface FirestoreGalleryItem {
  id?: string;
  title: string;
  category: string;
  barber: 'Mika' | 'Lusca' | 'Both';
  targetAudience: 'Women & Girls (Braids)' | 'Men & Boys (Haircuts)' | 'Shop';
  imageUrl: string;
  description: string;
  createdAt?: any;
}

const LOCAL_STORAGE_RESERVATIONS_KEY = 'finalstop_reservations_cache';
const LOCAL_STORAGE_WAITLIST_KEY = 'finalstop_waitlist_cache';
const LOCAL_STORAGE_CONFIG_KEY = 'finalstop_config_cache';
const LOCAL_STORAGE_GALLERY_KEY = 'finalstop_gallery_cache';

/**
 * Safely extracts a YYYY-MM-DD date string from any date format:
 * - String (ISO string or YYYY-MM-DD)
 * - Firestore Timestamp instance ({ toDate() })
 * - Serialized Firestore Timestamp ({ seconds, _seconds })
 * - JavaScript Date object
 * - Milliseconds/Seconds numeric timestamp
 */
export function extractDateString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    if (val.includes('T')) {
      return val.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val.slice(0, 10);
    }
    return val;
  }
  if (typeof val?.toDate === 'function') {
    try {
      return val.toDate().toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
  if (val instanceof Date) {
    try {
      return val.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
  if (typeof val === 'object') {
    const sec = val.seconds ?? val._seconds;
    if (typeof sec === 'number') {
      try {
        return new Date(sec * 1000).toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
  }
  if (typeof val === 'number' && !isNaN(val)) {
    try {
      const date = val > 1e11 ? new Date(val) : new Date(val * 1000);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
  return '';
}

// Helper to ensure authenticated state if needed
export async function ensureFirebaseAuth() {
  try {
    if (auth.currentUser) return auth.currentUser;
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Transparent anonymous auth notice:', err);
    return null;
  }
}

/**
 * Saves a new appointment reservation to Firestore.
 */
export async function saveReservation(data: Omit<FirestoreReservation, 'id'>): Promise<string> {
  await ensureFirebaseAuth();
  const payload = {
    ...data,
    name: data.clientName, // compatibility with generic rules
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'reservations'), payload);
    const savedId = docRef.id;

    // Cache locally as backup
    const current = getLocalReservations();
    current.unshift({ ...data, id: savedId });
    localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(current.slice(0, 50)));

    return savedId;
  } catch (err) {
    console.warn('Firestore direct write error, saving to resilient storage:', err);
    const fallbackId = 'res_' + Date.now();
    const current = getLocalReservations();
    current.unshift({ ...data, id: fallbackId });
    localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(current.slice(0, 50)));
    return fallbackId;
  }
}

/**
 * Updates an appointment reservation status (e.g. pending, confirmed, completed, cancelled).
 */
export async function updateReservationStatus(docId: string, status: FirestoreReservation['status']): Promise<void> {
  try {
    const ref = doc(db, 'reservations', docId);
    await updateDoc(ref, { 
      status,
      updatedAt: serverTimestamp() 
    });
  } catch (err) {
    console.warn('Could not update Firestore reservation directly:', err);
  }

  // Update local cache
  const current = getLocalReservations();
  const idx = current.findIndex(r => r.id === docId || r.ticketId === docId);
  if (idx !== -1) {
    current[idx].status = status;
    localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(current));
  }
}

/**
 * Retrieves all reservations (with realtime snapshot support or fallback).
 */
export async function getReservations(): Promise<FirestoreReservation[]> {
  try {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreReservation));
      localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Error fetching reservations from Firestore:', err);
  }
  return getLocalReservations();
}

/**
 * Saves a new waitlist entry to Firestore.
 */
export async function saveWaitlistEntry(entry: Omit<FirestoreWaitlistEntry, 'id'>): Promise<string> {
  await ensureFirebaseAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const payload = {
    ...entry,
    joinedDate: entry.joinedDate || todayStr,
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'waitlist'), payload);
    const savedId = docRef.id;

    const current = getLocalWaitlist();
    current.push({ ...entry, id: savedId, joinedDate: todayStr });
    localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(current));

    return savedId;
  } catch (err) {
    console.warn('Firestore waitlist write error:', err);
    const fallbackId = 'wl_' + Date.now();
    const current = getLocalWaitlist();
    current.push({ ...entry, id: fallbackId, joinedDate: todayStr });
    localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(current));
    return fallbackId;
  }
}

/**
 * Retrieves the current waitlist queue.
 * @param includeCompleted If true, returns all entries including served and cancelled (useful for admin daily log).
 */
export async function getWaitlistQueue(includeCompleted: boolean = false): Promise<FirestoreWaitlistEntry[]> {
  try {
    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'asc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs
        .map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            joinedDate: data.joinedDate || extractDateString(data.createdAt) || new Date().toISOString().split('T')[0]
          } as FirestoreWaitlistEntry;
        });
      
      localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(list));
      if (!includeCompleted) {
        return list.filter(item => item.status === 'waiting' || item.status === 'called' || item.status === 'in-chair');
      }
      return list;
    }
  } catch (err) {
    console.warn('Error fetching waitlist from Firestore:', err);
  }
  const local = getLocalWaitlist();
  if (!includeCompleted) {
    return local.filter(item => item.status === 'waiting' || item.status === 'called' || item.status === 'in-chair');
  }
  return local;
}

/**
 * Updates a waitlist entry status (e.g. waiting, called, in-chair, served, cancelled).
 */
export async function updateWaitlistStatus(docId: string, status: FirestoreWaitlistEntry['status']): Promise<void> {
  try {
    const ref = doc(db, 'waitlist', docId);
    await updateDoc(ref, { 
      status,
      updatedAt: serverTimestamp() 
    });
  } catch (err) {
    console.warn('Could not update Firestore waitlist entry directly:', err);
  }

  // Update local
  const current = getLocalWaitlist();
  const idx = current.findIndex(w => w.id === docId || w.ticketId === docId);
  if (idx !== -1) {
    current[idx].status = status;
    localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(current));
  }
}

/**
 * Moves a specific waitlist ticket straight to the front of the line (Position #1).
 * Recalculates other positions automatically in Firestore.
 */
export async function moveWaitlistToFront(docId: string): Promise<FirestoreWaitlistEntry[]> {
  const current = await getWaitlistQueue(true);
  const targetIndex = current.findIndex(w => w.id === docId || w.ticketId === docId);
  if (targetIndex === -1) return current;

  const [targetItem] = current.splice(targetIndex, 1);
  // Re-insert at the beginning of active waiting/in-chair entries
  current.unshift(targetItem);

  // Recalculate positions
  let activePos = 1;
  const updatedList = current.map(item => {
    if (item.status === 'waiting' || item.status === 'called' || item.status === 'in-chair') {
      const updated = { ...item, position: activePos, estMinutes: Math.max(5, (activePos - 1) * 15) };
      activePos++;
      return updated;
    }
    return item;
  });

  // Update in Firestore
  for (const item of updatedList) {
    if (item.id) {
      try {
        const ref = doc(db, 'waitlist', item.id);
        await updateDoc(ref, { 
          position: item.position,
          estMinutes: item.estMinutes 
        });
      } catch (e) {
        // ignore individual write error
      }
    }
  }

  localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent('waitlist-reordered', { detail: { list: updatedList } }));
  return updatedList;
}

/**
 * Reorders waitlist entries by swapping positions (e.g. Move Up or Move Down).
 */
export async function reorderWaitlistQueue(docId: string, direction: 'up' | 'down'): Promise<FirestoreWaitlistEntry[]> {
  const current = await getWaitlistQueue(true);
  const activeItems = current.filter(w => w.status === 'waiting' || w.status === 'called' || w.status === 'in-chair');
  const index = activeItems.findIndex(w => w.id === docId || w.ticketId === docId);
  if (index === -1) return current;

  if (direction === 'up' && index > 0) {
    const temp = activeItems[index];
    activeItems[index] = activeItems[index - 1];
    activeItems[index - 1] = temp;
  } else if (direction === 'down' && index < activeItems.length - 1) {
    const temp = activeItems[index];
    activeItems[index] = activeItems[index + 1];
    activeItems[index + 1] = temp;
  } else {
    return current;
  }

  // Re-assign positions
  activeItems.forEach((item, idx) => {
    item.position = idx + 1;
    item.estMinutes = Math.max(5, idx * 15);
    if (item.id) {
      try {
        updateDoc(doc(db, 'waitlist', item.id), { 
          position: item.position,
          estMinutes: item.estMinutes 
        });
      } catch {}
    }
  });

  const remaining = current.filter(w => w.status !== 'waiting' && w.status !== 'called' && w.status !== 'in-chair');
  const merged = [...activeItems, ...remaining];
  localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('waitlist-reordered', { detail: { list: merged } }));
  return merged;
}

/**
 * Clôture et archive les anciens tickets pour repartir sur une file propre pour le barbier.
 * Conserve uniquement les tickets actifs d'aujourd'hui.
 */
export async function archiveOldWaitlistTickets(): Promise<FirestoreWaitlistEntry[]> {
  const current = await getWaitlistQueue(true);
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Conserver uniquement les tickets actifs du jour
  const activeToday = current.filter(item => {
    const itemDate = item.joinedDate || extractDateString(item.createdAt);
    const isToday = itemDate === todayStr || !itemDate;
    const isActive = item.status === 'waiting' || item.status === 'called' || item.status === 'in-chair';
    return isToday && isActive;
  });

  activeToday.forEach((item, idx) => {
    item.position = idx + 1;
    item.estMinutes = Math.max(5, idx * 15);
  });

  localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(activeToday));
  window.dispatchEvent(new CustomEvent('waitlist-reordered', { detail: { list: activeToday } }));
  return activeToday;
}

export interface ShopRedirectConfig {
  redirectUrl: string;
  redirectEnabled: boolean;
  redirectLabel: string;
}

export const LOCAL_STORAGE_REDIRECT_KEY = 'finalstop_shop_redirect';

export async function getShopRedirectConfig(): Promise<ShopRedirectConfig> {
  const defaultConfig: ShopRedirectConfig = {
    redirectUrl: 'https://finalstop.org',
    redirectEnabled: false,
    redirectLabel: 'Avis Google & Réseaux Sociaux'
  };

  try {
    const snap = await getDoc(doc(db, 'shop_config', 'status'));
    if (snap.exists()) {
      const data = snap.data();
      if (data?.redirectConfig) {
        localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, JSON.stringify(data.redirectConfig));
        return data.redirectConfig;
      }
    }
  } catch (err) {
    console.warn('Could not read redirect config:', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_REDIRECT_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }
  return defaultConfig;
}

export async function setShopRedirectConfig(config: ShopRedirectConfig): Promise<void> {
  localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('redirect-config-changed', { detail: config }));

  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    await setDoc(configRef, {
      redirectConfig: config,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Shop redirect config sync notice:', err);
  }
}

/**
 * Updates shop waitlist open/closed status in Firestore.
 */
export async function setShopWaitlistOpen(isOpen: boolean): Promise<void> {
  localStorage.setItem('finalstop_waitlist_open', isOpen ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('waitlist-status-changed', { detail: { isOpen } }));

  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    await setDoc(configRef, {
      waitlistOpen: isOpen,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore shop config sync notice:', err);
  }
}

export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  waitlistOpen: true,
  promoPopupEnabled: true,
  announcement: '',
  phone1: '(619) 886-1267',
  phone2: '(619) 928-7084',
  address: '5277 El Cajon Blvd, San Diego, CA 92115',
  hoursWeekday: 'Monday - Saturday: 10:00 AM - 6:00 PM',
  hoursSunday: 'Sunday: Closed',
  adminAccessCode: '92115',
  socialLinks: {
    instagram: 'https://instagram.com/finalstopbarbershop',
    tiktok: 'https://tiktok.com/@finalstopbarbershop',
    youtube: '',
    facebook: '',
    twitter: ''
  }
};

/**
 * Retrieves full shop configuration from Firestore database.
 */
export async function getShopConfig(): Promise<ShopConfig> {
  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        waitlistOpen: typeof data.waitlistOpen === 'boolean' ? data.waitlistOpen : true,
        promoPopupEnabled: typeof data.promoPopupEnabled === 'boolean' ? data.promoPopupEnabled : true,
        announcement: data.announcement || '',
        phone1: data.phone1 || DEFAULT_SHOP_CONFIG.phone1,
        phone2: data.phone2 || DEFAULT_SHOP_CONFIG.phone2,
        address: data.address || DEFAULT_SHOP_CONFIG.address,
        hoursWeekday: data.hoursWeekday || DEFAULT_SHOP_CONFIG.hoursWeekday,
        hoursSunday: data.hoursSunday || DEFAULT_SHOP_CONFIG.hoursSunday,
        adminAccessCode: data.adminAccessCode || DEFAULT_SHOP_CONFIG.adminAccessCode,
        socialLinks: {
          instagram: data.socialLinks?.instagram ?? DEFAULT_SHOP_CONFIG.socialLinks?.instagram,
          tiktok: data.socialLinks?.tiktok ?? DEFAULT_SHOP_CONFIG.socialLinks?.tiktok,
          youtube: data.socialLinks?.youtube ?? '',
          facebook: data.socialLinks?.facebook ?? '',
          twitter: data.socialLinks?.twitter ?? ''
        }
      };
    }
  } catch (err) {
    console.warn('Could not read shop config from Firestore, using defaults:', err);
  }
  return DEFAULT_SHOP_CONFIG;
}

/**
 * Updates shop configuration in Firestore database and notifies the application.
 */
export async function updateShopConfig(updates: Partial<ShopConfig>): Promise<void> {
  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    await setDoc(configRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shop-config-changed', { detail: updates }));
    }
  } catch (err) {
    console.error('Error updating shop config in Firestore:', err);
    throw err;
  }
}

/**
 * Retrieves the admin access code configured in Firestore database.
 * Returns '92115' as initial master default if not configured yet.
 */
export async function getAdminAccessCode(): Promise<string> {
  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.adminAccessCode && typeof data.adminAccessCode === 'string' && data.adminAccessCode.trim().length > 0) {
        return data.adminAccessCode.trim();
      }
    }
  } catch (err) {
    console.warn('Could not read admin access code from Firestore:', err);
  }
  return '92115';
}

/**
 * Updates the admin access code in Firestore database.
 */
export async function setAdminAccessCode(newCode: string): Promise<void> {
  const cleanCode = newCode.trim();
  if (!cleanCode) throw new Error('Security access code cannot be empty.');

  await ensureFirebaseAuth();
  const configRef = doc(db, 'shop_config', 'status');
  await setDoc(configRef, {
    adminAccessCode: cleanCode,
    updatedAt: serverTimestamp()
  }, { merge: true });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shop-config-changed', { detail: { adminAccessCode: cleanCode } }));
  }
}

/**
 * Resets the admin access code in Firestore database so that a new code can be defined.
 */
export async function resetAdminAccessCode(): Promise<void> {
  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    await updateDoc(configRef, {
      adminAccessCode: '92115',
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error resetting admin access code in Firestore:', err);
    throw err;
  }
}

/**
 * Verifies if entered code matches the code from Firestore database.
 * If no code has been initialized yet in the database, sets '92115' as the master database code!
 */
export async function verifyAdminAccessCode(enteredCode: string): Promise<{ valid: boolean; message?: string; isInitialSetup?: boolean }> {
  const cleanEntered = enteredCode.trim();
  if (!cleanEntered) {
    return { valid: false, message: 'Please enter the staff security PIN.' };
  }

  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    const snap = await getDoc(configRef);

    let storedCode = '92115';

    if (snap.exists()) {
      const data = snap.data();
      if (data?.adminAccessCode && typeof data.adminAccessCode === 'string' && data.adminAccessCode.trim().length > 0) {
        storedCode = data.adminAccessCode.trim();
      } else {
        // Initialize Firestore with default '92115'
        await setDoc(configRef, {
          adminAccessCode: '92115',
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } else {
      // Initialize shop config in Firestore with '92115'
      await setDoc(configRef, {
        ...DEFAULT_SHOP_CONFIG,
        adminAccessCode: '92115',
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    const isMatch = cleanEntered.toLowerCase() === storedCode.toLowerCase();
    if (isMatch) {
      return { valid: true };
    }
    return { 
      valid: false, 
      message: 'Invalid Staff PIN code. Access denied.' 
    };
  } catch (err: any) {
    console.error('Error verifying admin access code in Firestore:', err);
    // Graceful fallback to default master code if offline
    if (cleanEntered === '92115') {
      return { valid: true };
    }
    return { valid: false, message: 'Verification error. Please check database connection.' };
  }
}

/**
 * Retrieves all collected client contact emails across reservations, waitlist, VIP club, and users.
 */
export async function getClientContactList(): Promise<CollectedClientContact[]> {
  const contactsMap = new Map<string, CollectedClientContact>();

  try {
    await ensureFirebaseAuth();

    // 1. Fetch reservations
    try {
      const resSnap = await getDocs(collection(db, 'reservations'));
      resSnap.forEach(docSnap => {
        const d = docSnap.data();
        const email = (d.email || d.clientEmail || '').trim().toLowerCase();
        if (email && email.includes('@')) {
          const name = d.clientName || d.name || 'Client';
          const phone = d.phone || d.clientPhone || '';
          const date = extractDateString(d.date) || extractDateString(d.createdAt) || 'Recent';
          contactsMap.set(email, {
            id: docSnap.id,
            name,
            email,
            phone,
            source: 'appointment',
            lastActivity: date,
            notes: `Service: ${d.service || 'Appointment'}`
          });
        }
      });
    } catch (e) {
      console.warn('Reservations contacts notice:', e);
    }

    // 2. Fetch VIP club signups
    try {
      const vipSnap = await getDocs(collection(db, 'vip_club'));
      vipSnap.forEach(docSnap => {
        const d = docSnap.data();
        const contact = (d.contact || d.email || '').trim().toLowerCase();
        if (contact && contact.includes('@')) {
          const existing = contactsMap.get(contact);
          const date = extractDateString(d.createdAt) || 'VIP Member';
          if (!existing) {
            contactsMap.set(contact, {
              id: docSnap.id,
              name: d.name || 'VIP Member',
              email: contact,
              phone: d.phone || '',
              source: 'vip_club',
              lastActivity: date,
              notes: `Code: ${d.codeGranted || 'FINALSTOP15'}`
            });
          }
        }
      });
    } catch (e) {
      console.warn('VIP club contacts notice:', e);
    }

    // 3. Fetch Waitlist queue tickets
    try {
      const waitSnap = await getDocs(collection(db, 'waitlist'));
      waitSnap.forEach(docSnap => {
        const d = docSnap.data();
        const email = (d.email || '').trim().toLowerCase();
        if (email && email.includes('@')) {
          if (!contactsMap.has(email)) {
            contactsMap.set(email, {
              id: docSnap.id,
              name: d.clientName || d.name || 'Walk-In Guest',
              email,
              phone: d.phone || '',
              source: 'waitlist',
              lastActivity: extractDateString(d.createdAt) || 'Walk-In',
              notes: `Barber: ${d.barber || 'Mika/Lusca'}`
            });
          }
        }
      });
    } catch (e) {
      console.warn('Waitlist contacts notice:', e);
    }

    // 4. Fetch User accounts
    try {
      const userSnap = await getDocs(collection(db, 'users'));
      userSnap.forEach(docSnap => {
        const d = docSnap.data();
        const email = (d.email || '').trim().toLowerCase();
        if (email && email.includes('@')) {
          if (!contactsMap.has(email)) {
            contactsMap.set(email, {
              id: docSnap.id,
              name: d.displayName || d.name || 'Account User',
              email,
              source: 'user_account',
              lastActivity: extractDateString(d.lastLogin) || 'Registered User',
              notes: `Role: ${d.role || 'client'}`
            });
          }
        }
      });
    } catch (e) {
      console.warn('Users contacts notice:', e);
    }

  } catch (err) {
    console.error('Error fetching collected client contacts:', err);
  }

  return Array.from(contactsMap.values());
}

/**
 * Retrieves the list of authorized admin emails from Firestore.
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.adminEmails)) {
        return data.adminEmails.filter((e: any) => typeof e === 'string' && e.trim().length > 0);
      }
    }
  } catch (err) {
    console.warn('Could not read admin emails from Firestore:', err);
  }
  return [];
}

/**
 * Verifies if a user's Google email is an authorized admin.
 * If no admin has been registered yet, the first user to connect is automatically registered as the initial admin!
 */
export async function verifyAndRegisterAdmin(userEmail: string): Promise<{
  authorized: boolean;
  isFirstAdmin: boolean;
  adminEmails: string[];
}> {
  const cleanEmail = userEmail.toLowerCase().trim();
  if (!cleanEmail) {
    return { authorized: false, isFirstAdmin: false, adminEmails: [] };
  }

  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    const snap = await getDoc(configRef);
    let existingEmails: string[] = [];

    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.adminEmails)) {
        existingEmails = data.adminEmails
          .filter((e: any) => typeof e === 'string' && e.trim().length > 0)
          .map((e: string) => e.toLowerCase().trim());
      }
    }

    // FIRST PERSON CONNECTED BECOMES THE INITIAL ADMIN!
    if (existingEmails.length === 0) {
      const initialList = [cleanEmail];
      await setDoc(configRef, {
        adminEmails: initialList,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return {
        authorized: true,
        isFirstAdmin: true,
        adminEmails: initialList
      };
    }

    // Check if user's email is in the authorized list
    const isAuthorized = existingEmails.includes(cleanEmail);
    return {
      authorized: isAuthorized,
      isFirstAdmin: false,
      adminEmails: existingEmails
    };
  } catch (err) {
    console.error('Error verifying admin authorization in Firestore:', err);
    throw err;
  }
}

/**
 * Adds an authorized admin email in Firestore.
 */
export async function addAdminEmail(newEmail: string): Promise<string[]> {
  const cleanEmail = newEmail.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Invalid email address format.');
  }

  await ensureFirebaseAuth();
  const configRef = doc(db, 'shop_config', 'status');
  await setDoc(configRef, {
    adminEmails: arrayUnion(cleanEmail),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return await getAdminEmails();
}

/**
 * Removes an authorized admin email in Firestore.
 */
export async function removeAdminEmail(emailToRemove: string): Promise<string[]> {
  const cleanEmail = emailToRemove.toLowerCase().trim();
  const currentEmails = await getAdminEmails();

  if (currentEmails.length <= 1 && currentEmails.map(e => e.toLowerCase()).includes(cleanEmail)) {
    throw new Error('Cannot remove the last administrator. There must always be at least one authorized admin.');
  }

  await ensureFirebaseAuth();
  const configRef = doc(db, 'shop_config', 'status');
  await setDoc(configRef, {
    adminEmails: arrayRemove(cleanEmail),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return await getAdminEmails();
}

/**
 * Seed initial data to populate Firestore immediately so the user's console is populated.
 */
export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    await ensureFirebaseAuth();

    // 1. Seed Shop Configuration
    await setDoc(doc(db, 'shop_config', 'status'), {
      waitlistOpen: true,
      shopName: 'Final Stop Barber Shop',
      phone1: '(619) 886-1267',
      phone2: '(619) 977-9878',
      address: '5277 El Cajon Blvd, San Diego, CA 92115',
      hoursWeekday: 'Mon - Sat: 9:00 AM - 8:00 PM',
      hoursSunday: 'Sunday: 10:00 AM - 6:00 PM',
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Seed Master Barbers
    await setDoc(doc(db, 'barbers', 'mika'), {
      id: 'mika',
      name: 'Mika',
      role: 'Lead Master Barber & Co-Founder',
      experience: 'Master Craft & Precision',
      specialty: 'Surgical Skin Fades, Straight Razor Lineups, Textured Crops & Master Beard Styling',
      rating: 5.0,
      reviewsCount: 380,
      signatureCut: 'Zero Gap Skin Fade & Razor Finish',
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'barbers', 'lusca'), {
      id: 'lusca',
      name: 'Lusca',
      role: 'Artisan Master Barber & Texture Specialist',
      experience: 'Master Craft & Artistry',
      specialty: 'Bespoke Beard Sculpting, Eucalyptus Hot Towel Steam, Braids, Cornrows & Dreadlocks',
      rating: 5.0,
      reviewsCount: 340,
      signatureCut: 'Master Beard Sculpting & Hot Lather Shave',
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 3. Seed Sample Active Waitlist
    const sampleWaitlist = [
      {
        ticketId: 'FS-101',
        name: 'Jordan K.',
        phone: '(619) ***-4821',
        barber: 'Mika',
        service: 'Skin Fade & Precision Haircut',
        position: 1,
        estMinutes: 10,
        status: 'in-chair',
        joinedAt: '11:15 AM',
        createdAt: serverTimestamp()
      },
      {
        ticketId: 'FS-102',
        name: 'Marcus D.',
        phone: '(619) ***-8932',
        barber: 'Lusca',
        service: 'Beard Sculpting & Hot Lather Shave',
        position: 2,
        estMinutes: 25,
        status: 'waiting',
        joinedAt: '11:30 AM',
        createdAt: serverTimestamp()
      },
      {
        ticketId: 'FS-103',
        name: 'Darius T.',
        phone: '(619) ***-1290',
        barber: 'First Available',
        service: 'The Signature Master Combo: Cut + Beard',
        position: 3,
        estMinutes: 40,
        status: 'waiting',
        joinedAt: '11:45 AM',
        createdAt: serverTimestamp()
      }
    ];

    for (const item of sampleWaitlist) {
      await setDoc(doc(db, 'waitlist', item.ticketId), item, { merge: true });
    }

    // 4. Seed Sample Reservations
    const sampleReservations = [
      {
        ticketId: 'BK-7890',
        clientName: 'Alexandre Roy',
        clientEmail: 'alexandre.roy@example.com',
        clientPhone: '(619) 555-0142',
        service: 'The Signature Master Combo: Cut + Beard',
        price: '$55',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        barber: 'Mika',
        notes: 'First time client, zero fade on sides',
        status: 'confirmed',
        createdAt: serverTimestamp()
      },
      {
        ticketId: 'BK-7891',
        clientName: 'David N.',
        clientEmail: 'david.n@example.com',
        clientPhone: '(619) 555-0199',
        service: 'Custom Braids & Cornrows',
        price: '$65+',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '11:00',
        barber: 'Lusca',
        notes: 'Classic two-strand twist',
        status: 'confirmed',
        createdAt: serverTimestamp()
      }
    ];

    for (const res of sampleReservations) {
      await setDoc(doc(db, 'reservations', res.ticketId), res, { merge: true });
    }

    return { success: true, message: 'Firestore populated successfully with barbers, waitlist, and reservations!' };
  } catch (err: any) {
    console.error('Failed to seed Firestore:', err);
    return { success: false, message: err?.message || 'Firestore connection issue' };
  }
}

// Local cache helpers
function getLocalReservations(): FirestoreReservation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESERVATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalWaitlist(): FirestoreWaitlistEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WAITLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'wl-1',
      ticketId: 'FS-101',
      name: 'Jordan K.',
      phone: '(619) ***-4821',
      barber: 'Mika',
      service: 'Skin Fade & Precision Haircut',
      position: 1,
      estMinutes: 10,
      status: 'in-chair',
      joinedAt: '11:15 AM'
    },
    {
      id: 'wl-2',
      ticketId: 'FS-102',
      name: 'Marcus D.',
      phone: '(619) ***-8932',
      barber: 'Lusca',
      service: 'Beard Sculpting & Hot Lather Shave',
      position: 2,
      estMinutes: 25,
      status: 'waiting',
      joinedAt: '11:30 AM'
    }
  ];
}

export const DEFAULT_GALLERY_ITEMS: FirestoreGalleryItem[] = [
  // MIKA: Girls' and women's braids & protective styles
  {
    id: 'gal-mika-1',
    title: 'Waist-Length Knotless Box Braids',
    category: 'Braids & Cornrows',
    barber: 'Mika',
    targetAudience: 'Women & Girls (Braids)',
    imageUrl: 'https://i.ibb.co/cXxD5MpB/Chat-GPT-Image-6-sept-2026-15-56-42.png',
    description: 'Painless, tension-free knotless box braids for girls and women. Seamless root extensions offering weightless comfort and fluid natural movement.'
  },
  {
    id: 'gal-mika-2',
    title: 'Swirl Cornrows & Geometric Spiral Braids',
    category: 'Braids & Cornrows',
    barber: 'Mika',
    targetAudience: 'Women & Girls (Braids)',
    imageUrl: 'https://i.ibb.co/xq8zMm2t/Chat-GPT-Image-6-sept-2026-15-55-41.png',
    description: 'Intricate swirl pattern cornrows flowing around the crown with zero frizz, calibrated scalp tension, and nourishing hydration finish.'
  },
  {
    id: 'gal-mika-3',
    title: 'Sleek High Braided Ponytail & Cornrow Crown',
    category: 'Braids & Cornrows',
    barber: 'Mika',
    targetAudience: 'Women & Girls (Braids)',
    imageUrl: 'https://i.ibb.co/d4N6qCDJ/Chat-GPT-Image-Sep-6-2026-03-39-13-PM-1.png',
    description: 'High braided ponytail anchored with precision geometric scalp braids and high-gloss conditioning finish for everyday style or special events.'
  },
  {
    id: 'gal-mika-4',
    title: 'Burgundy Goddess Locs & Edge Styling',
    category: 'Locs & Twists',
    barber: 'Mika',
    targetAudience: 'Women & Girls (Braids)',
    imageUrl: 'https://i.ibb.co/zhXtNXB4/Chat-GPT-Image-Sep-6-2026-03-38-30-PM-1.png',
    description: 'Bohemian goddess locs in rich burgundy with loose spiral curl tendrils and sculpted baby-hair waves with organic botanical gel.'
  },
  {
    id: 'gal-mika-5',
    title: 'Bohemian Soft Curls & Feed-In Braids',
    category: 'Braids & Cornrows',
    barber: 'Mika',
    targetAudience: 'Women & Girls (Braids)',
    imageUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800',
    description: 'Lush bohemian feed-in braids accented with cascading soft curls and nourishing scalp oil.'
  },

  // LUSCA: Boys' & men's haircuts, skin fades & razor work
  {
    id: 'gal-lusca-1',
    title: 'Precision Mid Skin Fade & Textured Top',
    category: 'Skin Fades',
    barber: 'Lusca',
    targetAudience: 'Men & Boys (Haircuts)',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
    description: 'Surgical zero-gap skin fade for boys and men. Optical blur transition from bare skin to textured top with crisp hairline razor edge.'
  },
  {
    id: 'gal-lusca-2',
    title: 'Low Drop Fade & Structured Full Beard',
    category: 'Beards & Shaves',
    barber: 'Lusca',
    targetAudience: 'Men & Boys (Haircuts)',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    description: 'Low curved drop fade contouring the ear and neckline, blended seamlessly into a sharply defined beard gradient.'
  },
  {
    id: 'gal-lusca-3',
    title: 'Twisted Locs with High Taper Fade & Beard Lineup',
    category: 'Skin Fades',
    barber: 'Lusca',
    targetAudience: 'Men & Boys (Haircuts)',
    imageUrl: 'https://i.ibb.co/20Ns74Tz/Chat-GPT-Image-6-sept-2026-15-53-44.png',
    description: 'High temple taper fade paired with sharp line work, sculpted beard definition, and hot eucalyptus towel finish.'
  },
  {
    id: 'gal-lusca-4',
    title: 'Executive Razor Cut & Clean Nape',
    category: 'Skin Fades',
    barber: 'Lusca',
    targetAudience: 'Men & Boys (Haircuts)',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    description: 'Classic executive shear work for men and boys with straight razor nape detailing and soothing talc finish.'
  },
  {
    id: 'gal-lusca-5',
    title: 'Taper Fade & Waves for Boys & Men',
    category: 'Skin Fades',
    barber: 'Lusca',
    targetAudience: 'Men & Boys (Haircuts)',
    imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=800',
    description: 'Subtle temple and neck tapers preserving side density with high-definition wave polish.'
  },

  // THE SHOP
  {
    id: 'gal-shop-1',
    title: 'Final Stop Barbershop • Storefront & Lounge',
    category: 'The Shop',
    barber: 'Both',
    targetAudience: 'Shop',
    imageUrl: 'https://i.ibb.co/HTWwwJNz/Chat-GPT-Image-Sep-6-2026-03-11-02-PM-1.png',
    description: 'Our modern grooming lounge located at 5277 El Cajon Blvd, San Diego. Equipped with luxury hydraulic chairs and warm hospitality.'
  }
];

/**
 * Retrieves gallery items from Firestore, falling back to local cache or defaults.
 */
export async function getGalleryItems(): Promise<FirestoreGalleryItem[]> {
  try {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreGalleryItem));
      localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Could not read gallery from Firestore, using cached/defaults:', err);
  }

  // Check local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return DEFAULT_GALLERY_ITEMS;
}

/**
 * Saves a new photo item to Firestore gallery collection.
 */
export async function saveGalleryItem(item: Omit<FirestoreGalleryItem, 'id'>): Promise<string> {
  await ensureFirebaseAuth();
  const payload = {
    ...item,
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'gallery'), payload);
    const savedId = docRef.id;

    // Cache locally
    const current = await getGalleryItems();
    current.unshift({ ...item, id: savedId });
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(current));

    return savedId;
  } catch (err) {
    console.warn('Firestore gallery write notice:', err);
    const fallbackId = 'gal_' + Date.now();
    const current = await getGalleryItems();
    current.unshift({ ...item, id: fallbackId });
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(current));
    return fallbackId;
  }
}

/**
 * Deletes a gallery image by ID from Firestore and local cache.
 */
export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore gallery delete notice:', err);
  }

  // Update local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (cached) {
        const list: FirestoreGalleryItem[] = JSON.parse(cached);
        const updated = list.filter(item => item.id !== id);
        localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(updated));
      }
    } catch {}
  }
}

/**
 * Seed gallery items into Firestore database.
 */
export async function seedFirestoreGallery(): Promise<{ success: boolean; count: number }> {
  try {
    await ensureFirebaseAuth();
    let count = 0;
    for (const item of DEFAULT_GALLERY_ITEMS) {
      await setDoc(doc(db, 'gallery', item.id || `gal_${count}`), {
        ...item,
        createdAt: serverTimestamp()
      }, { merge: true });
      count++;
    }
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(DEFAULT_GALLERY_ITEMS));
    return { success: true, count };
  } catch (err) {
    console.error('Failed to seed gallery:', err);
    return { success: false, count: 0 };
  }
}

/**
 * Uploads a raw image File (from computer or mobile camera/gallery)
 * to Firebase Storage, with seamless Base64 dataURL fallback if Storage rules are pending.
 */
export async function uploadGalleryImageFile(file: File): Promise<string> {
  await ensureFirebaseAuth();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const storageRef = ref(storage, `gallery/${cleanName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (storageErr) {
    console.warn('Firebase Storage upload failed or not enabled yet, compressing to Base64 image payload:', storageErr);
    // Fallback: Read file as Data URL with canvas compression so it saves directly to Firestore
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

// Keys for additional feature caches
export const LOCAL_STORAGE_SERVICES_KEY = 'finalstop_services_cache';
export const LOCAL_STORAGE_PRO_QUOTES_KEY = 'finalstop_pro_quotes_cache';
export const LOCAL_STORAGE_PROMO_POPUP_KEY = 'finalstop_promo_popup_enabled';

/**
 * Retrieves the promo popup enabled status from Firestore or cache.
 * Defaults to true if not set.
 */
export async function getPromoPopupStatus(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'shop_config', 'status'));
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data?.promoPopupEnabled === 'boolean') {
        localStorage.setItem(LOCAL_STORAGE_PROMO_POPUP_KEY, data.promoPopupEnabled ? 'true' : 'false');
        return data.promoPopupEnabled;
      }
    }
  } catch (err) {
    console.warn('Could not read promo popup status from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_PROMO_POPUP_KEY);
    if (cached !== null) return cached === 'true';
  }
  return true; // default enabled
}

/**
 * Updates the promo popup enabled status in Firestore and locally.
 */
export async function setPromoPopupStatus(enabled: boolean): Promise<void> {
  localStorage.setItem(LOCAL_STORAGE_PROMO_POPUP_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('promo-popup-status-changed', { detail: { enabled } }));

  try {
    await ensureFirebaseAuth();
    const configRef = doc(db, 'shop_config', 'status');
    await setDoc(configRef, {
      promoPopupEnabled: enabled,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore promo popup sync notice:', err);
  }
}

/**
 * Retrieves all salon services. Merges any custom price/duration updates from Firestore
 * or returns default OFFICIAL_SERVICES.
 */
export async function getCustomServices(): Promise<ServiceItem[]> {
  try {
    const snap = await getDocs(collection(db, 'services'));
    if (!snap.empty) {
      const firestoreServices: ServiceItem[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as ServiceItem));

      // Merge with default services to ensure no built-in service is lost
      const serviceMap = new Map<string, ServiceItem>();
      OFFICIAL_SERVICES.forEach(s => serviceMap.set(s.id, s));
      firestoreServices.forEach(s => serviceMap.set(s.id, s));

      const merged = Array.from(serviceMap.values());
      localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not read services from Firestore:', err);
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_SERVICES_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return OFFICIAL_SERVICES;
}

/**
 * Saves or updates a service (price, duration, description, etc.) in Firestore.
 */
export async function saveCustomService(service: ServiceItem): Promise<void> {
  await ensureFirebaseAuth();
  const serviceId = service.id || `srv_${Date.now()}`;
  const payload = {
    ...service,
    id: serviceId,
    updatedAt: serverTimestamp()
  };

  try {
    const ref = doc(db, 'services', serviceId);
    await setDoc(ref, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore service save notice:', err);
  }

  // Update local cache
  const current = await getCustomServices();
  const idx = current.findIndex(s => s.id === serviceId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...service };
  } else {
    current.push({ ...service, id: serviceId });
  }
  localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('services-updated', { detail: { services: current } }));
}

/**
 * Fast helper to update just the price and duration of a service.
 */
export async function updateServicePrice(
  id: string, 
  newPrice: string, 
  newNumericPrice?: number, 
  newDuration?: string,
  newDescription?: string
): Promise<void> {
  const current = await getCustomServices();
  const target = current.find(s => s.id === id);
  if (!target) return;

  const updated: ServiceItem = {
    ...target,
    price: newPrice,
    numericPrice: newNumericPrice !== undefined ? newNumericPrice : parseInt(newPrice.replace(/[^0-9]/g, '')) || target.numericPrice,
    ...(newDuration ? { duration: newDuration } : {}),
    ...(newDescription ? { description: newDescription } : {})
  };

  await saveCustomService(updated);
}

/**
 * Deletes a custom service from Firestore.
 */
export async function deleteCustomService(id: string): Promise<void> {
  try {
    await ensureFirebaseAuth();
    await deleteDoc(doc(db, 'services', id));
  } catch (err) {
    console.warn('Could not delete service from Firestore:', err);
  }

  const current = await getCustomServices();
  const filtered = current.filter(s => s.id !== id);
  localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('services-updated', { detail: { services: filtered } }));
}

/**
 * Resets all services back to shop official defaults.
 */
export async function resetServicesToDefault(): Promise<ServiceItem[]> {
  localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(OFFICIAL_SERVICES));
  window.dispatchEvent(new CustomEvent('services-updated', { detail: { services: OFFICIAL_SERVICES } }));
  return OFFICIAL_SERVICES;
}

/**
 * Retrieves all "Devis Pro" / Corporate & Event quote requests from Firestore.
 */
export async function getProQuotes(): Promise<ProQuoteRequest[]> {
  try {
    const q = query(collection(db, 'pro_quotes'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProQuoteRequest));
      localStorage.setItem(LOCAL_STORAGE_PRO_QUOTES_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Could not fetch pro quotes from Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_PRO_QUOTES_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  return [
    {
      id: 'pro-sample-1',
      ticketId: 'PRO-201',
      clientName: 'Thomas Beaumont',
      companyName: 'Studio Production San Diego',
      phone: '(619) 555-8392',
      email: 'thomas@studiosd.com',
      serviceType: 'Tournage / VIP Backstage',
      headcount: 6,
      eventDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      location: 'Studio Downtown SD',
      estimatedBudget: '$600 - $900',
      notes: 'Grooming & coiffure pour 6 acteurs avant tournage pub',
      status: 'new',
      createdAt: null
    },
    {
      id: 'pro-sample-2',
      ticketId: 'PRO-202',
      clientName: 'David K.',
      companyName: 'Mariage K. & M.',
      phone: '(619) 555-4019',
      email: 'david.k@gmail.com',
      serviceType: 'Mariage / Groomsmen',
      headcount: 5,
      eventDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      location: 'Final Stop Lounge (Privatisé)',
      estimatedBudget: '$450+',
      notes: 'Matinée complète pour marié et 4 témoins : coupes, barbes et serviettes chaudes',
      status: 'contacted',
      createdAt: null
    }
  ];
}

/**
 * Saves a new Pro Quote request to Firestore.
 */
export async function saveProQuote(data: Omit<ProQuoteRequest, 'id'>): Promise<string> {
  await ensureFirebaseAuth();
  const payload = {
    ...data,
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'pro_quotes'), payload);
    const savedId = docRef.id;

    const current = await getProQuotes();
    current.unshift({ ...data, id: savedId });
    localStorage.setItem(LOCAL_STORAGE_PRO_QUOTES_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('pro-quotes-updated', { detail: { quotes: current } }));

    return savedId;
  } catch (err) {
    console.warn('Firestore pro quote write error:', err);
    const fallbackId = 'pro_' + Date.now();
    const current = await getProQuotes();
    current.unshift({ ...data, id: fallbackId });
    localStorage.setItem(LOCAL_STORAGE_PRO_QUOTES_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('pro-quotes-updated', { detail: { quotes: current } }));
    return fallbackId;
  }
}

/**
 * Updates the status of a Pro Quote (new, contacted, quoted, approved, declined).
 */
export async function updateProQuoteStatus(docId: string, status: ProQuoteRequest['status']): Promise<void> {
  try {
    const ref = doc(db, 'pro_quotes', docId);
    await updateDoc(ref, { 
      status,
      updatedAt: serverTimestamp() 
    });
  } catch (err) {
    console.warn('Could not update pro quote in Firestore:', err);
  }

  const current = await getProQuotes();
  const idx = current.findIndex(q => q.id === docId || q.ticketId === docId);
  if (idx !== -1) {
    current[idx].status = status;
    localStorage.setItem(LOCAL_STORAGE_PRO_QUOTES_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('pro-quotes-updated', { detail: { quotes: current } }));
  }
}

/**
 * Deletes a Pro Quote request from Firestore.
 */
export async function deleteProQuote(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pro_quotes', docId));
  } catch (err) {
    console.warn('Could not delete pro quote:', err);
  }

  const current = await getProQuotes();
  const filtered = current.filter(q => q.id !== docId && q.ticketId !== docId);
  localStorage.setItem(LOCAL_STORAGE_PRO_QUOTES_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('pro-quotes-updated', { detail: { quotes: filtered } }));
}



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
  limit 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

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
  status: 'waiting' | 'in-chair' | 'served' | 'cancelled';
  joinedAt: string;
  createdAt?: any;
}

export interface ShopConfig {
  waitlistOpen: boolean;
  announcement?: string;
  phone1: string;
  phone2: string;
  address: string;
  hoursWeekday: string;
  hoursSunday: string;
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
  const payload = {
    ...entry,
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'waitlist'), payload);
    const savedId = docRef.id;

    const current = getLocalWaitlist();
    current.push({ ...entry, id: savedId });
    localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(current));

    return savedId;
  } catch (err) {
    console.warn('Firestore waitlist write error:', err);
    const fallbackId = 'wl_' + Date.now();
    const current = getLocalWaitlist();
    current.push({ ...entry, id: fallbackId });
    localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(current));
    return fallbackId;
  }
}

/**
 * Retrieves the current waitlist queue.
 */
export async function getWaitlistQueue(): Promise<FirestoreWaitlistEntry[]> {
  try {
    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'asc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as FirestoreWaitlistEntry))
        .filter(item => item.status === 'waiting' || item.status === 'in-chair');
      localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Error fetching waitlist from Firestore:', err);
  }
  return getLocalWaitlist();
}

/**
 * Updates a waitlist entry status (e.g. served, cancelled, in-chair).
 */
export async function updateWaitlistStatus(docId: string, status: FirestoreWaitlistEntry['status']): Promise<void> {
  try {
    const ref = doc(db, 'waitlist', docId);
    await updateDoc(ref, { status });
  } catch (err) {
    console.warn('Could not update Firestore waitlist entry directly:', err);
  }

  // Update local
  const current = getLocalWaitlist();
  const idx = current.findIndex(w => w.id === docId);
  if (idx !== -1) {
    current[idx].status = status;
    localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(current));
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
      experience: '20+ Years Master Craft',
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
      experience: '20+ Years Master Craft',
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


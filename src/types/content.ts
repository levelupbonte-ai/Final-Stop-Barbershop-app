// UI-facing content types. Values come from the LevelUp database (Supabase);
// see src/lib/site/api.ts for how database rows are validated and mapped.

export interface ServiceItem {
  id: string; // service slug, stable public identifier
  name: string;
  duration: string;
  price: string;
  numericPrice: number;
  category: string;
  badge?: string;
  description: string;
  inclusions: string[];
  featured?: boolean;
  barberPreference?: string;
  title?: string;
  durationMinutes?: number;
}

export interface BarberProfile {
  id: string; // team member slug
  name: string;
  role: string;
  phone: string;
  phoneRaw: string;
  experience: string;
  experienceYears: number;
  initials: string;
  badge: string;
  tagline: string;
  bio: string;
  specialty: string;
  tags: string[];
  signatureTechniques: { title: string; description: string }[];
  portfolioCuts: { title: string; tag: string; image: string; description: string }[];
  highlights: string[];
  galleryLabel?: string;
  clientReviews: { author: string; date: string; rating: number; comment: string }[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  barber: string; // team member name, or 'Both' for shop-wide pictures
  targetAudience: string;
  imageUrl: string;
  description: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  text: string;
  role: string;
  barber: string;
  date: string;
  price: string;
  service: string;
  isLocalGuide: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PhoneLine {
  label: string;
  display: string;
  tel: string;
  teamMember?: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  domain: string | null;
  showPoweredBy: boolean;
  features: string[];
  contact: {
    phones: PhoneLine[];
    emails: string[];
    address: string;
    mapsUrl: string;
    coordinates: { lat: number; lng: number } | null;
  };
  hours: { summary: string[] };
  social: Record<string, string>;
  booking: { timeSlots: string[]; cancellationPolicy: string };
  waitlist: { open: boolean; minutesPerClient: number };
  promoPopup: { enabled: boolean; delaySeconds: number; code: string; discountLabel: string };
  branding: {
    logoUrl: string | null;
    logoAlt: string;
    shortName: string;
    tagline: string;
    description: string;
  };
}

export interface GalleryBanner {
  imageUrl: string;
  alt: string;
  eyebrow: string;
  heading: string;
  title: string;
  category: string;
  credit: string;
  description: string;
}

export interface HeroContent {
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface BookingConfirmation {
  ticketCode: string;
  serviceName: string;
  priceLabel: string | null;
  teamMemberName: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

export interface WaitlistTicket {
  ticketCode: string;
  position: number;
  estMinutes: number;
  status: string;
}

export interface PublicQueueEntry {
  position: number;
  displayName: string;
  teamMemberName: string | null;
  serviceName: string | null;
  status: string;
  estMinutes: number;
}

export interface TicketStatus {
  type: string;
  ticketCode: string;
  status: string;
  firstName: string;
  serviceName?: string | null;
  teamMemberName?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  position?: number | null;
  estMinutes?: number | null;
}

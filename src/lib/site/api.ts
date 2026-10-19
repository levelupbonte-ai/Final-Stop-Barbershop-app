// Service layer between the UI and the LevelUp database.
// - Reads published content of this website (RLS limits anon to published rows).
// - Writes go exclusively through validated server-side RPCs.
// - Every response is validated at runtime before it reaches components.
import { z } from 'zod';
import { supabase, WEBSITE_ID, isSupabaseConfigured } from '../supabase';
import {
  bookingSchema,
  check,
  formSchema,
  normalizeTicketCode,
  safeUrl,
  telDigits,
  waitlistSchema
} from './validation';
import type {
  BarberProfile,
  BookingConfirmation,
  FaqItem,
  GalleryBanner,
  GalleryItem,
  HeroContent,
  PublicQueueEntry,
  ReviewItem,
  ServiceItem,
  SiteConfig,
  TicketStatus,
  WaitlistTicket
} from '../../types/content';

export type SiteErrorCode =
  | 'NOT_CONFIGURED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'VALIDATION'
  | 'NETWORK'
  | 'UNKNOWN';

export class SiteApiError extends Error {
  code: SiteErrorCode;

  constructor(code: SiteErrorCode, message: string) {
    super(message);
    this.name = 'SiteApiError';
    this.code = code;
  }
}

const FRIENDLY: Record<SiteErrorCode, string> = {
  NOT_CONFIGURED: 'This website is not configured yet.',
  NOT_FOUND: 'We could not find this website.',
  FORBIDDEN: 'This option is not available right now.',
  CONFLICT: 'This time slot was just taken. Please pick another one.',
  RATE_LIMITED: 'Too many requests. Please try again in a little while.',
  VALIDATION: 'Please check the information you entered.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNKNOWN: 'Something went wrong. Please try again.'
};

// Maps PostgREST / RPC errors to stable codes. Messages raised by our RPCs on
// validation (22023) are written for end users and safe to display.
function toSiteError(error: { code?: string; message?: string } | null | undefined): SiteApiError {
  const code = error?.code ?? '';
  const raw = error?.message ?? '';
  // Our RPCs raise short end-user sentences; anything longer or technical
  // falls back to the generic message.
  const message = raw.length <= 120 && /^[\w\s.,'’!?-]+$/.test(raw) ? raw : '';
  if (code === 'PT404') return new SiteApiError('NOT_FOUND', FRIENDLY.NOT_FOUND);
  if (code === 'PT403') return new SiteApiError('FORBIDDEN', message || FRIENDLY.FORBIDDEN);
  if (code === 'PT409') return new SiteApiError('CONFLICT', FRIENDLY.CONFLICT);
  if (code === 'PT429') return new SiteApiError('RATE_LIMITED', FRIENDLY.RATE_LIMITED);
  if (code === '22023') return new SiteApiError('VALIDATION', message || FRIENDLY.VALIDATION);
  if (/fetch|network/i.test(raw)) return new SiteApiError('NETWORK', FRIENDLY.NETWORK);
  return new SiteApiError('UNKNOWN', FRIENDLY.UNKNOWN);
}

export function errorMessage(err: unknown): string {
  return err instanceof SiteApiError ? err.message : FRIENDLY.UNKNOWN;
}

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new SiteApiError('NOT_CONFIGURED', FRIENDLY.NOT_CONFIGURED);
  }
}

function parse<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(`[site] invalid ${what} payload`, result.error.issues);
    throw new SiteApiError('UNKNOWN', FRIENDLY.UNKNOWN);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Schemas (database row shapes)
// ---------------------------------------------------------------------------

const str = z.string();
const optStr = z.string().nullable().optional();
const jsonObject = z.record(z.string(), z.unknown());

const websiteSchema = z.object({
  id: str,
  name: str,
  primary_domain: optStr,
  show_powered_by: z.boolean().optional().default(true),
  features: z.array(str).default([]),
  settings: jsonObject.default({})
});

const serviceRow = z.object({
  slug: str,
  name: str,
  category: optStr,
  description: optStr,
  price_cents: z.number().nullable(),
  price_label: optStr,
  duration_minutes: z.number().nullable(),
  duration_label: optStr,
  badge: optStr,
  featured: z.boolean(),
  inclusions: z.array(str).nullable(),
  data: jsonObject.nullable(),
  team_members: z.object({ name: str }).nullable().optional()
});

const teamRow = z.object({
  id: str,
  slug: str,
  name: str,
  role: optStr,
  bio: optStr,
  phone: optStr,
  tags: z.array(str).nullable(),
  data: jsonObject.nullable()
});

const galleryRow = z.object({
  id: str,
  title: str,
  description: optStr,
  category: optStr,
  audience: optStr,
  image_url: str,
  team_members: z.object({ name: str }).nullable().optional()
});

const reviewRow = z.object({
  id: str,
  author: str,
  rating: z.number().nullable(),
  comment: str,
  team_member_id: optStr,
  data: jsonObject.nullable()
});

const faqRow = z.object({ id: str, question: str, answer: str });

const contentBlockRow = z.object({ block_key: str, data: jsonObject });

const techniqueSchema = z.array(z.object({ title: str, description: str })).catch([]);
const portfolioSchema = z
  .array(z.object({ title: str, tag: str, image: str, description: str }))
  .catch([]);
const stringArray = z.array(str).catch([]);

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const asNumber = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const asBool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);

function settingObject(settings: Record<string, unknown>, key: string): Record<string, unknown> {
  const v = settings[key];
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function toSiteConfig(raw: z.infer<typeof websiteSchema>): SiteConfig {
  const s = raw.settings;
  const contact = settingObject(s, 'contact');
  const phones = Array.isArray(contact.phones) ? contact.phones : [];
  const coords = settingObject(contact, 'coordinates');
  const hours = settingObject(s, 'hours');
  const booking = settingObject(s, 'booking');
  const waitlist = settingObject(s, 'waitlist');
  const promo = settingObject(s, 'promo_popup');
  const branding = settingObject(s, 'branding');
  const social = settingObject(s, 'social');

  return {
    id: raw.id,
    name: raw.name,
    domain: raw.primary_domain ?? null,
    showPoweredBy: raw.show_powered_by,
    features: raw.features,
    contact: {
      phones: phones
        .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
        .map((p) => ({
          label: asString(p.label),
          display: asString(p.display),
          tel: telDigits(asString(p.tel)),
          teamMember: typeof p.team_member === 'string' ? p.team_member : undefined
        }))
        .filter((p) => p.display && p.tel),
      emails: stringArray.parse(contact.emails ?? []).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)),
      address: asString(contact.address),
      mapsUrl: safeUrl(contact.maps_url) ?? '',
      coordinates:
        typeof coords.lat === 'number' && typeof coords.lng === 'number'
          ? { lat: coords.lat, lng: coords.lng }
          : null
    },
    hours: { summary: stringArray.parse(hours.summary ?? []) },
    social: Object.fromEntries(
      Object.entries(social).filter(([, v]) => safeUrl(v) !== null)
    ) as Record<string, string>,
    booking: {
      timeSlots: stringArray.parse(booking.time_slots ?? []).filter((t) => /^\d{2}:\d{2}$/.test(t)),
      cancellationPolicy: asString(booking.cancellation_policy)
    },
    waitlist: {
      open: asBool(waitlist.open),
      minutesPerClient: asNumber(waitlist.minutes_per_client, 30)
    },
    promoPopup: {
      enabled: asBool(promo.enabled),
      delaySeconds: asNumber(promo.delay_seconds, 5),
      code: asString(promo.code),
      discountLabel: asString(promo.discount_label, 'a discount')
    },
    branding: {
      logoUrl: safeUrl(branding.logo_url, { allowPath: true }),
      logoAlt: asString(branding.logo_alt, raw.name),
      shortName: asString(branding.short_name, raw.name),
      tagline: asString(branding.tagline),
      description: asString(branding.description)
    }
  };
}

function toServiceItem(row: z.infer<typeof serviceRow>): ServiceItem {
  const data = row.data ?? {};
  return {
    id: row.slug,
    name: row.name,
    category: row.category ?? 'Other',
    description: row.description ?? '',
    price: row.price_label ?? (row.price_cents != null ? `$${(row.price_cents / 100).toFixed(0)}` : ''),
    numericPrice: row.price_cents != null ? row.price_cents / 100 : 0,
    duration: row.duration_label ?? (row.duration_minutes ? `${row.duration_minutes} min` : ''),
    durationMinutes: row.duration_minutes ?? undefined,
    badge: row.badge ?? undefined,
    featured: row.featured,
    inclusions: row.inclusions ?? [],
    title: typeof data.title === 'string' ? data.title : undefined,
    barberPreference: row.team_members?.name ?? undefined
  };
}

function toBarberProfile(row: z.infer<typeof teamRow>, reviews: ReviewItem[]): BarberProfile {
  const d = row.data ?? {};
  const phoneRaw = telDigits(asString(d.phone_raw) || (row.phone ?? ''));
  return {
    id: row.slug,
    name: row.name,
    role: row.role ?? '',
    bio: row.bio ?? '',
    phone: row.phone ?? '',
    phoneRaw,
    tags: row.tags ?? [],
    experience: asString(d.experience),
    experienceYears: asNumber(d.experience_years),
    initials: asString(d.initials, row.name.slice(0, 2).toUpperCase()),
    badge: asString(d.badge),
    tagline: asString(d.tagline),
    specialty: asString(d.specialty),
    signatureTechniques: techniqueSchema.parse(d.signature_techniques ?? []),
    portfolioCuts: portfolioSchema
      .parse(d.portfolio ?? [])
      .flatMap((c) => {
        const image = safeUrl(c.image, { allowPath: true });
        return image ? [{ ...c, image }] : [];
      }),
    highlights: stringArray.parse(d.highlights ?? []),
    galleryLabel: typeof d.gallery_label === 'string' ? d.gallery_label : undefined,
    clientReviews: reviews.map((r) => ({ author: r.author, date: r.date, rating: r.rating, comment: r.text }))
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export interface SiteContent {
  site: SiteConfig;
  services: ServiceItem[];
  barbers: BarberProfile[];
  gallery: GalleryItem[];
  reviews: ReviewItem[];
  faqs: FaqItem[];
  hero: HeroContent | null;
  galleryBanner: GalleryBanner | null;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  assertConfigured();

  const [siteRes, servicesRes, teamRes, galleryRes, reviewsRes, faqRes, blocksRes] = await Promise.all([
    supabase.rpc('get_public_website', { p_website_id: WEBSITE_ID }),
    supabase
      .from('services')
      .select('slug, name, category, description, price_cents, price_label, duration_minutes, duration_label, badge, featured, inclusions, data, team_members(name)')
      .eq('website_id', WEBSITE_ID)
      .order('sort_order'),
    supabase
      .from('team_members')
      .select('id, slug, name, role, bio, phone, tags, data')
      .eq('website_id', WEBSITE_ID)
      .order('sort_order'),
    supabase
      .from('gallery_items')
      .select('id, title, description, category, audience, image_url, team_members(name)')
      .eq('website_id', WEBSITE_ID)
      .order('sort_order'),
    supabase
      .from('reviews')
      .select('id, author, rating, comment, team_member_id, data')
      .eq('website_id', WEBSITE_ID)
      .order('sort_order'),
    supabase.from('faq_items').select('id, question, answer').eq('website_id', WEBSITE_ID).order('sort_order'),
    supabase.from('content_blocks').select('block_key, data').eq('website_id', WEBSITE_ID).eq('page', 'home')
  ]);

  for (const res of [siteRes, servicesRes, teamRes, galleryRes, reviewsRes, faqRes, blocksRes]) {
    if (res.error) throw toSiteError(res.error);
  }
  if (siteRes.data == null) throw new SiteApiError('NOT_FOUND', FRIENDLY.NOT_FOUND);

  const site = toSiteConfig(parse(websiteSchema, siteRes.data, 'website'));
  const teamRows = parse(z.array(teamRow), teamRes.data, 'team');
  const reviewRows = parse(z.array(reviewRow), reviewsRes.data, 'reviews');
  const memberName = new Map(teamRows.map((t) => [t.id, t.name]));

  const reviewsWithMember = reviewRows.map((r) => {
    const d = r.data ?? {};
    const item: ReviewItem = {
      id: r.id,
      author: r.author,
      rating: r.rating ?? 5,
      text: r.comment,
      role: asString(d.role),
      barber: asString(d.barber_label, r.team_member_id ? memberName.get(r.team_member_id) ?? '' : ''),
      date: asString(d.date_label),
      price: asString(d.price),
      service: asString(d.service),
      isLocalGuide: asBool(d.is_local_guide)
    };
    return { memberId: r.team_member_id ?? null, item };
  });

  const blocks = parse(z.array(contentBlockRow), blocksRes.data, 'content blocks');
  const heroData = blocks.find((b) => b.block_key === 'hero')?.data;
  const bannerData = blocks.find((b) => b.block_key === 'gallery_banner')?.data;

  return {
    site,
    services: parse(z.array(serviceRow), servicesRes.data, 'services').map(toServiceItem),
    barbers: teamRows.map((t) =>
      toBarberProfile(
        t,
        reviewsWithMember.filter((r) => r.memberId === t.id).map((r) => r.item)
      )
    ),
    gallery: parse(z.array(galleryRow), galleryRes.data, 'gallery').flatMap((g) => {
      const imageUrl = safeUrl(g.image_url, { allowPath: true });
      if (!imageUrl) return [];
      return [
        {
          id: g.id,
          title: g.title,
          description: g.description ?? '',
          category: g.category ?? '',
          targetAudience: g.audience ?? '',
          imageUrl,
          barber: g.team_members?.name ?? 'Both'
        }
      ];
    }),
    reviews: reviewsWithMember.filter((r) => r.memberId === null).map((r) => r.item),
    faqs: parse(z.array(faqRow), faqRes.data, 'faq'),
    hero: heroData
      ? {
          titleLine1: asString(heroData.title_line_1),
          titleLine2: asString(heroData.title_line_2),
          description: asString(heroData.description),
          primaryCta: asString(heroData.primary_cta, 'Book Appointment'),
          secondaryCta: asString(heroData.secondary_cta, 'Explore Our Work')
        }
      : null,
    galleryBanner:
      bannerData && safeUrl(bannerData.image_url, { allowPath: true })
        ? {
            imageUrl: safeUrl(bannerData.image_url, { allowPath: true }) as string,
            alt: asString(bannerData.alt),
            eyebrow: asString(bannerData.eyebrow),
            heading: asString(bannerData.heading),
            title: asString(bannerData.title),
            category: asString(bannerData.category),
            credit: asString(bannerData.credit),
            description: asString(bannerData.description)
          }
        : null
  };
}

export async function fetchPublicWaitlist(): Promise<PublicQueueEntry[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_public_waitlist', { p_website_id: WEBSITE_ID });
  if (error) throw toSiteError(error);
  const rows = parse(
    z.array(
      z.object({
        position: z.number(),
        display_name: str,
        team_member_name: optStr,
        service_name: optStr,
        status: str,
        est_minutes: z.number()
      })
    ),
    data ?? [],
    'waitlist'
  );
  return rows.map((r) => ({
    position: r.position,
    displayName: r.display_name,
    teamMemberName: r.team_member_name ?? null,
    serviceName: r.service_name ?? null,
    status: r.status,
    estMinutes: r.est_minutes
  }));
}

export async function fetchTicketStatus(ticketCode: string): Promise<TicketStatus | null> {
  assertConfigured();
  const code = normalizeTicketCode(ticketCode);
  if (!code) throw new SiteApiError('VALIDATION', 'Please enter your ticket number, e.g. FS-7KQ2M9XA.');
  const { data, error } = await supabase.rpc('get_ticket_status', {
    p_website_id: WEBSITE_ID,
    p_ticket_code: code
  });
  if (error) throw toSiteError(error);
  if (data == null) return null;
  const r = parse(
    z.object({
      type: str,
      ticket_code: str,
      status: str,
      first_name: z.string().default(''),
      service_name: optStr,
      team_member_name: optStr,
      appointment_date: optStr,
      appointment_time: optStr,
      position: z.number().nullable().optional(),
      est_minutes: z.number().nullable().optional()
    }),
    data,
    'ticket'
  );
  return {
    type: r.type,
    ticketCode: r.ticket_code,
    status: r.status,
    firstName: r.first_name,
    serviceName: r.service_name,
    teamMemberName: r.team_member_name,
    appointmentDate: r.appointment_date,
    appointmentTime: r.appointment_time,
    position: r.position,
    estMinutes: r.est_minutes
  };
}

// ---------------------------------------------------------------------------
// Writes (validated server-side RPCs)
// ---------------------------------------------------------------------------

// Every write is validated (and cleaned) on the client first: nothing
// unvalidated is sent. See ./validation.ts; the RPCs validate again.
function validated<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const result = check(schema, input);
  if (!result.ok) throw new SiteApiError('VALIDATION', result.message);
  return result.data;
}

export async function bookAppointment(input: {
  serviceSlug: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  teamMemberSlug?: string | null;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}): Promise<BookingConfirmation> {
  assertConfigured();
  const v = validated(bookingSchema, input);
  const { data, error } = await supabase.rpc('book_appointment', {
    p_website_id: WEBSITE_ID,
    p_service_slug: v.serviceSlug,
    p_date: v.date,
    p_time: v.time,
    p_name: v.name,
    p_email: v.email,
    p_phone: v.phone,
    p_team_member_slug: v.teamMemberSlug,
    p_notes: v.notes
  });
  if (error) throw toSiteError(error);
  const r = parse(
    z.object({
      ticket_code: str,
      service_name: str,
      price_label: optStr,
      team_member_name: optStr,
      appointment_date: str,
      appointment_time: str,
      status: str
    }),
    data,
    'booking'
  );
  void requestConfirmationEmail('appointment', r.ticket_code);
  return {
    ticketCode: r.ticket_code,
    serviceName: r.service_name,
    priceLabel: r.price_label ?? null,
    teamMemberName: r.team_member_name ?? null,
    appointmentDate: r.appointment_date,
    appointmentTime: r.appointment_time.slice(0, 5),
    status: r.status
  };
}

export async function joinWaitlist(input: {
  name: string;
  phone?: string;
  email?: string;
  serviceSlug?: string | null;
  teamMemberSlug?: string | null;
}): Promise<WaitlistTicket> {
  assertConfigured();
  const v = validated(waitlistSchema, input);
  const { data, error } = await supabase.rpc('join_waitlist', {
    p_website_id: WEBSITE_ID,
    p_name: v.name,
    p_phone: v.phone,
    p_email: v.email,
    p_service_slug: v.serviceSlug,
    p_team_member_slug: v.teamMemberSlug
  });
  if (error) throw toSiteError(error);
  const r = parse(
    z.object({ ticket_code: str, position: z.number(), est_minutes: z.number(), status: str }),
    data,
    'waitlist ticket'
  );
  void requestConfirmationEmail('waitlist', r.ticket_code);
  return { ticketCode: r.ticket_code, position: r.position, estMinutes: r.est_minutes, status: r.status };
}

export type FormType = 'contact' | 'quote' | 'vip_signup' | 'newsletter';

export async function submitForm(input: {
  formType: FormType;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  data?: Record<string, string | number | boolean | null>;
}): Promise<{ ticketCode: string }> {
  assertConfigured();
  const v = validated(formSchema, input);
  const { data, error } = await supabase.rpc('submit_form', {
    p_website_id: WEBSITE_ID,
    p_form_type: v.formType,
    p_name: v.name,
    p_email: v.email,
    p_phone: v.phone,
    p_company: v.company,
    p_message: v.message,
    p_data: v.data,
    p_source: 'website'
  });
  if (error) throw toSiteError(error);
  const r = parse(z.object({ ticket_code: str }), data, 'form');
  void requestConfirmationEmail('form', r.ticket_code);
  return { ticketCode: r.ticket_code };
}

// Asks the site's server to email a confirmation for a ticket that already
// exists in the database. The server looks the record up itself, sends at most
// one email per ticket, and only to the address stored with it.
async function requestConfirmationEmail(kind: 'appointment' | 'waitlist' | 'form', ticketCode: string) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, ticketCode })
    });
  } catch {
    // Email is best effort; the booking itself is already saved.
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

// Validation of everything a visitor types, before it is sent anywhere.
//
// Every write in api.ts goes through these schemas: text is cleaned (Unicode
// normalised, invisible and control characters removed, whitespace trimmed),
// lengths are capped, formats are strict (email, phone, dates, ids, choices)
// and unknown fields are refused. The database checks again on its side.
// Messages are short and calm: they tell the visitor what to fix.
import { z } from 'zod';

// No runtime code generation: keeps zod compatible with the site's
// Content-Security-Policy (script-src 'self', no 'unsafe-eval').
z.config({ jitless: true });

export const LIMITS = {
  name: 80,
  email: 254,
  phone: 20,
  notes: 500,
  message: 2000,
  company: 120,
  shortText: 120,
  ticket: 17
} as const;

/** How far ahead an appointment can be booked online. */
export const BOOKING_WINDOW_DAYS = 90;
/** How far ahead an event quote date can be. */
export const QUOTE_WINDOW_DAYS = 730;

export const QUOTE_SERVICE_TYPES = [
  'Wedding & Groomsmen',
  'Corporate Grooming Day',
  'Full Lounge Buyout',
  'Video Shoot / Backstage',
  'Custom Event'
] as const;

export const FORM_TYPES = ['contact', 'quote', 'vip_signup', 'newsletter'] as const;

export const TICKET_RE = /^[A-Z0-9]{1,8}-[A-Z0-9]{8}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
// Letters (any language), spaces, apostrophes, hyphens, dots.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .’-]*$/u;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// Markup or script-looking content in free text: "<tag", "</", "javascript:", "data:text/html".
const MARKUP_RE = /<\s*\/?\s*[a-z!?]|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html/i;

// C0/C1 controls, soft hyphen, zero-width, line/paragraph separators,
// bidirectional overrides and the byte-order mark.
const INVISIBLE_RANGES: [number, number][] = [
  [0x00, 0x1f],
  [0x7f, 0x9f],
  [0xad, 0xad],
  [0x200b, 0x200f],
  [0x2028, 0x202e],
  [0x2060, 0x2064],
  [0x2066, 0x206f],
  [0xfeff, 0xfeff]
];
const hex = (c: number) => '\\u' + c.toString(16).padStart(4, '0');
const INVISIBLE_RE = new RegExp(
  `[${INVISIBLE_RANGES.map(([a, b]) => (a === b ? hex(a) : `${hex(a)}-${hex(b)}`)).join('')}]`,
  'g'
);

/**
 * Cleans typed text: NFC normalisation, invisible/control characters removed,
 * whitespace collapsed and trimmed. With `multiline`, line breaks are kept
 * (at most one empty line in a row).
 */
export function cleanText(value: unknown, options: { multiline?: boolean } = {}): string {
  if (typeof value !== 'string') return '';
  let s = value.normalize('NFC').replace(/\r\n?/g, '\n');
  if (options.multiline) {
    s = s
      .split('\n')
      .map((line) => line.replace(INVISIBLE_RE, (c) => (c === '\t' ? ' ' : '')).replace(/[  ]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  } else {
    s = s.replace(/[\n\t]/g, ' ').replace(INVISIBLE_RE, '').replace(/[  ]+/g, ' ');
  }
  return s.trim();
}

/** Phone number to E.164 (+15551234567). US/Canada numbers may omit +1. Null if invalid. */
export function normalizePhone(value: unknown): string | null {
  const s = cleanText(value);
  if (!s || s.length > 30 || !/^[+\d(][\d\s().-]*$/.test(s)) return null;
  let digits = s.replace(/[\s().-]/g, '');
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  if (!digits.startsWith('+')) {
    if (/^\d{10}$/.test(digits)) digits = `+1${digits}`;
    else if (/^1\d{10}$/.test(digits)) digits = `+${digits}`;
    else return null;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(digits)) return null;
  // North American numbers: area code and exchange cannot start with 0 or 1.
  if (digits.startsWith('+1') && !/^\+1[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  return digits;
}

export function normalizeTicketCode(value: unknown): string | null {
  const s = cleanText(value).toUpperCase();
  return s.length <= LIMITS.ticket && TICKET_RE.test(s) ? s : null;
}

function localIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** yyyy-MM-dd that exists on the calendar and lies within [today, today + days]. */
export function isDateInWindow(value: unknown, days: number, now: Date = new Date()): boolean {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(today);
  last.setDate(last.getDate() + days);
  return value >= localIsoDate(today) && value <= localIsoDate(last);
}

// ---------------------------------------------------------------------------
// Field schemas
// ---------------------------------------------------------------------------

// `.optional()` lets an absent field reach the transform (zod 4), where it becomes ''.
const text = (opts: { multiline?: boolean } = {}) =>
  z
    .unknown()
    .optional()
    .transform((v, ctx) => {
      if (v !== undefined && v !== null && typeof v !== 'string') {
        ctx.addIssue({ code: 'custom', message: 'Please check the information you entered.' });
        return z.NEVER;
      }
      return cleanText(v, opts);
    });

const nameField = text()
  .pipe(
    z
      .string()
      .min(1, 'Please enter your name.')
      .max(LIMITS.name, `Please keep your name under ${LIMITS.name} characters.`)
      .regex(NAME_RE, 'Please use letters only for your name.')
  );

const optionalEmail = text().pipe(
  z
    .string()
    .max(LIMITS.email, 'This email address is too long.')
    .refine((v) => v === '' || (EMAIL_RE.test(v) && !v.includes('..')), 'Please enter a valid email address.')
    .transform((v) => (v ? v.toLowerCase() : null))
);

const optionalPhone = text().pipe(
  z
    .string()
    .max(30, 'Please enter a valid phone number, e.g. (619) 555-0199.')
    .transform((v, ctx) => {
      if (!v) return null;
      const phone = normalizePhone(v);
      if (!phone) {
        ctx.addIssue({ code: 'custom', message: 'Please enter a valid phone number, e.g. (619) 555-0199.' });
        return z.NEVER;
      }
      return phone;
    })
);

const freeText = (max: number, multiline = true) =>
  text({ multiline }).pipe(
    z
      .string()
      .max(max, `Please keep this under ${max} characters.`)
      .refine((v) => !MARKUP_RE.test(v), 'Please remove code or tags such as < > from your message.')
      .transform((v) => v || null)
  );

const slug = (message: string) =>
  z
    .unknown()
    .optional()
    .transform((v, ctx) => {
    if (v === undefined || v === null || v === '') return null;
    if (typeof v !== 'string' || !SLUG_RE.test(v)) {
      ctx.addIssue({ code: 'custom', message });
      return z.NEVER;
    }
    return v;
  });

const requireContact = (v: { email?: string | null; phone?: string | null }) => Boolean(v.email || v.phone);
const contactMessage = { message: 'Please provide an email or a phone number.', path: ['email'] };

// ---------------------------------------------------------------------------
// Request schemas (one per write). `.strict()` refuses unknown fields.
// ---------------------------------------------------------------------------

export const bookingSchema = z
  .object({
    serviceSlug: slug('Please choose a service.').refine((v) => v !== null, 'Please choose a service.'),
    date: z
      .string()
      .refine((v) => isDateInWindow(v, BOOKING_WINDOW_DAYS), `Please choose a date within the next ${BOOKING_WINDOW_DAYS} days.`),
    time: z.string().regex(TIME_RE, 'Please choose a time slot.'),
    teamMemberSlug: slug('Please choose a barber from the list.'),
    name: nameField,
    email: optionalEmail,
    phone: optionalPhone,
    notes: freeText(LIMITS.notes)
  })
  .strict()
  .refine(requireContact, contactMessage);

export const waitlistSchema = z
  .object({
    name: nameField,
    phone: optionalPhone,
    email: optionalEmail,
    serviceSlug: slug('Please choose a service from the list.'),
    teamMemberSlug: slug('Please choose a barber from the list.')
  })
  .strict()
  .refine(requireContact, contactMessage);

const formDataValue = z.union([
  z
    .string()
    .transform((v) => cleanText(v))
    .pipe(
    z
      .string()
      .max(LIMITS.shortText, `Please keep each answer under ${LIMITS.shortText} characters.`)
      .refine((v) => !MARKUP_RE.test(v), 'Please remove code or tags such as < > from your answers.')
  ),
  z.number().finite(),
  z.boolean(),
  z.null()
]);

export const formSchema = z
  .object({
    formType: z.enum(FORM_TYPES, { message: 'This form is not available.' }),
    name: nameField,
    email: optionalEmail,
    phone: optionalPhone,
    company: freeText(LIMITS.company, false),
    message: freeText(LIMITS.message),
    data: z
      .record(z.string().regex(/^[a-z][a-z0-9_]{0,39}$/), formDataValue)
      .refine((v) => Object.keys(v).length <= 12, 'Too many fields.')
      .optional()
      .transform((v) => v ?? {})
  })
  .strict()
  .refine(requireContact, contactMessage);

export const quoteDetailsSchema = z
  .object({
    service_type: z.enum(QUOTE_SERVICE_TYPES, { message: 'Please choose an event type.' }),
    headcount: z.number().int('Please enter a whole number of guests.').min(1, 'Please enter at least 1 guest.').max(50, 'For more than 50 guests, please call us.'),
    event_date: z
      .string()
      .refine((v) => isDateInWindow(v, QUOTE_WINDOW_DAYS), 'Please choose an event date from today on.'),
    location: text().pipe(z.string().max(LIMITS.shortText)),
    estimated_budget: text().pipe(
      z
        .string()
        .max(60, 'Please keep the budget short, e.g. $300 - $600.')
        .refine((v) => !MARKUP_RE.test(v), 'Please remove code or tags such as < > from the budget.')
        .transform((v) => v || null)
    )
  })
  .strict();

export type ValidationResult<T> =
  | { ok: true; data: T; message?: undefined; field?: undefined }
  | { ok: false; data?: undefined; message: string; field?: string };

/** Runs a schema and returns the first calm message on failure. */
export function check<S extends z.ZodTypeAny>(schema: S, input: unknown): ValidationResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const issue = result.error.issues[0];
  const field = typeof issue?.path?.[0] === 'string' ? (issue.path[0] as string) : undefined;
  const message =
    issue && issue.code !== 'unrecognized_keys' && issue.code !== 'invalid_type'
      ? issue.message
      : 'Please check the information you entered.';
  return { ok: false, message, field };
}

/** One field that may be an email or a phone number (VIP sign-up). */
export function parseEmailOrPhone(value: unknown): ValidationResult<{ email: string | null; phone: string | null }> {
  const s = cleanText(value);
  if (!s) return { ok: false, message: 'Please enter your email or phone number.' };
  if (s.includes('@')) {
    const r = check(optionalEmail, s);
    return r.ok ? { ok: true, data: { email: r.data, phone: null } } : { ok: false, message: r.message };
  }
  const phone = normalizePhone(s);
  return phone
    ? { ok: true, data: { email: null, phone } }
    : { ok: false, message: 'Please enter a valid email or phone number, e.g. (619) 555-0199.' };
}

// ---------------------------------------------------------------------------
// Values that come from the database and end up in links or images
// ---------------------------------------------------------------------------

/** https URL (or same-site path) safe for href/src; null otherwise (javascript:, data:, http:...). */
export function safeUrl(value: unknown, options: { allowPath?: boolean } = {}): string | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s || s.length > 2048 || cleanText(s) !== s || /[\s<>"'`\\]/.test(s)) return null;
  if (options.allowPath && s.startsWith('/') && !s.startsWith('//')) return s;
  try {
    const url = new URL(s);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

/** Digits and a leading + only, for tel: links. */
export function telDigits(value: unknown): string {
  if (typeof value !== 'string') return '';
  const s = value.replace(/[^\d+]/g, '');
  return /^\+?\d{3,15}$/.test(s) ? s : '';
}

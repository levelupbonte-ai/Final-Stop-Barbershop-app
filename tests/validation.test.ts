import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOKING_WINDOW_DAYS,
  bookingSchema,
  check,
  cleanText,
  formSchema,
  isDateInWindow,
  normalizePhone,
  normalizeTicketCode,
  parseEmailOrPhone,
  quoteDetailsSchema,
  safeUrl,
  telDigits,
  waitlistSchema
} from '../src/lib/site/validation';

const ZWSP = String.fromCharCode(0x200b);
const RLO = String.fromCharCode(0x202e);
const BOM = String.fromCharCode(0xfeff);
const NUL = String.fromCharCode(0);
const SCRIPT = '<script>alert(1)</script>';

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const booking = (over: Record<string, unknown> = {}) => ({
  serviceSlug: 'haircut',
  date: iso(1),
  time: '10:30',
  teamMemberSlug: null,
  name: 'Jordan Miller',
  email: 'jordan@example.com',
  phone: '',
  notes: '',
  ...over
});

test('cleanText trims, normalises and strips invisible / control characters', () => {
  assert.equal(cleanText(`  Jor${ZWSP}dan${NUL}  Mil${RLO}ler${BOM} `), 'Jordan Miller');
  assert.equal(cleanText('a\tb\nc'), 'a b c');
  assert.equal(cleanText('line 1\r\n\r\n\r\n\r\nline 2', { multiline: true }), 'line 1\n\nline 2');
  assert.equal(cleanText(42), '');
  assert.equal(cleanText('Café'.replace('\\u0301', String.fromCharCode(0x301))), 'Café'.normalize('NFC'));
});

test('valid booking passes and is cleaned', () => {
  const r = check(bookingSchema, booking({ name: `  Jordan${ZWSP} Miller `, email: ' Jordan@Example.com ', phone: '(619) 555-0199' }));
  assert.equal(r.ok, true);
  assert.equal(r.data.name, 'Jordan Miller');
  assert.equal(r.data.email, 'jordan@example.com');
  assert.equal(r.data.phone, '+16195550199');
  assert.equal(r.data.notes, null);
  assert.equal(r.data.teamMemberSlug, null);
});

test('booking: malicious and malformed input is refused', () => {
  const bad: [string, Record<string, unknown>][] = [
    ['script in name', { name: SCRIPT }],
    ['url in name', { name: 'javascript:alert(1)' }],
    ['empty name', { name: `  ${ZWSP} ` }],
    ['oversized name', { name: 'a'.repeat(81) }],
    ['oversized notes', { notes: 'x'.repeat(501) }],
    ['script in notes', { notes: `Fade please ${SCRIPT}` }],
    ['javascript url in notes', { notes: 'see javascript:alert(1)' }],
    ['html tag in notes', { notes: '<img src=x onerror=alert(1)>' }],
    ['bad email', { email: 'jordan@' }],
    ['email with markup', { email: '"><script>@x.com' }],
    ['oversized email', { email: `${'a'.repeat(250)}@example.com` }],
    ['no contact', { email: '', phone: '' }],
    ['bad phone', { email: '', phone: '123' }],
    ['phone with letters', { email: '', phone: '619-CALL-NOW' }],
    ['past date', { date: iso(-2) }],
    ['date too far', { date: iso(BOOKING_WINDOW_DAYS + 1) }],
    ['impossible date', { date: '2026-02-31' }],
    ['sql in date', { date: "2026-10-20' OR 1=1--" }],
    ['bad time', { time: '25:00' }],
    ['time injection', { time: '10:00;DROP' }],
    ['bad slug', { serviceSlug: '../admin' }],
    ['slug with markup', { teamMemberSlug: SCRIPT }],
    ['missing service', { serviceSlug: '' }],
    ['unknown key', { price: 0 }],
    ['unknown key status', { status: 'confirmed' }],
    ['wrong type', { name: ['Jordan'] }],
    ['object as email', { email: { $ne: '' } }],
    ['number as notes', { notes: 42 }]
  ];
  for (const [label, over] of bad) {
    const r = check(bookingSchema, booking(over));
    assert.equal(r.ok, false, label);
    assert.ok(r.message && r.message.length < 120, `${label}: calm short message`);
    assert.doesNotMatch(r.message, /zod|invalid_type|expected/i, label);
  }
  assert.equal(check(bookingSchema, booking({ date: iso(0) })).ok, true, 'today is allowed');
  assert.equal(check(bookingSchema, booking({ date: iso(BOOKING_WINDOW_DAYS) })).ok, true, 'last day allowed');
});

test('phone numbers are normalised to E.164', () => {
  assert.equal(normalizePhone('(619) 886-1267'), '+16198861267');
  assert.equal(normalizePhone('619.886.1267'), '+16198861267');
  assert.equal(normalizePhone('1 619 886 1267'), '+16198861267');
  assert.equal(normalizePhone('+33 6 12 34 56 78'), '+33612345678');
  assert.equal(normalizePhone('0033612345678'), '+33612345678');
  for (const p of ['', '123', '+0123456789', '+1 012 555 0199', '555-0199', '+1234567890123456', 'abc', `619${ZWSP}8861267x`, '619<script>', '+1 619 555 0199 ext 4']) {
    assert.equal(normalizePhone(p), null, p);
  }
});

test('waitlist: same contact rules, unknown keys refused', () => {
  assert.equal(check(waitlistSchema, { name: 'Marcus Taylor', phone: '6195550199' }).ok, true);
  assert.equal(check(waitlistSchema, { name: 'Marcus Taylor', phone: '6195550199', position: 1 }).ok, false);
  assert.equal(check(waitlistSchema, { name: SCRIPT, phone: '6195550199' }).ok, false);
  assert.equal(check(waitlistSchema, { name: 'Marcus', phone: '' }).ok, false);
});

test('forms: type enum, data keys and values are bounded', () => {
  const base = { formType: 'quote', name: 'Marcus Vance', email: 'm@example.com' };
  assert.equal(check(formSchema, base).ok, true);
  assert.equal(check(formSchema, { ...base, formType: 'admin' }).ok, false);
  assert.equal(check(formSchema, { ...base, message: 'x'.repeat(2001) }).ok, false);
  assert.equal(check(formSchema, { ...base, message: `Hi ${SCRIPT}` }).ok, false);
  assert.equal(check(formSchema, { ...base, company: 'ACME\nInc' }).data?.company, 'ACME Inc');
  assert.equal(check(formSchema, { ...base, data: { origin: 'welcome_modal' } }).ok, true);
  assert.equal(check(formSchema, { ...base, data: { __proto__x: 'a' } }).ok, false);
  assert.equal(check(formSchema, { ...base, data: { 'bad key': 'a' } }).ok, false);
  assert.equal(check(formSchema, { ...base, data: { note: SCRIPT } }).ok, false);
  assert.equal(check(formSchema, { ...base, data: { note: 'x'.repeat(121) } }).ok, false);
  assert.equal(check(formSchema, { ...base, data: { nested: { a: 1 } } }).ok, false);
  const many = Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`k${i}`, i]));
  assert.equal(check(formSchema, { ...base, data: many }).ok, false);
  assert.equal(check(formSchema, { ...base, isAdmin: true }).ok, false);
});

test('quote details: event type, headcount and date range', () => {
  const ok = { service_type: 'Custom Event', headcount: 5, event_date: iso(10), location: 'In-shop', estimated_budget: '$300 - $600' };
  assert.equal(check(quoteDetailsSchema, ok).ok, true);
  assert.equal(check(quoteDetailsSchema, { ...ok, service_type: SCRIPT }).ok, false);
  assert.equal(check(quoteDetailsSchema, { ...ok, headcount: 0 }).ok, false);
  assert.equal(check(quoteDetailsSchema, { ...ok, headcount: 51 }).ok, false);
  assert.equal(check(quoteDetailsSchema, { ...ok, headcount: 2.5 }).ok, false);
  assert.equal(check(quoteDetailsSchema, { ...ok, event_date: iso(-1) }).ok, false);
  assert.equal(check(quoteDetailsSchema, { ...ok, event_date: '' }).ok, false);
  assert.equal(check(quoteDetailsSchema, { ...ok, estimated_budget: '<b>1000</b>' }).ok, false);
});

test('email-or-phone single field (VIP sign-up)', () => {
  assert.deepEqual(parseEmailOrPhone(' John@Gmail.com ').data, { email: 'john@gmail.com', phone: null });
  assert.deepEqual(parseEmailOrPhone('(619) 886-1267').data, { email: null, phone: '+16198861267' });
  assert.equal(parseEmailOrPhone(SCRIPT).ok, false);
  assert.equal(parseEmailOrPhone('a@b').ok, false);
  assert.equal(parseEmailOrPhone('').ok, false);
});

test('ticket codes: strict format, case-insensitive', () => {
  assert.equal(normalizeTicketCode(' fs-7kq2m9xa '), 'FS-7KQ2M9XA');
  for (const c of ['', 'FS-102', 'RES-892', "FS-7KQ2M9XA' OR 1=1", SCRIPT, `FS-7KQ2M9X${ZWSP}A`.replace(ZWSP, '%'), 'TOOLONGPREFIX-7KQ2M9XA', 'x'.repeat(1000)]) {
    assert.equal(normalizeTicketCode(c), null, c);
  }
});

test('dates: real calendar dates inside the window only', () => {
  const now = new Date(2026, 9, 19);
  assert.equal(isDateInWindow('2026-10-19', 90, now), true);
  assert.equal(isDateInWindow('2026-10-18', 90, now), false);
  assert.equal(isDateInWindow('2027-01-17', 90, now), true);
  assert.equal(isDateInWindow('2027-01-18', 90, now), false);
  assert.equal(isDateInWindow('2026-13-01', 90, now), false);
  assert.equal(isDateInWindow('2026-10-19T00:00', 90, now), false);
});

test('URLs from the database: https only, no javascript:/data:', () => {
  assert.equal(safeUrl('https://maps.app.goo.gl/abc'), 'https://maps.app.goo.gl/abc');
  assert.equal(safeUrl('/media/logo.png', { allowPath: true }), '/media/logo.png');
  for (const u of [
    'javascript:alert(1)',
    ' JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://example.com',
    '//evil.example/x',
    'https://user:pass@example.com',
    'https://example.com/"onerror="alert(1)',
    `https://example.com/${ZWSP}`,
    'vbscript:msgbox(1)',
    42
  ]) {
    assert.equal(safeUrl(u, { allowPath: true }), null, String(u));
  }
  assert.equal(telDigits('+1 (619) 886-1267'), '+16198861267');
  assert.equal(telDigits('javascript:alert(1)'), '');
});

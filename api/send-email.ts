// Confirmation emails for bookings, waitlist tickets and form submissions.
//
// Security model (replaces the previous open relay that accepted arbitrary
// recipients, subjects and HTML from the browser):
// - The browser only sends { kind, ticketCode }.
// - The server looks the record up in Supabase with the service role, scoped to
//   this website, created in the last 15 minutes, never emailed before.
// - The row is claimed atomically (confirmation_sent_at), so each ticket can
//   trigger at most one email, sent only to the address stored with it.
// - Every value placed in the HTML is escaped.
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

type Kind = 'appointment' | 'waitlist' | 'form';

const TABLES: Record<Kind, { table: string; email: string; name: string; createdAt: string }> = {
  appointment: { table: 'appointments', email: 'customer_email', name: 'customer_name', createdAt: 'created_at' },
  waitlist: { table: 'waitlist_entries', email: 'customer_email', name: 'customer_name', createdAt: 'joined_at' },
  form: { table: 'form_submissions', email: 'email', name: 'name', createdAt: 'created_at' }
};

const TICKET_RE = /^[A-Z0-9]{1,8}-[A-Z0-9]{8}$/;

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );
}

function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function renderEmail(opts: {
  siteName: string;
  logoUrl: string | null;
  heading: string;
  greeting: string;
  rows: [string, string][];
  footer: string;
}): string {
  const rows = opts.rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;font-size:13px;width:40%;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#F9FAFB;font-size:13px;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#0B0B0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#141418;border:1px solid #27272A;">
        <tr><td align="center" style="padding:28px 24px;border-bottom:1px solid #27272A;">
          ${opts.logoUrl ? `<img src="${escapeHtml(opts.logoUrl)}" alt="${escapeHtml(opts.siteName)}" width="160" style="display:block;max-width:100%;height:auto;border:0;">` : `<strong style="color:#F9FAFB;font-size:18px;">${escapeHtml(opts.siteName)}</strong>`}
        </td></tr>
        <tr><td style="padding:28px 28px 8px;">
          <h1 style="margin:0 0 12px;color:#F9FAFB;font-size:20px;">${escapeHtml(opts.heading)}</h1>
          <p style="margin:0;color:#D1D5DB;font-size:14px;line-height:1.6;">${escapeHtml(opts.greeting)}</p>
        </td></tr>
        <tr><td style="padding:16px 28px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #27272A;">${rows}</table>
        </td></tr>
        <tr><td style="padding:16px 28px 28px;color:#6B7280;font-size:12px;line-height:1.6;border-top:1px solid #27272A;">${escapeHtml(opts.footer)}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const kind = req.body?.kind as Kind;
  const ticketCode = String(req.body?.ticketCode ?? '').trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(TABLES, kind) || !TICKET_RE.test(ticketCode)) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Invalid request' } });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const websiteId = process.env.WEBSITE_ID || process.env.VITE_WEBSITE_ID;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!supabaseUrl || !secretKey || !websiteId || !resendKey || !fromEmail) {
    // Not configured: the booking itself is already saved, so this is not an error for the visitor.
    return res.status(202).json({ success: false, error: { code: 'NOT_CONFIGURED', message: 'Email is not configured' } });
  }

  const db = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const t = TABLES[kind];
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Atomically claim the ticket so it can only ever trigger one email.
  const { data: claimed, error: claimError } = await db
    .from(t.table)
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('website_id', websiteId)
    .eq('ticket_code', ticketCode)
    .is('confirmation_sent_at', null)
    .gte(t.createdAt, since)
    .select('*')
    .maybeSingle();

  if (claimError) {
    console.error('[send-email] claim failed', claimError.message);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Could not send email' } });
  }
  const record = claimed as Record<string, any> | null;
  const to = record?.[t.email];
  if (!record || !to) {
    // Unknown, expired, already emailed, or no email address: nothing to do.
    return res.status(202).json({ success: true });
  }

  const { data: site } = await db.rpc('get_public_website', { p_website_id: websiteId });
  const siteName: string = site?.name ?? 'Our team';
  const branding = site?.settings?.branding ?? {};
  const contact = site?.settings?.contact ?? {};
  const fromName: string = branding.email_from_name || siteName;
  const name = String(record[t.name] ?? '').split(' ')[0] || 'there';

  let subject: string;
  let heading: string;
  let greeting: string;
  let rows: [string, string][];

  if (kind === 'appointment') {
    subject = `Booking received · ${ticketCode} · ${siteName}`;
    heading = 'Your appointment request is in';
    greeting = `Hi ${name}, thanks for booking with ${siteName}. Keep your ticket number to check your status on our website.`;
    rows = [
      ['Ticket', ticketCode],
      ['Service', record.service_name],
      ['Price', record.price_label],
      ['With', record.team_member_name ?? 'First available'],
      ['Date', record.appointment_date],
      ['Time', formatTime(record.appointment_time)],
      ['Address', contact.address]
    ];
  } else if (kind === 'waitlist') {
    subject = `You're on the waitlist · ${ticketCode} · ${siteName}`;
    heading = 'You are in line';
    greeting = `Hi ${name}, you joined the live walk-in queue at ${siteName}.`;
    rows = [
      ['Ticket', ticketCode],
      ['Position', `#${record.position}`],
      ['Estimated wait', `~${record.est_minutes} min`],
      ['With', record.team_member_name ?? 'First available'],
      ['Service', record.service_name],
      ['Address', contact.address]
    ];
  } else {
    subject = `We received your request · ${ticketCode} · ${siteName}`;
    heading = 'Thanks, we got your message';
    greeting = `Hi ${name}, ${siteName} received your request and will get back to you soon.`;
    rows = [['Reference', ticketCode]];
  }

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html: renderEmail({
        siteName,
        logoUrl: typeof branding.logo_url === 'string' ? branding.logo_url : null,
        heading,
        greeting,
        rows,
        footer: `${siteName}${contact.address ? ` · ${contact.address}` : ''}`
      })
    });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[send-email] send failed', err?.message);
    return res.status(502).json({ success: false, error: { code: 'EMAIL_FAILED', message: 'Could not send email' } });
  }
}

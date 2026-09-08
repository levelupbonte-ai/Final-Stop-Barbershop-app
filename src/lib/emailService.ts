/**
 * Service to dispatch confirmation emails via Resend
 */

export interface EmailPayload {
  to: string | string[];
  clientName?: string;
  type: 'booking' | 'waitlist' | 'vip_signup' | 'promo_code' | 'we_miss_you' | 'announcement' | 'custom';
  details?: {
    barber?: string;
    service?: string;
    date?: string;
    time?: string;
    ticketId?: string;
    estimatedWait?: string;
    price?: number | string;
    phone?: string;
    notes?: string;
  };
  promoCode?: string;
  discountText?: string;
  customSubject?: string;
  customMessage?: string;
  expiryDate?: string;
  headline?: string;
}

export interface CampaignEmailParams {
  recipients: string[];
  clientName?: string;
  type: 'promo_code' | 'we_miss_you' | 'announcement' | 'custom';
  promoCode?: string;
  discountText?: string;
  customSubject?: string;
  customMessage?: string;
  expiryDate?: string;
  headline?: string;
}

export interface BookingEmailParams {
  toName: string;
  toEmail: string;
  ticketId: string;
  serviceName: string;
  duration?: string;
  price?: string | number;
  date: string;
  time: string;
  barberName: string;
  phone?: string;
  notes?: string;
}

export async function sendConfirmationEmail(payload: EmailPayload): Promise<{ success: boolean; message?: string }> {
  const hasValidRecipient = Array.isArray(payload.to) 
    ? payload.to.length > 0 && payload.to.some(e => e && e.includes('@'))
    : payload.to && payload.to.includes('@');

  if (!hasValidRecipient) {
    return { success: false, message: 'Invalid email address' };
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('Email dispatch notification:', errData);
      return { success: false, message: errData.error || errData.message || 'Email service notice' };
    }

    const data = await response.json();
    if (data.success === false) {
      return { success: false, message: data.message || data.error || 'Email could not be dispatched' };
    }
    return { success: true, message: 'Email sent successfully via Resend' };
  } catch (err: any) {
    console.warn('Resend email fetch fallback:', err);
    return { success: false, message: err?.message || 'Email network unavailable' };
  }
}

export async function sendMarketingCampaignEmail(params: CampaignEmailParams): Promise<{ success: boolean; message?: string }> {
  if (!params.recipients || params.recipients.length === 0) {
    return { success: false, message: 'No recipients selected' };
  }

  return sendConfirmationEmail({
    to: params.recipients,
    clientName: params.clientName,
    type: params.type,
    promoCode: params.promoCode,
    discountText: params.discountText,
    customSubject: params.customSubject,
    customMessage: params.customMessage,
    expiryDate: params.expiryDate,
    headline: params.headline,
  });
}

export async function sendBookingConfirmationEmail(params: BookingEmailParams): Promise<{ success: boolean; message?: string }> {
  return sendConfirmationEmail({
    to: params.toEmail,
    clientName: params.toName,
    type: 'booking',
    details: {
      barber: params.barberName,
      service: params.serviceName,
      date: params.date,
      time: params.time,
      ticketId: params.ticketId,
      price: params.price,
      phone: params.phone,
      notes: params.notes,
    }
  });
}

export async function sendWaitlistConfirmationEmail(params: {
  toEmail: string;
  clientName: string;
  ticketId: string;
  barberName: string;
  serviceName: string;
  estimatedWait?: string;
}): Promise<{ success: boolean; message?: string }> {
  return sendConfirmationEmail({
    to: params.toEmail,
    clientName: params.clientName,
    type: 'waitlist',
    details: {
      barber: params.barberName,
      service: params.serviceName,
      ticketId: params.ticketId,
      estimatedWait: params.estimatedWait || '15-25 min',
    }
  });
}

/**
 * Service to dispatch confirmation emails via Resend
 */

export interface EmailPayload {
  to: string;
  clientName: string;
  type: 'booking' | 'waitlist';
  details: {
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
  if (!payload.to || !payload.to.includes('@')) {
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
      return { success: false, message: errData.message || 'Email service notice' };
    }

    const data = await response.json();
    return { success: true, message: 'Email sent successfully via Resend' };
  } catch (err: any) {
    console.warn('Resend email fetch fallback:', err);
    return { success: false, message: err?.message || 'Email network unavailable' };
  }
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

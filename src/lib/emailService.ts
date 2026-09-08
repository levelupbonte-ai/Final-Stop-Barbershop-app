/**
 * EmailJS Client-side Email Dispatcher
 * Sends appointment confirmation email to the client using EmailJS REST API.
 */

export interface BookingEmailParams {
  toName: string;
  toEmail: string;
  ticketId: string;
  serviceName: string;
  duration: string;
  price: string;
  date: string;
  time: string;
  barberName: string;
  phone?: string;
  notes?: string;
}

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_e1k9uth';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_zadraak';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '7UQM4yu7KUSpooMy9';

export async function sendBookingConfirmationEmail(params: BookingEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_name: params.toName,
        to_email: params.toEmail,
        ticket_id: params.ticketId,
        service_name: params.serviceName,
        duration: params.duration,
        service_price: params.price,
        booking_date: params.date,
        booking_time: params.time,
        barber_name: params.barberName,
        guest_phone: params.phone || 'N/A',
        notes: params.notes || 'None',
        shop_name: 'Final Stop Barber Shop',
        shop_address: '5277 El Cajon Blvd, San Diego, CA 92115',
        shop_phone_1: '+1 (619) 886-1267',
        shop_phone_2: '+1 (619) 928-7084',
        maps_link: 'https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9'
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('EmailJS dispatch failed:', response.status, errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Error triggering confirmation email:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

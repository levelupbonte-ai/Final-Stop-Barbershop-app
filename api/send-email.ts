import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Skipping email dispatch.');
    return res.status(200).json({ 
      success: false, 
      message: 'RESEND_API_KEY not configured. Add it in Vercel environment variables.' 
    });
  }

  try {
    const resend = new Resend(apiKey);
    const { to, clientName, type, details } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const isBooking = type === 'booking';
    const subject = isBooking 
      ? `Booking Confirmation - Final Stop Barber Shop (${details?.ticketId || 'VIP'})`
      : `Walk-In Queue Ticket #${details?.ticketId || ''} - Final Stop Barber Shop`;

    const htmlContent = isBooking ? `
      <div style="font-family: Arial, sans-serif; background-color: #0A0A0B; color: #FFFFFF; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 2px;">FINAL STOP BARBER SHOP</h1>
          <p style="color: #A0A0A5; font-size: 13px; margin-top: 4px;">5277 El Cajon Blvd • San Diego, CA 92115</p>
        </div>
        
        <div style="background-color: #141418; border: 1px solid #D4AF37; padding: 24px; border-radius: 6px; margin-bottom: 24px;">
          <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">Appointment Confirmed!</h2>
          <p style="color: #CCCCCC; font-size: 14px;">Hello <strong>${clientName}</strong>, your appointment has been scheduled successfully.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr>
              <td style="color: #A0A0A5; padding: 8px 0; border-bottom: 1px solid #222;">Ticket Number:</td>
              <td style="color: #D4AF37; font-weight: bold; text-align: right; padding: 8px 0; border-bottom: 1px solid #222;">${details?.ticketId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #A0A0A5; padding: 8px 0; border-bottom: 1px solid #222;">Master Barber:</td>
              <td style="color: #FFFFFF; font-weight: bold; text-align: right; padding: 8px 0; border-bottom: 1px solid #222;">${details?.barber || 'Any Available'}</td>
            </tr>
            <tr>
              <td style="color: #A0A0A5; padding: 8px 0; border-bottom: 1px solid #222;">Service:</td>
              <td style="color: #FFFFFF; text-align: right; padding: 8px 0; border-bottom: 1px solid #222;">${details?.service || 'Haircut'}</td>
            </tr>
            <tr>
              <td style="color: #A0A0A5; padding: 8px 0; border-bottom: 1px solid #222;">Date & Time:</td>
              <td style="color: #FFFFFF; font-weight: bold; text-align: right; padding: 8px 0; border-bottom: 1px solid #222;">${details?.date || ''} at ${details?.time || ''}</td>
            </tr>
            <tr>
              <td style="color: #A0A0A5; padding: 8px 0;">Total:</td>
              <td style="color: #D4AF37; font-weight: bold; text-align: right; padding: 8px 0;">$${details?.price || '45'}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; color: #888888; font-size: 12px; line-height: 1.6;">
          <p>Need to reschedule or have questions? Call us directly: <strong style="color: #FFFFFF;">(619) 886-1267</strong></p>
          <p style="margin-top: 12px;">Final Stop Barber Shop • finalstop.org</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; background-color: #0A0A0B; color: #FFFFFF; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 2px;">FINAL STOP BARBER SHOP</h1>
          <p style="color: #A0A0A5; font-size: 13px; margin-top: 4px;">Walk-In Live Queue</p>
        </div>
        
        <div style="background-color: #141418; border: 1px solid #D4AF37; padding: 24px; border-radius: 6px; margin-bottom: 24px; text-align: center;">
          <span style="color: #A0A0A5; font-size: 12px; text-transform: uppercase;">Your Queue Ticket</span>
          <h2 style="color: #D4AF37; font-size: 36px; margin: 8px 0;">#${details?.ticketId || 'T-01'}</h2>
          <p style="color: #FFFFFF; font-size: 14px;">Hello <strong>${clientName}</strong>, you are in the live queue!</p>
          <p style="color: #A0A0A5; font-size: 13px;">Selected Barber: <strong style="color: #FFFFFF;">${details?.barber || 'Next Available'}</strong></p>
          <p style="color: #A0A0A5; font-size: 13px;">Estimated Wait: <strong style="color: #D4AF37;">${details?.estimatedWait || '15-25 min'}</strong></p>
        </div>

        <div style="text-align: center; color: #888888; font-size: 12px;">
          <p>Address: 5277 El Cajon Blvd, San Diego, CA 92115</p>
          <p>Direct line: (619) 886-1267 • finalstop.org</p>
        </div>
      </div>
    `;

    // Try sending with the domain or Resend's default onboarding address
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Final Stop Barber Shop <onboarding@resend.dev>';

    const data = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Resend email error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to send email' 
    });
  }
}

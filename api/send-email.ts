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

    const ticketId = details?.ticketId || 'FS-01';
    const guestName = clientName || details?.name || 'Valued Guest';
    const serviceName = details?.service || 'Skin Fade & Precision Haircut';
    const barberName = details?.barber || 'Master Barber';
    const bookingDate = details?.date || 'Confirmed Date';
    const bookingTime = details?.time || 'Confirmed Time';
    const duration = details?.duration || '35-45 min';
    const servicePrice = details?.price ? (String(details.price).startsWith('$') ? details.price : `$${details.price}`) : '$35';
    const mapsLink = 'https://maps.app.goo.gl/nVdA7FUH9LyMvCCu9';

    let subject = `Appointment Confirmed - Ticket #${ticketId} | Final Stop Barber Shop`;
    let htmlContent = '';

    if (type === 'booking') {
      subject = `Appointment Confirmed - Ticket #${ticketId} | Final Stop Barber Shop`;
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation - Final Stop Barber Shop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB;">
  
  <!-- Conteneur Principal -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0B0D; padding: 30px 10px;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141418; border: 1px solid #27272A; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Logo & Header -->
          <tr>
            <td align="center" style="padding: 35px 25px 25px 25px; border-bottom: 1px solid #27272A; background-color: #0F0F12;">
              <img src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" alt="Final Stop Barber Shop" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
              <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; margin-top: 14px; font-weight: bold;">
                San Diego &bull; Premium Grooming Lounge
              </div>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 30px 30px 10px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(212, 175, 55, 0.12); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.4); padding: 5px 14px; font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; border-radius: 2px;">
                TICKET #${ticketId}
              </span>
              <h1 style="color: #FFFFFF; font-size: 24px; margin: 16px 0 8px 0; font-weight: 700;">
                Appointment Confirmed
              </h1>
              <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.5;">
                Hello <strong style="color: #FFFFFF;">${guestName}</strong>, your chair is reserved at Final Stop Barber Shop.
              </p>
            </td>
          </tr>

          <!-- Tableau recapitulatif -->
          <tr>
            <td style="padding: 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0A0A0C; border: 1px solid #27272A; border-radius: 4px;">
                
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    Service / Cut
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; text-align: right; font-size: 14px; font-weight: bold; color: #FFFFFF;">
                    ${serviceName}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    Master Barber
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; text-align: right; font-size: 14px; font-weight: 600; color: #D4AF37;">
                    ${barberName}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    Date & Time
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; text-align: right; font-size: 14px; font-weight: bold; color: #FFFFFF;">
                    ${bookingDate} &bull; <span style="color: #D4AF37;">${bookingTime}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    Duration
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1F1F23; text-align: right; font-size: 13px; color: #E5E7EB;">
                    ${duration}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    Rate (Pay at Shop)
                  </td>
                  <td style="padding: 14px 18px; text-align: right; font-size: 16px; font-weight: bold; color: #D4AF37;">
                    ${servicePrice}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Adresse & Telephones -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px dashed #27272A; padding-top: 18px;">
                <tr>
                  <td style="font-size: 12px; color: #9CA3AF; line-height: 1.6;">
                    <strong style="color: #FFFFFF; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; display: block; margin-bottom: 4px;">Shop Location</strong>
                    5277 El Cajon Blvd, San Diego, CA 92115<br>
                    <span style="color: #6B7280; font-size: 11px;">(Free parking available)</span>
                  </td>
                  <td style="text-align: right; font-size: 12px; color: #9CA3AF; line-height: 1.6;">
                    <strong style="color: #FFFFFF; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; display: block; margin-bottom: 4px;">Direct Phone Lines</strong>
                    <a href="tel:16198861267" style="color: #D4AF37; text-decoration: none; font-weight: bold;">(619) 886-1267</a><br>
                    <a href="tel:16199287084" style="color: #D4AF37; text-decoration: none; font-weight: bold;">(619) 928-7084</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bouton Google Maps -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px;">
              <a href="${mapsLink}" target="_blank" style="display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; padding: 12px 28px; border-radius: 2px;">
                Get Directions on Maps
              </a>
            </td>
          </tr>

          <!-- Footer du mail -->
          <tr>
            <td align="center" style="background-color: #0A0A0C; padding: 20px; border-top: 1px solid #27272A; font-size: 11px; color: #6B7280; line-height: 1.5;">
              Need to reschedule or cancel? Simply give us a call or text prior to your appointment.<br>
              &copy; Final Stop Barber Shop &bull; All Rights Reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
    } else if (type === 'vip_signup') {
      subject = `Welcome to the VIP Club - Final Stop Barber Shop`;
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIP Club Invitation - Final Stop Barber Shop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0B0D; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141418; border: 1px solid #27272A; border-radius: 4px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 35px 25px 25px 25px; border-bottom: 1px solid #27272A; background-color: #0F0F12;">
              <img src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" alt="Final Stop Barber Shop" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
              <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; margin-top: 14px; font-weight: bold;">
                VIP Client List &bull; Member Confirmation
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(212, 175, 55, 0.12); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.4); padding: 5px 14px; font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; border-radius: 2px;">
                MEMBERSHIP CONFIRMED
              </span>
              <h1 style="color: #FFFFFF; font-size: 24px; margin: 18px 0 10px 0; font-weight: 700;">
                You're Officially on the VIP List
              </h1>
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 0 auto; max-width: 460px;">
                Thank you for registering with Final Stop Barber Shop. You are now registered to receive our upcoming private promotional vouchers, flash holiday offers, and priority chair announcements sent directly to your inbox.
              </p>
              <div style="margin-top: 25px; padding: 18px; background-color: #0A0A0C; border: 1px solid #27272A; border-radius: 4px;">
                <p style="color: #D4AF37; font-size: 12px; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  Exclusive Offers Coming Soon
                </p>
                <p style="color: #6B7280; font-size: 12px; margin: 6px 0 0 0;">
                  Keep an eye out for special discount codes and priority booking windows reserved exclusively for VIP members.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #0A0A0C; padding: 20px; border-top: 1px solid #27272A; font-size: 11px; color: #6B7280; line-height: 1.5;">
              5277 El Cajon Blvd, San Diego, CA 92115 &bull; (619) 886-1267<br>
              &copy; Final Stop Barber Shop &bull; finalstop.org
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    } else {
      // Walk-In queue ticket
      subject = `Walk-In Queue Ticket #${ticketId} | Final Stop Barber Shop`;
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Queue Ticket - Final Stop Barber Shop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0B0D; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #141418; border: 1px solid #27272A; border-radius: 4px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 35px 25px 25px 25px; border-bottom: 1px solid #27272A; background-color: #0F0F12;">
              <img src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png" alt="Final Stop Barber Shop" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
              <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; margin-top: 14px; font-weight: bold;">
                Live Walk-In Queue Desk
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; text-align: center;">
              <span style="color: #A0A0A5; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Your Queue Ticket</span>
              <h2 style="color: #D4AF37; font-size: 40px; margin: 10px 0; font-family: monospace; font-weight: 800;">#${ticketId}</h2>
              <p style="color: #FFFFFF; font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${guestName}</strong>, your place in line is registered!</p>
              <div style="background-color: #0A0A0C; border: 1px solid #27272A; padding: 14px; border-radius: 4px; text-align: left; max-width: 400px; margin: 0 auto; font-size: 13px;">
                <p style="margin: 4px 0; color: #9CA3AF;">Service: <strong style="color: #FFF;">${serviceName}</strong></p>
                <p style="margin: 4px 0; color: #9CA3AF;">Barber: <strong style="color: #D4AF37;">${barberName}</strong></p>
                <p style="margin: 4px 0; color: #9CA3AF;">Est. Wait Time: <strong style="color: #FFF;">${details?.estimatedWait || '15-25 min'}</strong></p>
              </div>
              <div style="margin-top: 24px;">
                <a href="${mapsLink}" target="_blank" style="display: inline-block; background-color: #D4AF37; color: #000; text-decoration: none; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; padding: 10px 24px; border-radius: 2px;">
                  Open Map & Navigate
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #0A0A0C; padding: 20px; border-top: 1px solid #27272A; font-size: 11px; color: #6B7280; line-height: 1.5;">
              5277 El Cajon Blvd, San Diego, CA 92115 &bull; (619) 886-1267<br>
              &copy; Final Stop Barber Shop &bull; finalstop.org
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    // Default sender or verified domain sender
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

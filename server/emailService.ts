import nodemailer from 'nodemailer';
import { Reservation } from '../src/types';

interface EmailSentResult {
  success: boolean;
  messageId?: string;
  simulated: boolean;
  error?: string;
}

/**
 * Generates an elegant HTML template for reservation confirmation.
 */
function generateReservationEmailTemplate(reservation: Reservation): string {
  const extrasList: string[] = [];
  if (reservation.extras.balls) extrasList.push('⚽ Balones de Juego');
  if (reservation.extras.bibs) extrasList.push('🎽 Casacas / Chalecos');
  if (reservation.extras.referee) extrasList.push('🏁 Árbitro Profesional');
  const extrasString = extrasList.length > 0 ? extrasList.join(', ') : 'Ninguno';

  const isPaid = reservation.paymentStatus === 'paid';
  const statusColor = isPaid ? '#22c55e' : '#f59e0b';
  const statusText = isPaid ? 'PAGADO ✓' : 'PENDIENTE DE PAGO ⚠️';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Reserva - Guerreros Ayotla</title>
      <style>
        body {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0c0f0d;
          color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #121614;
          border: 1px solid #14532d;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .header {
          background-color: #050706;
          padding: 30px;
          text-align: center;
          border-bottom: 2px solid #22c55e;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 0;
          letter-spacing: 1px;
        }
        .header p {
          color: #22c55e;
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 2px;
          margin: 5px 0 0 0;
          text-transform: uppercase;
        }
        .content {
          padding: 30px;
        }
        .welcome {
          font-size: 16px;
          line-height: 1.6;
          color: #e5e7eb;
          margin-bottom: 25px;
        }
        .details-card {
          background-color: #090c0a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .details-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #1e293b;
        }
        .details-row:last-child {
          border-bottom: none;
        }
        .details-label {
          color: #9ca3af;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .details-value {
          color: #ffffff;
          font-weight: bold;
          font-size: 14px;
          text-align: right;
        }
        .code-box {
          background-color: #064e3b;
          border: 2px dashed #22c55e;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .code-label {
          color: #a7f3d0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .code-value {
          color: #ffffff;
          font-family: monospace;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 3px;
        }
        .button-wrapper {
          text-align: center;
          margin-top: 30px;
        }
        .cta-button {
          display: inline-block;
          background-color: #22c55e;
          color: #000000 !important;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 14px 28px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .footer {
          background-color: #050706;
          padding: 20px;
          text-align: center;
          font-size: 11px;
          color: #4b5563;
          border-top: 1px solid #14532d;
        }
        .footer a {
          color: #22c55e;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GUERREROS AYOTLA</h1>
          <p>Fútbol Rápido Tribol</p>
        </div>
        <div class="content">
          <div class="welcome">
            Hola <strong>${reservation.userName}</strong>,<br><br>
            ¡Tu reservación de cancha ha sido registrada de manera exitosa! A continuación te proporcionamos tu comprobante oficial y los detalles de acceso al complejo deportivo.
          </div>

          <div class="details-card">
            <div class="details-row">
              <span class="details-label">ID de Reserva</span>
              <span class="details-value" style="font-family: monospace;">${reservation.id}</span>
            </div>
            <div class="details-row">
              <span class="details-label">🏟️ Cancha</span>
              <span class="details-value">${reservation.fieldName}</span>
            </div>
            <div class="details-row">
              <span class="details-label">📅 Fecha</span>
              <span class="details-value">${reservation.date}</span>
            </div>
            <div class="details-row">
              <span class="details-label">⏰ Horario</span>
              <span class="details-value">${reservation.timeSlot} (${reservation.duration} hrs)</span>
            </div>
            <div class="details-row">
              <span class="details-label">💡 Alumbrado</span>
              <span class="details-value">${reservation.hasLights ? 'Sí (Incluido)' : 'No'}</span>
            </div>
            <div class="details-row">
              <span class="details-label">📦 Adicionales</span>
              <span class="details-value">${extrasString}</span>
            </div>
            <div class="details-row">
              <span class="details-label">💰 Precio Total</span>
              <span class="details-value">$${reservation.totalPrice} MXN</span>
            </div>
            <div class="details-row">
              <span class="details-label">💳 Estatus</span>
              <span class="details-value" style="color: ${statusColor}; font-weight: 800;">${statusText}</span>
            </div>
          </div>

          <div class="code-box">
            <div class="code-label">CÓDIGO DE ENTRADA AL COMPLEJO</div>
            <div class="code-value">${reservation.entryCode || 'GA-XXXXXX'}</div>
            <div style="font-size: 11px; color: #a7f3d0; margin-top: 10px;">Presenta este código al ingresar a nuestras canchas en Ayotla.</div>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
            ¿Tienes alguna duda o necesitas reagendar? Ponte en contacto inmediato con administración.
          </p>

          <div class="button-wrapper">
            <a href="https://wa.me/5255483921" class="cta-button">Contactar Soporte WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 Club Guerreros Ayotla. Carretera Libre México-Puebla, Ixtapaluca.<br>
          Enviado automáticamente por el gestor de eventos de reservas.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends a booking confirmation email to the user's email address.
 * Standardizes on Resend API via Fetch or SMTP fallback (using Nodemailer).
 * If no API keys or SMTP configuration exists, it simulates sending perfectly in the console.
 */
export async function sendReservationEmail(reservation: Reservation): Promise<EmailSentResult> {
  const emailTo = reservation.userEmail;
  const emailFrom = process.env.EMAIL_FROM || 'Guerreros Ayotla <comprobantes@canchafutbol.com>';
  const resendApiKey = process.env.RESEND_API_KEY;

  // Render HTML template
  const emailHtml = generateReservationEmailTemplate(reservation);
  const emailSubject = `Confirmación de Reserva #${reservation.id} - Guerreros Ayotla`;

  // 1. Attempt to send via Resend API
  if (resendApiKey && typeof resendApiKey === 'string' && resendApiKey.startsWith('re_')) {
    try {
      console.log(`[EMAIL SERVICE]: Attempting to send confirmation email to ${emailTo} via Resend...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: emailFrom,
          to: emailTo,
          subject: emailSubject,
          html: emailHtml
        })
      });

      if (response.ok) {
        const body = await response.json();
        console.log(`[EMAIL SERVICE RESEND SUCCESS]: Email successful to ${emailTo}. ID: ${body.id}`);
        return {
          success: true,
          messageId: body.id,
          simulated: false
        };
      } else {
        const errText = await response.text();
        throw new Error(`Resend responded with code ${response.status}: ${errText}`);
      }
    } catch (err: any) {
      console.error('[EMAIL SERVICE RESEND FAIL]: Failed to send via Resend API. Falling back to simulations...', err);
    }
  }

  // 2. Attempt to send via SMTP if configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`[EMAIL SERVICE]: Attempting SMTP transmission for ${emailTo} via ${smtpHost}...`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to: emailTo,
        subject: emailSubject,
        html: emailHtml
      });

      console.log(`[EMAIL SERVICE SMTP SUCCESS]: Email secure sent. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        simulated: false
      };
    } catch (err: any) {
      console.error('[EMAIL SERVICE SMTP FAIL]: Failed configured SMTP transmission.', err);
    }
  }

  // 3. Simulated Transactional Email Fallback
  console.warn(`[EMAIL WARNING]: No valid RESEND_API_KEY or SMTP configuration found. Simulating transaction...`);
  console.log(`
========================================================================
SIMULANDO ENVÍO DE COMPROBANTE DE CORREO ELECTRÓNICO ELECTRÓNICO
========================================================================
DE: ${emailFrom}
PARA: ${emailTo}
ASUNTO: ${emailSubject}
------------------------------------------------------------------------
(Verifique el formato HTML renderizado en su carátula virtual / bandeja)
========================================================================
  `);

  return {
    success: true,
    simulated: true,
    error: 'API no configurada. Transmisión de correo simulada en consola para pruebas.'
  };
}

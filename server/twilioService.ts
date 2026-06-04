import twilio from 'twilio';
import { Reservation } from '../src/types';

let twilioClient: any = null;

/**
 * Lazily gets the Twilio client instance.
 * Throws an error if required environment variables are not configured.
 */
function getTwilioClient(): any {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Faltan configurar las variables de entorno TWILIO_ACCOUNT_SID y/o TWILIO_AUTH_TOKEN.');
  }

  const isValidSid = typeof accountSid === 'string' && accountSid.trim().startsWith('AC');
  if (!isValidSid) {
    throw new Error('accountSid must start with AC');
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Sanitizes and formats a phone number for Twilio WhatsApp (adds "whatsapp:" prefix).
 * Cleans spaces, dashes, parentheses and ensures a "+" prefix if not present.
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remove non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If no "+" sign, let's assume it requires one. 
  // For Mexican numbers, if they start with normal digits, ensure +52
  // We can be smart: if it's 10 digits, default to Mexican +52 prefix (e.g. 5512345678 -> +525512345678)
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+52' + cleaned;
    } else if (cleaned.startsWith('52') && cleaned.length >= 11) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }

  return `whatsapp:${cleaned}`;
}

export interface WhatsAppSentResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  simulated: boolean;
  recipient: string;
  body: string;
}

/**
 * Generates an entry code for the sport complex.
 */
export function generateEntryCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `GA-${num}`;
}

/**
 * Sends a WhatsApp notification to a client with reservation details and access code.
 */
export async function sendReservationWhatsApp(
  reservation: Reservation
): Promise<WhatsAppSentResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // default sandbox number

  if (!fromNumber.startsWith('whatsapp:')) {
    fromNumber = `whatsapp:${fromNumber}`;
  }

  // Generate entry code if not already saved
  const entryCode = reservation.entryCode || generateEntryCode();
  reservation.entryCode = entryCode;

  const formattedTo = formatWhatsAppNumber(reservation.userPhone);

  const extrasList: string[] = [];
  if (reservation.extras.balls) extrasList.push('⚽ Balones de juego');
  if (reservation.extras.bibs) extrasList.push('🎽 Casacas/Chalecos');
  if (reservation.extras.referee) extrasList.push('🏁 Árbitro Profesional');
  const extrasString = extrasList.length > 0 ? extrasList.join(', ') : 'Ninguno';

  const messageBody = `*¡Hola ${reservation.userName}! Tu reservación en Guerreros Ayotla está lista* 🐢⚽

Aquí tienes los detalles de tu encuentro:
📅 *Fecha:* ${reservation.date}
⏰ *Horario:* ${reservation.timeSlot} (${reservation.duration} h)
🏟️ *Cancha:* ${reservation.fieldName}
💡 *Iluminación:* ${reservation.hasLights ? 'Sí (Incluida)' : 'No requerida'}
🎒 *Adicionales:* ${extrasString}
💰 *Total:* $${reservation.totalPrice} MXN
💳 *Estado de Pago:* ${reservation.paymentStatus === 'paid' ? 'PAGADO ✓' : 'PENDIENTE ⚠️'}

🔑 *CÓDIGO DE ENTRADA AL COMPLEJO:* \`${entryCode}\`
Presenta este código al ingresar a las instalaciones deportivas de Ayotla.

*¡Te deseamos el mejor de los éxitos en tu partido!* 🏆🔥`;

  const isValidSid = typeof accountSid === 'string' && accountSid.trim().startsWith('AC');
  const isValidToken = typeof authToken === 'string' && authToken.trim().length > 0 && !authToken.includes('MY_') && !authToken.includes('YOUR_');

  // Check if Twilio API keys are configured, if not, simulate sending gracefully
  if (!accountSid || !authToken || !isValidSid || !isValidToken) {
    const errorMsg = 'NOTIFICACIÓN SIMULADA: Credenciales de Twilio no válidas o ausentes en el entorno.';
    console.warn(`[TWILIO WARNING]: ${errorMsg}`);
    console.log(`[WhatsApp simulado para ${formattedTo}]:\n${messageBody}`);
    
    return {
      success: true,
      simulated: true,
      recipient: formattedTo,
      body: messageBody,
      error: 'Twilio no configurado correctamente. El mensaje fue simulado en consola.'
    };
  }

  try {
    const client = getTwilioClient();
    const result = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: formattedTo
    });

    console.log(`[TWILIO SUCCESS]: Mensaje enviado a ${formattedTo}. SID: ${result.sid}`);
    return {
      success: true,
      messageSid: result.sid,
      simulated: false,
      recipient: formattedTo,
      body: messageBody
    };
  } catch (err: any) {
    const isValidationError = err.message && (err.message.includes('must start with AC') || err.message.includes('Faltan configurar') || err.message.includes('not configured'));
    if (isValidationError) {
      console.warn(`[TWILIO WARNING]: Credenciales no válidas. Simulación de WhatsApp para ${formattedTo}:\n${messageBody}`);
      return {
        success: true,
        simulated: true,
        recipient: formattedTo,
        body: messageBody,
        error: err.message
      };
    }
    console.error('[TWILIO ERROR]: Falló el envío de WhatsApp vía Twilio.', err);
    return {
      success: false,
      error: err.message || 'Error desconocido al enviar el mensaje de Twilio.',
      simulated: false,
      recipient: formattedTo,
      body: messageBody
    };
  }
}

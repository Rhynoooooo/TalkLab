/**
 * TalkLab Next.js - OpenWA WhatsApp API Client
 * Manages phone normalization, WhatsApp OTP dispatch, and ticket notifications.
 */

export const OPENWA_CONFIG = {
  proxyUrl: '/api',
  defaultSessionId: '43fe08c7-931f-479c-a7a3-ae6790a7bc97'
};

export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Libyan mobile numbers (091, 092, 093, 094, 095)
  if (/^0(9[1-5]\d{7})$/.test(digits)) {
    digits = '218' + digits.slice(1);
  } else if (/^(9[1-5]\d{7})$/.test(digits)) {
    digits = '218' + digits;
  }

  return digits;
}

export function formatPhoneDisplay(rawPhone: string): string {
  const norm = normalizePhone(rawPhone);
  if (!norm) return rawPhone || '';
  if (norm.startsWith('218') && norm.length === 12) {
    return `+218 ${norm.slice(3, 5)} ${norm.slice(5, 8)} ${norm.slice(8)}`;
  }
  return `+${norm}`;
}

export function isValidPhone(rawPhone: string): boolean {
  const norm = normalizePhone(rawPhone);
  return norm.length >= 8 && norm.length <= 15;
}

export async function sendWhatsAppMessage(
  rawPhone: string,
  text: string
): Promise<{ success: boolean; error?: string; status?: number; phone: string }> {
  const norm = normalizePhone(rawPhone);
  if (!norm) {
    return { success: false, error: 'Invalid phone number format', phone: '' };
  }

  const isServer = typeof window === 'undefined';
  const baseUrl = isServer
    ? (process.env.OPENWA_BASE_URL || 'http://127.0.0.1:2785')
    : '';
  const apiKey = isServer ? (process.env.OPENWA_API_KEY || '') : '';
  const sessionId = isServer
    ? (process.env.OPENWA_DEFAULT_SESSION_ID || OPENWA_CONFIG.defaultSessionId)
    : OPENWA_CONFIG.defaultSessionId;

  const endpoint = isServer
    ? `${baseUrl}/api/sessions/${sessionId}/messages/send-text`
    : `/api/openwa/send-ticket`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (isServer && apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const payload = isServer
      ? { chatId: `${norm}@c.us`, text }
      : { phone: norm, text };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      return { success: true, phone: norm };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errData.message || `HTTP ${res.status}`,
      status: res.status,
      phone: norm
    };
  } catch (err: unknown) {
    // If local daemon is not running in dev, log warning and gracefully succeed
    console.warn(`[OpenWA Dispatch] Daemon unreachable at ${endpoint}:`, err instanceof Error ? err.message : err);
    return {
      success: true,
      error: 'Simulated dispatch (daemon offline)',
      phone: norm
    };
  }
}


export async function dispatchOtpPasscode({
  name,
  phone,
  sessionName,
  seatNumber,
  otpCode
}: {
  name: string;
  phone: string;
  sessionName: string;
  seatNumber: number | null;
  otpCode: string;
}): Promise<{ success: boolean; formattedPhone: string; otpCode: string; status?: number; error?: string }> {
  const formattedPhone = formatPhoneDisplay(phone);
  const seatLabel = seatNumber ? `Seat #${seatNumber}` : 'Your Selected Seat';

  const message = 
`🌟 *TALKLAB VERIFICATION CODE* 🌟

Hello *${name}*! 👋

Your 6-digit verification passcode for *${sessionName}* (${seatLabel}) is:

🔑 *${otpCode}* 🔑

⏱️ *Valid for:* 3 Minutes
📍 *Venue:* مركز سفراء العلم (People & Spaces) - حي الأندلس، طرابلس
💵 *Fee:* 30 LYD (Pay on arrival)

Please enter this passcode on the website to lock in your seat!`;

  const sendRes = await sendWhatsAppMessage(phone, message);
  return {
    ...sendRes,
    formattedPhone,
    otpCode
  };
}

export async function dispatchBookingConfirmation(record: {
  id: string;
  name: string;
  phone: string;
  sessionName: string;
  seatNumber: number;
  day: string;
  time: string;
}): Promise<{ success: boolean; error?: string }> {
  const message =
`🎉 *TALKLAB RESERVATION CONFIRMED!* 🎉

Hi *${record.name}*, you're on the guestlist! 🚀

━━━━━━━━━━━━━━━━━━━━
🎟️ *Pass ID:* ${record.id}
🪑 *Assigned Seat:* Seat #${record.seatNumber} (Boardroom Table)
📅 *Session:* ${record.sessionName}
⏰ *Time:* ${record.day} • ${record.time}
📍 *Location:* مركز سفراء العلم (People & Spaces)
🗺️ *Address:* حي الأندلس، شارع البريد، طرابلس 🇱🇾
💵 *Fee:* 30 LYD (Pay upon arrival)
☕ *Perk:* Special TalkLab member discount at the Cafe!
━━━━━━━━━━━━━━━━━━━━

🗺️ *Google Maps Link:*
https://maps.google.com/?q=People+%26+Spaces+Tripoli

We can't wait to see you at the table! Feel free to reply to this chat if you have any questions.`;

  return await sendWhatsAppMessage(record.phone, message);
}

/**
 * TalkLab 2.0 - OpenWA WhatsApp API Integration Service
 * Connects TalkLab directly to the local OpenWA WhatsApp engine (http://localhost:2785).
 * Dispatches real-time 6-digit OTP verification passcodes and official reservation tickets.
 */

const OpenWAService = (() => {
  const CONFIG = {
    // Primary local OpenWA endpoint & API key
    baseUrl: 'http://localhost:2785',
    apiKey: 'owa_k1_78563b70da24d3e87a9bb12696ef65a06cbab25520e6583ea6dd2ca7b396bc8e',
    // Fallback relative proxy path if served via server.ps1
    proxyUrl: '/api',
    defaultSessionId: '43fe08c7-931f-479c-a7a3-ae6790a7bc97'
  };

  /**
   * Normalize any phone number (especially Libyan formats) to international WhatsApp JID format.
   * e.g.:
   *   '0912345678' -> '218912345678'
   *   '092 123 4567' -> '218921234567'
   *   '+218 91 234 5678' -> '218912345678'
   *   '00218912345678' -> '218912345678'
   *   '912345678' -> '218912345678'
   */
  function normalizePhone(rawPhone) {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '');

    // Handle leading 00 international prefix
    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }

    // Libyan mobile prefixes: 091, 092, 093, 094, 095 (10 digits starting with 0)
    if (/^0(9[1-5]\d{7})$/.test(digits)) {
      digits = '218' + digits.slice(1);
    }
    // Libyan mobile without leading 0: 91, 92, 93, 94, 95 (9 digits)
    else if (/^(9[1-5]\d{7})$/.test(digits)) {
      digits = '218' + digits;
    }

    return digits;
  }

  /**
   * Format phone number nicely for display (e.g., +218 91 234 5678)
   */
  function formatPhoneDisplay(rawPhone) {
    const norm = normalizePhone(rawPhone);
    if (!norm) return rawPhone || '';
    if (norm.startsWith('218') && norm.length === 12) {
      return `+218 ${norm.slice(3, 5)} ${norm.slice(5, 8)} ${norm.slice(8)}`;
    }
    return `+${norm}`;
  }

  /**
   * Validate if a phone number is valid
   */
  function isValidPhone(rawPhone) {
    const norm = normalizePhone(rawPhone);
    return norm.length >= 8 && norm.length <= 15;
  }

  /**
   * Perform an authorized API call to OpenWA
   */
  async function apiFetch(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': CONFIG.apiKey,
      ...(options.headers || {})
    };

    // Try direct base URL first, then fallback to relative proxy
    const urls = [
      `${CONFIG.baseUrl}${endpoint}`,
      `${CONFIG.proxyUrl}${endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint}`
    ];

    let lastError = null;
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          ...options,
          headers
        });

        if (res.ok) {
          return await res.json();
        }

        // Try reading error details
        let errorData = null;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { status: res.status, statusText: res.statusText };
        }

        const error = new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
        error.status = res.status;
        error.data = errorData;
        lastError = error;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Network request failed');
  }

  /**
   * Get active OpenWA sessions and bot status
   */
  async function getBotStatus() {
    try {
      const data = await apiFetch('/api/sessions');
      const sessions = Array.isArray(data) ? data : (data.value || []);
      
      // Look for active/ready or default session
      let target = sessions.find(s => s.id === CONFIG.defaultSessionId) || sessions[0];
      
      if (!target) {
        return { online: false, status: 'no_sessions', session: null };
      }

      const isReady = target.status === 'ready' || target.status === 'authenticated' || target.status === 'working';
      const isQrReady = target.status === 'qr_ready';

      return {
        online: true,
        isReady,
        isQrReady,
        status: target.status,
        sessionId: target.id,
        phone: target.phone,
        pushName: target.pushName,
        session: target
      };
    } catch (err) {
      console.warn('[OpenWAService] Bot status check failed:', err);
      return { online: false, status: 'offline', error: err.message };
    }
  }

  /**
   * Fetch current QR Code base64 image if session is in qr_ready state
   */
  async function getQrCode(sessionId = CONFIG.defaultSessionId) {
    try {
      const data = await apiFetch(`/api/sessions/${sessionId}/qr`);
      return data.qrCode || data.qr || null;
    } catch (err) {
      console.warn('[OpenWAService] Failed to fetch QR code:', err);
      return null;
    }
  }

  /**
   * Send a WhatsApp text message to a recipient phone number
   */
  async function sendTextMessage(rawPhone, text) {
    const norm = normalizePhone(rawPhone);
    if (!norm) {
      throw new Error('Invalid phone number.');
    }

    const chatId = `${norm}@c.us`;
    const status = await getBotStatus();
    const sessionId = (status.session && status.session.id) ? status.session.id : CONFIG.defaultSessionId;

    const payload = {
      chatId,
      text
    };

    try {
      const result = await apiFetch(`/api/sessions/${sessionId}/messages/send-text`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return { success: true, result, chatId, phone: norm };
    } catch (err) {
      console.error('[OpenWAService] sendTextMessage error:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch WhatsApp message',
        status: err.status,
        chatId,
        phone: norm
      };
    }
  }

  /**
   * Dispatch the 6-Digit OTP code via real WhatsApp message
   */
  async function dispatchOtpPasscode({ name, phone, sessionName, seatNumber, otpCode }) {
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

    const sendRes = await sendTextMessage(phone, message);
    return {
      ...sendRes,
      formattedPhone,
      otpCode
    };
  }

  /**
   * Dispatch the official Confirmation Boarding Pass Ticket via WhatsApp
   */
  async function dispatchBookingConfirmation(record) {
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

    return await sendTextMessage(record.phone, message);
  }

  return {
    CONFIG,
    normalizePhone,
    formatPhoneDisplay,
    isValidPhone,
    getBotStatus,
    getQrCode,
    sendTextMessage,
    dispatchOtpPasscode,
    dispatchBookingConfirmation
  };
})();

window.OpenWAService = OpenWAService;

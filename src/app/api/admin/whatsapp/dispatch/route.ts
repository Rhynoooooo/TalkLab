import { NextRequest, NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';

const OPENWA_TARGET = process.env.OPENWA_BASE_URL || 'http://127.0.0.1:2785';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'owa_k1_78563b70da24d3e87a9bb12696ef65a06cbab25520e6583ea6dd2ca7b396bc8e';
const DEFAULT_SESSION_ID = process.env.OPENWA_DEFAULT_SESSION_ID || '43fe08c7-931f-479c-a7a3-ae6790a7bc97';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const moderatorId = req.headers.get('x-moderator-id') || 'facilitator';

  try {
    const body = await req.json();
    const { phone, text, type } = body;

    if (!phone || !text) {
      return NextResponse.json(
        { error: 'Recipient phone and message text are required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const normPhone = String(phone).replace(/\D/g, '');

    logAuditEvent({
      action: type === 'pass_resend' ? 'whatsapp_pass_resent' : 'whatsapp_broadcast_sent',
      status: 'SUCCESS',
      actorId: moderatorId,
      ip,
      details: {
        recipientPhone: normPhone,
        dispatchType: type || 'facilitator_direct_message',
        textLength: text.length
      }
    });

    const targetUrl = `${OPENWA_TARGET}/api/sessions/${DEFAULT_SESSION_ID}/messages/send-text`;

    try {
      const owaRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': OPENWA_API_KEY
        },
        body: JSON.stringify({
          chatId: `${normPhone}@c.us`,
          text
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (owaRes.ok) {
        const data = await owaRes.json().catch(() => ({}));
        return NextResponse.json({
          success: true,
          message: 'WhatsApp dispatched via OpenWA Engine',
          data
        });
      }

      const errData = await owaRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errData.message || `OpenWA HTTP ${owaRes.status}`
        },
        { status: owaRes.status }
      );
    } catch (engineErr: unknown) {
      const msg = engineErr instanceof Error ? engineErr.message : 'OpenWA Engine unreachable';
      console.warn(`[WhatsApp Engine Dispatch] OpenWA unreachable at ${targetUrl}:`, msg);

      // In local demo without live WhatsApp device connected, return simulated delivery
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'OpenWA bot simulated delivery (Engine offline or standby on port 2785)',
        recipient: normPhone
      });
    }
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

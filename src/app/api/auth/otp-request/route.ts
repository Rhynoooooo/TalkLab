import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, formatPhoneDisplay } from '@/lib/auth/otp';
import { dispatchOtpPasscode } from '@/lib/openwa';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);

  try {
    const body = await req.json();
    const { phone, name, seatNumber, sessionName } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Valid phone number is required' },
        { status: 400 }
      );
    }

    // Generate cryptographically secure OTP with rate limiting
    const result = generateOtp(phone, {
      name: typeof name === 'string' ? name : undefined,
      seatNumber: typeof seatNumber === 'number' ? seatNumber : undefined,
      sessionName: typeof sessionName === 'string' ? sessionName : undefined
    });

    if (!result.allowed || !result.code) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate verification code' },
        { status: result.retryAfter ? 429 : 400 }
      );
    }

    logAuditEvent({
      action: 'login_attempt',
      status: 'SUCCESS',
      actorId: `member_${result.normPhone}`,
      ip,
      details: { phone: result.normPhone, name, seatNumber }
    });

    // Dispatch via WhatsApp OpenWA Engine
    try {
      await dispatchOtpPasscode({
        name: name || 'TalkLab Attendee',
        phone: result.normPhone,
        sessionName: sessionName || 'TalkLab Roundtable',
        seatNumber: seatNumber || null,
        otpCode: result.code
      });
    } catch (err: unknown) {
      console.warn('[OTP Dispatch Warning] OpenWA WhatsApp dispatch error (simulated):', err);
    }

    const formattedPhone = formatPhoneDisplay(result.normPhone);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${formattedPhone} via WhatsApp.`,
      phone: result.normPhone,
      formattedPhone,
      // For local development or preview environments where OpenWA bot isn't connected to a live phone
      devOtpHint: process.env.NODE_ENV !== 'production' ? result.code : undefined
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

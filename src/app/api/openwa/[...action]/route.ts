import { NextRequest, NextResponse } from 'next/server';
import { validateOrigin } from '@/lib/csrf';
import { extractClientIp, checkRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';
import { generateOtp, verifyAndConsumeOtp, isLibyanMobile, formatPhoneDisplay } from '@/lib/auth/otp';
import { createSession, getSession } from '@/lib/auth/session';
import { dispatchOtpPasscode, dispatchBookingConfirmation, normalizePhone } from '@/lib/openwa';

const ALLOWED_ACTIONS = ['send-otp', 'verify-otp', 'send-ticket'] as const;
type AllowedAction = typeof ALLOWED_ACTIONS[number];

/**
 * Next.js API Proxy Route for OpenWA WhatsApp Gateway
 * Strict allowlisting, SSRF prevention, and rate-limiting.
 * Direct port 2785 is NEVER exposed to public traffic.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const ip = extractClientIp(req.headers);
  const { action: actionSegments } = await params;

  // 1. Path Traversal & Action Validation Guard
  if (!actionSegments || actionSegments.length !== 1) {
    return NextResponse.json(
      { error: 'Invalid API route. Exactly one action segment required.' },
      { status: 400 }
    );
  }

  const rawAction = actionSegments[0];

  // Block path traversal / encoding tricks
  if (
    rawAction.includes('..') ||
    rawAction.includes('/') ||
    rawAction.includes('\\') ||
    rawAction.includes('%2e') ||
    rawAction.includes('%2f')
  ) {
    logAuditEvent({
      action: 'security_alert',
      status: 'BLOCKED',
      ip,
      details: { reason: 'PATH_TRAVERSAL_ATTEMPT', rawAction }
    });
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403 });
  }

  if (!ALLOWED_ACTIONS.includes(rawAction as AllowedAction)) {
    return NextResponse.json(
      {
        error: `Action '${rawAction}' is not permitted. Allowed actions: ${ALLOWED_ACTIONS.join(', ')}`,
        code: 'ACTION_NOT_ALLOWED'
      },
      { status: 403 }
    );
  }

  const action = rawAction as AllowedAction;

  // 2. CSRF & Origin Validation
  const originCheck = validateOrigin(req.headers);
  if (!originCheck.valid) {
    return NextResponse.json(
      { error: 'CSRF security rejection', reason: originCheck.reason },
      { status: 403 }
    );
  }

  // 3. Rate Limiting by IP
  const rateStatus = checkRateLimit(ip);
  if (!rateStatus.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.', retryAfter: rateStatus.resetInSeconds },
      { status: 429 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  // 4. Action Handlers with Strict Schemas
  switch (action) {
    case 'send-otp': {
      const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : 'TalkLab Attendee';
      const seatNumber = typeof body.seatNumber === 'number' ? body.seatNumber : null;
      const sessionName = typeof body.sessionName === 'string' ? body.sessionName : 'TalkLab Roundtable';

      if (!phone || (!isLibyanMobile(phone) && !/^\d{8,15}$/.test(normalizePhone(phone)))) {
        return NextResponse.json(
          { error: 'Valid Libyan mobile number required (091, 092, 093, 094, 095)' },
          { status: 400 }
        );
      }

      const otpResult = generateOtp(phone, {
        name,
        seatNumber: seatNumber || undefined,
        sessionName
      });

      if (!otpResult.allowed || !otpResult.code) {
        return NextResponse.json(
          { error: otpResult.error || 'Failed to generate passcode' },
          { status: otpResult.retryAfter ? 429 : 400 }
        );
      }

      // Dispatch via WhatsApp Daemon
      let dispatchSuccess = false;
      try {
        const dispatchRes = await dispatchOtpPasscode({
          name,
          phone: otpResult.normPhone,
          sessionName,
          seatNumber,
          otpCode: otpResult.code
        });
        dispatchSuccess = dispatchRes.success;
      } catch (err) {
        console.warn('[OpenWA Proxy] WhatsApp dispatch exception:', err);
      }

      return NextResponse.json({
        success: true,
        action: 'send-otp',
        phone: otpResult.normPhone,
        formattedPhone: formatPhoneDisplay(otpResult.normPhone),
        dispatched: dispatchSuccess,
        devOtpHint: process.env.NODE_ENV !== 'production' ? otpResult.code : undefined
      });
    }

    case 'verify-otp': {
      const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
      const otp = typeof body.otp === 'string' ? body.otp.trim() : '';

      if (!phone || otp.length !== 6) {
        return NextResponse.json(
          { error: 'Phone and 6-digit OTP code are required' },
          { status: 400 }
        );
      }

      const verifyResult = verifyAndConsumeOtp(phone, otp, ip);
      if (!verifyResult.success) {
        return NextResponse.json(
          { error: verifyResult.error || 'Passcode verification failed' },
          { status: 401 }
        );
      }

      const { normPhone, metadata } = verifyResult;
      const response = NextResponse.json({
        success: true,
        action: 'verify-otp',
        user: {
          role: 'member',
          userId: `member_${normPhone}`,
          phone: normPhone,
          name: metadata?.name || 'TalkLab Attendee',
          seatNumber: metadata?.seatNumber
        }
      });

      await createSession(
        {
          role: 'member',
          userId: `member_${normPhone}`,
          phone: normPhone,
          name: metadata?.name || 'TalkLab Attendee',
          seatNumber: metadata?.seatNumber,
          sessionName: metadata?.sessionName
        },
        response
      );

      return response;
    }

    case 'send-ticket': {
      // Must have valid session or admin role
      const session = await getSession(req);
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required to dispatch ticket' },
          { status: 401 }
        );
      }

      const ticket = body.ticket as Record<string, unknown>;
      if (!ticket || typeof ticket.phone !== 'string' || typeof ticket.seatNumber !== 'number') {
        return NextResponse.json(
          { error: 'Valid ticket metadata required' },
          { status: 400 }
        );
      }

      // If member, ensure they are sending their own ticket
      if (session.role === 'member' && session.phone !== normalizePhone(ticket.phone as string)) {
        return NextResponse.json(
          { error: 'Unauthorized: cannot dispatch tickets for another phone number' },
          { status: 403 }
        );
      }

      const sendRes = await dispatchBookingConfirmation({
        id: String(ticket.id || `TL-PASS-${ticket.seatNumber}`),
        name: String(ticket.name || 'Member'),
        phone: String(ticket.phone),
        sessionName: String(ticket.sessionName || 'TalkLab Roundtable'),
        seatNumber: Number(ticket.seatNumber),
        day: String(ticket.day || 'Every Saturday'),
        time: String(ticket.time || '12:00 PM – 4:00 PM')
      });

      return NextResponse.json({
        success: sendRes.success,
        action: 'send-ticket',
        error: sendRes.error
      });
    }

    default:
      return NextResponse.json({ error: 'Action handler not found' }, { status: 404 });
  }
}

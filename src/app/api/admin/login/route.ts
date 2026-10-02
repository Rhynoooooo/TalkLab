import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSession } from '@/lib/auth/session';
import { verifyAdminPin, getAdminCookieOptions, createAdminSessionToken } from '@/lib/auth';
import {
  extractClientIp,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt
} from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // 1. Rate Limiting Check
  const rateStatus = checkRateLimit(ip);
  if (!rateStatus.allowed) {
    logAuditEvent({
      action: 'rate_limit_blocked',
      status: 'BLOCKED',
      ip,
      userAgent,
      details: {
        lockoutRemainingSeconds: rateStatus.lockoutRemainingSeconds,
        resetInSeconds: rateStatus.resetInSeconds
      }
    });

    return NextResponse.json(
      {
        error: 'Too many failed login attempts. Access temporarily locked for security.',
        retryAfter: rateStatus.lockoutRemainingSeconds || rateStatus.resetInSeconds,
        lockedOut: true
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateStatus.lockoutRemainingSeconds || rateStatus.resetInSeconds),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateStatus.resetInSeconds)
        }
      }
    );
  }

  // 2. Parse Request Payload
  let pin = '';
  try {
    const body = await req.json();
    pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!pin) {
    return NextResponse.json({ error: 'Passcode is required' }, { status: 400 });
  }

  // 3. Constant-Time Passcode Verification
  // Check against ADMIN_PORTAL_PIN (constant-time timingSafeEqual)
  const envPortalPin = process.env.ADMIN_PORTAL_PIN;
  let isPlainMatch = false;

  if (envPortalPin) {
    const hashA = crypto.createHash('sha256').update(pin).digest();
    const hashB = crypto.createHash('sha256').update(envPortalPin.trim()).digest();
    isPlainMatch = crypto.timingSafeEqual(hashA, hashB);
  }

  // Check against bcrypt hashes (ADMIN_PIN_HASH)
  const isHashMatch = verifyAdminPin(pin);
  const isAuthenticated = isPlainMatch || isHashMatch;

  if (!isAuthenticated) {
    const updatedStatus = recordFailedAttempt(ip, userAgent);
    logAuditEvent({
      action: 'login_failure',
      status: 'FAILURE',
      ip,
      userAgent,
      details: {
        remainingAttempts: updatedStatus.remainingAttempts,
        isLockedOut: updatedStatus.isLockedOut
      }
    });

    return NextResponse.json(
      {
        error: updatedStatus.isLockedOut
          ? 'Too many failed attempts. Account locked out for 15 minutes.'
          : 'Invalid facilitator passcode.',
        remainingAttempts: updatedStatus.remainingAttempts,
        lockedOut: updatedStatus.isLockedOut
      },
      {
        status: 401,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(updatedStatus.remainingAttempts),
          'X-RateLimit-Reset': String(updatedStatus.resetInSeconds)
        }
      }
    );
  }

  // 4. Successful Authentication
  recordSuccessfulAttempt(ip);

  logAuditEvent({
    action: 'login_success',
    status: 'SUCCESS',
    actorId: 'facilitator_lead',
    ip,
    userAgent
  });

  const response = NextResponse.json(
    {
      success: true,
      message: 'Facilitator session established',
      user: {
        role: 'admin',
        userId: 'facilitator_lead',
        name: 'Facilitator Lead',
        venue: 'People & Spaces (حـي الأندلـس)'
      }
    },
    {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '5'
      }
    }
  );

  // Set unified talklab_session cookie
  await createSession(
    {
      role: 'admin',
      userId: 'facilitator_lead',
      name: 'Facilitator Lead'
    },
    response
  );

  // Set backwards-compatible talklab_admin_session cookie
  const legacyToken = await createAdminSessionToken('facilitator_lead');
  const legacyOptions = getAdminCookieOptions();
  response.cookies.set(legacyOptions.name, legacyToken, legacyOptions);

  return response;
}

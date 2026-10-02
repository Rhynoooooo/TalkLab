import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
  getAdminCookieOptions
} from '@/lib/auth';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const ip = extractClientIp(req.headers);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const verification = await verifyAdminSessionToken(token);

  if (!verification.valid) {
    if (token) {
      logAuditEvent({
        action: 'session_verify_failure',
        status: 'WARNING',
        ip,
        userAgent,
        details: { reason: verification.reason }
      });
    }

    const response = NextResponse.json(
      {
        authenticated: false,
        reason: verification.reason || 'UNAUTHENTICATED'
      },
      { status: 401 }
    );

    // Clear stale or expired cookie
    const expiredCookieOptions = getAdminCookieOptions(0);
    response.cookies.set(expiredCookieOptions.name, '', expiredCookieOptions);

    return response;
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        role: verification.payload?.role,
        subject: verification.payload?.sub
      }
    },
    { status: 200 }
  );
}

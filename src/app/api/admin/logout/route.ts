import { NextRequest, NextResponse } from 'next/server';
import { getAdminCookieOptions } from '@/lib/auth';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  logAuditEvent({
    action: 'logout',
    status: 'SUCCESS',
    ip,
    userAgent
  });

  const response = NextResponse.json(
    {
      success: true,
      message: 'Facilitator session terminated securely'
    },
    { status: 200 }
  );

  const expiredCookieOptions = getAdminCookieOptions(0);
  response.cookies.set(expiredCookieOptions.name, '', expiredCookieOptions);

  // Invalidate unified RBAC session cookie
  response.cookies.set('talklab_session', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict'
  });

  return response;
}

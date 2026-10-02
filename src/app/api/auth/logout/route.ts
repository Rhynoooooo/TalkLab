import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth/session';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const session = await getSession(req);

  logAuditEvent({
    action: 'logout',
    status: 'SUCCESS',
    actorId: session?.userId || 'anonymous',
    ip,
    details: { role: session?.role }
  });

  const response = NextResponse.json(
    {
      success: true,
      message: 'Logged out successfully'
    },
    { status: 200 }
  );

  // Invalidate unified session cookie
  destroySession(response);

  // Invalidate legacy admin cookie if present
  response.cookies.set('talklab_admin_session', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict'
  });

  return response;
}

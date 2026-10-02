import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { validateOrigin } from '@/lib/csrf';

/**
 * Next.js 16 Edge Route Guard & RBAC Middleware
 * Intercepts all administrative paths and validates role-based permissions.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Bypass public auth routes
  if (
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/auth' ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  // 2. CSRF & Origin Validation for mutating HTTP methods on protected endpoints
  const isMutatingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase());
  if (isMutatingMethod) {
    const originCheck = validateOrigin(req.headers);
    if (!originCheck.valid) {
      return NextResponse.json(
        {
          error: 'CSRF security rejection: Origin header verification failed',
          reason: originCheck.reason,
          code: 'CSRF_REJECTED'
        },
        { status: 403 }
      );
    }
  }

  // 3. Extract Session Cookie (supports talklab_session and legacy fallback)
  const sessionCookie =
    req.cookies.get(SESSION_COOKIE_NAME)?.value ||
    req.cookies.get('talklab_admin_session')?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      {
        error: 'Authentication required. Facilitator session cookie missing.',
        code: 'UNAUTHORIZED'
      },
      { status: 401 }
    );
  }

  // 4. Verify Cryptographic Signature & Inactivity Timeout
  const session = await verifyToken(sessionCookie);

  if (!session) {
    const response = NextResponse.json(
      {
        error: 'Session expired or invalid. Please log in again.',
        code: 'SESSION_EXPIRED'
      },
      { status: 401 }
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    response.cookies.delete('talklab_admin_session');
    return response;
  }

  // 5. Enforce Admin / Facilitator Role (RBAC)
  if (session.role !== 'admin') {
    return NextResponse.json(
      {
        error: 'Forbidden: Insufficient privileges. Facilitator role required.',
        code: 'ROLE_MISMATCH',
        currentRole: session.role
      },
      { status: 403 }
    );
  }

  // 6. Inject Verified Security Headers into downstream handler
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-user-role', session.role);
  requestHeaders.set('x-moderator-id', session.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*'
  ]
};

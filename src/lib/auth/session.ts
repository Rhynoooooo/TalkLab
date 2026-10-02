/**
 * TalkLab 2.0 - Unified Role-Based Access Control (RBAC) Session Engine
 * Built with `jose` for Edge-compatible JWT signing and verification.
 * 
 * Supports:
 * - Role 'admin': Facilitators managing boardroom seats, check-ins, and OpenWA WhatsApp bot.
 * - Role 'member': Attendees accessing digital boarding passes, reservations, and stats.
 */

import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import type { UserRole, SessionPayload } from './types';

export type { UserRole, SessionPayload };

export const SESSION_COOKIE_NAME = 'talklab_session';

// Inactivity timeouts
export const ADMIN_SESSION_MAX_AGE_SECONDS = 7200; // 2 hours for facilitators
export const MEMBER_SESSION_MAX_AGE_SECONDS = 604800; // 7 days for attendees

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[CRITICAL] Missing SESSION_JWT_SECRET in production. Minimum 32 characters required.');
    }
    return new TextEncoder().encode('talklab-production-fallback-secret-key-32-chars-minimum!');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs and issues a cryptographically secure JWT token with role claims.
 */
export async function signToken(
  payload: Omit<SessionPayload, 'lastActive' | 'iat' | 'exp'>,
  maxAgeSeconds?: number
): Promise<string> {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  const ttl = maxAgeSeconds || (payload.role === 'admin' ? ADMIN_SESSION_MAX_AGE_SECONDS : MEMBER_SESSION_MAX_AGE_SECONDS);

  return new SignJWT({
    ...payload,
    lastActive: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt(now)
    .setExpirationTime(`${ttl}s`)
    .sign(secret);
}

/**
 * Cryptographically verifies token and enforces inactivity timeout.
 */
export async function verifyToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    const typed = payload as unknown as SessionPayload;

    if (!typed.role || !typed.userId) {
      return null;
    }

    // Enforce role-specific inactivity timeout
    const now = Date.now();
    const maxInactivityMs = (typed.role === 'admin' ? ADMIN_SESSION_MAX_AGE_SECONDS : MEMBER_SESSION_MAX_AGE_SECONDS) * 1000;
    const lastActive = typed.lastActive || 0;

    if (lastActive && now - lastActive > maxInactivityMs) {
      return null;
    }

    return typed;
  } catch {
    return null;
  }
}

/**
 * Safe cookie options generator adhering to strict security flags.
 */
export function getCookieOptions(role: UserRole = 'member', maxAgeOverride?: number) {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = maxAgeOverride !== undefined 
    ? maxAgeOverride 
    : (role === 'admin' ? ADMIN_SESSION_MAX_AGE_SECONDS : MEMBER_SESSION_MAX_AGE_SECONDS);

  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    maxAge,
    path: '/'
  };
}

/**
 * Server-side helper to read session from Request cookies or Headers.
 */
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    try {
      const { cookies } = await import('next/headers');
      const store = await cookies();
      token = store.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // In non-request context
    }
  }

  return verifyToken(token);
}

/**
 * Server-side helper to attach a session cookie to an outgoing response.
 */
export async function createSession(
  payload: Omit<SessionPayload, 'lastActive' | 'iat' | 'exp'>,
  response: NextResponse
): Promise<string> {
  const token = await signToken(payload);
  const options = getCookieOptions(payload.role);
  response.cookies.set(options.name, token, options);
  return token;
}

/**
 * Server-side helper to invalidate the session across all subpaths.
 */
export function destroySession(response: NextResponse): NextResponse {
  const expiredOptions = getCookieOptions('member', 0);
  response.cookies.set(expiredOptions.name, '', expiredOptions);
  return response;
}

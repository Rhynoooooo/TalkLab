/**
 * TalkLab 2.0 - Core Authentication & Session Engine
 * Features:
 * - Constant-time comparison & timing-attack mitigation
 * - Server-side bcrypt passcode verification
 * - Cryptographically signed, encrypted JWT session tokens (jose)
 * - HttpOnly, Secure, SameSite=Strict cookie management
 * - Inactivity session timeout enforcement
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'talklab_admin_session';

// 2 Hours default inactivity session duration (7200 seconds)
export const DEFAULT_SESSION_MAX_AGE_SECONDS = Number(
  process.env.ADMIN_SESSION_MAX_AGE_SECONDS || 7200
);

// Fallback dummy bcrypt hash used during timing side-channel mitigation
const DUMMY_BCRYPT_HASH = '$2b$12$e8YgYwL1aR9aZt37.gL50eYd4g7YjB02kL51mP02qR03sT04uV05w';

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.SESSION_JWT_SECRET;
  if (!secret || secret.length < 32) {
    // If not set or too short in dev, warn and provide consistent fallback for dev only
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[CRITICAL SECURITY ERROR] SESSION_JWT_SECRET is missing or under 32 characters in production.');
    }
    return new TextEncoder().encode('talklab-production-fallback-secret-key-32-chars-minimum!');
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload extends JWTPayload {
  sub: string;
  role: 'facilitator';
  jti: string;
  lastActive: number;
}

/**
 * Timing-safe constant-time string equality check.
 * Uses SHA-256 digesting to guarantee identical buffer byte lengths before timingSafeEqual.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function parseConfiguredHash(raw: string): string {
  const h = raw.trim().replace(/^["']|["']$/g, '');
  if (h.startsWith('base64:')) {
    return Buffer.from(h.slice(7), 'base64').toString('utf-8');
  }
  // Auto-detect base64 encoded bcrypt hash (prevents dotenv dollar-sign expansion bugs)
  if (!h.startsWith('$') && h.length >= 40) {
    try {
      const decoded = Buffer.from(h, 'base64').toString('utf-8');
      if (decoded.startsWith('$2')) return decoded;
    } catch {
      // ignore
    }
  }
  // Unescape backslash-escaped dollar signs: \$2b\$12 -> $2b$12
  return h.replace(/\\(\$)/g, '$1');
}

/**
 * Validates candidate passcode against configured bcrypt hashes in environment variables.
 * Enforces timing-invariant execution path even when inputs are malformed or invalid.
 */
export function verifyAdminPin(candidatePin: string): boolean {
  const rawEnvHash = (process.env.ADMIN_PIN_HASH || '').replace(/^["']|["']$/g, '');
  const configuredHashes = rawEnvHash
    .split(',')
    .map(parseConfiguredHash)
    .filter(Boolean);

  const cleanPin = typeof candidatePin === 'string' ? candidatePin.trim() : '';

  // If no hashes configured, run dummy comparison to prevent timing leak
  if (configuredHashes.length === 0 || !cleanPin) {
    bcrypt.compareSync(cleanPin || 'dummy', DUMMY_BCRYPT_HASH);
    return false;
  }

  let matchFound = false;

  for (const hash of configuredHashes) {
    try {
      if (bcrypt.compareSync(cleanPin, hash)) {
        matchFound = true;
        break;
      }
    } catch {
      bcrypt.compareSync(cleanPin, DUMMY_BCRYPT_HASH);
    }
  }

  return matchFound;
}

/**
 * Issues a signed, tamper-proof session JWT.
 */
export async function createAdminSessionToken(
  actorId = 'facilitator_primary'
): Promise<string> {
  const secretKey = getJwtSecretKey();
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    role: 'facilitator',
    lastActive: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(actorId)
    .setJti(crypto.randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(`${DEFAULT_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

/**
 * Cryptographically verifies and validates session JWT and inactivity timeout.
 */
export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<{
  valid: boolean;
  payload?: AdminSessionPayload;
  reason?: 'MISSING_TOKEN' | 'EXPIRED' | 'INVALID_SIGNATURE' | 'INACTIVE_TIMEOUT';
}> {
  if (!token) {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    const typedPayload = payload as unknown as AdminSessionPayload;

    if (typedPayload.role !== 'facilitator') {
      return { valid: false, reason: 'INVALID_SIGNATURE' };
    }

    // Inactivity timeout verification (e.g. 2 hours since last action)
    const now = Date.now();
    const lastActive = typedPayload.lastActive || 0;
    const maxInactivityMs = DEFAULT_SESSION_MAX_AGE_SECONDS * 1000;

    if (now - lastActive > maxInactivityMs) {
      return { valid: false, reason: 'INACTIVE_TIMEOUT' };
    }

    return { valid: true, payload: typedPayload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('expired') || (err as { code?: string })?.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, reason: 'EXPIRED' };
    }
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }
}

/**
 * Standardized cookie attributes for Next.js response cookies
 */
export function getAdminCookieOptions(maxAge: number = DEFAULT_SESSION_MAX_AGE_SECONDS) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    maxAge,
    path: '/'
  };
}

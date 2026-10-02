/**
 * TalkLab 2.0 - Sliding Window Rate Limiter & Subnet Lockout Engine
 * Defends against brute-force, password-spraying, and PIN enumeration attacks.
 */

import { logAuditEvent } from './auditLogger';

interface RateLimitRecord {
  failures: number[];
  lockoutUntil: number | null;
  lockoutCount: number;
}

// In-memory sliding window cache (can be swapped with Redis / Upstash in clustered deployments)
const ipRateLimitStore = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS || 5);
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000;
const BASE_LOCKOUT_MS = Number(process.env.RATE_LIMIT_LOCKOUT_MINUTES || 15) * 60 * 1000;

/**
 * Normalizes an IP address into its subnet representation
 * IPv4 -> /24 subnet (e.g. 203.0.113.42 -> 203.0.113.0/24)
 * IPv6 -> /64 prefix
 */
export function getSubnetKey(ip: string): string {
  const cleanIp = ip.trim().split(',')[0].trim();

  // IPv4 normalization
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
  }

  // IPv6 normalization
  if (cleanIp.includes(':')) {
    const segments = cleanIp.split(':');
    return `${segments.slice(0, 4).join(':')}::/64`;
  }

  return cleanIp || '127.0.0.1';
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  resetInSeconds: number;
  lockoutRemainingSeconds: number;
  isLockedOut: boolean;
}

export function checkRateLimit(ip: string): RateLimitStatus {
  const now = Date.now();
  const subnet = getSubnetKey(ip);
  const record = ipRateLimitStore.get(subnet);

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      resetInSeconds: Math.ceil(WINDOW_MS / 1000),
      lockoutRemainingSeconds: 0,
      isLockedOut: false
    };
  }

  // Check active lockout
  if (record.lockoutUntil && record.lockoutUntil > now) {
    const lockoutRemainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      resetInSeconds: lockoutRemainingSeconds,
      lockoutRemainingSeconds,
      isLockedOut: true
    };
  }

  // Filter failures outside sliding window
  record.failures = record.failures.filter(timestamp => now - timestamp < WINDOW_MS);

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.failures.length);
  const oldestFailure = record.failures[0];
  const resetInSeconds = oldestFailure
    ? Math.ceil((oldestFailure + WINDOW_MS - now) / 1000)
    : Math.ceil(WINDOW_MS / 1000);

  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
    resetInSeconds,
    lockoutRemainingSeconds: 0,
    isLockedOut: false
  };
}

export function recordFailedAttempt(ip: string, userAgent?: string): RateLimitStatus {
  const now = Date.now();
  const subnet = getSubnetKey(ip);
  let record = ipRateLimitStore.get(subnet);

  if (!record) {
    record = { failures: [], lockoutUntil: null, lockoutCount: 0 };
    ipRateLimitStore.set(subnet, record);
  }

  // Filter expired failures
  record.failures = record.failures.filter(timestamp => now - timestamp < WINDOW_MS);
  record.failures.push(now);

  let isLockedOut = false;
  let lockoutRemainingSeconds = 0;

  // Progressive lockout defense (Exponential Backoff: 15m, 30m, 60m...)
  if (record.failures.length >= MAX_FAILED_ATTEMPTS) {
    record.lockoutCount += 1;
    const backoffMultiplier = Math.min(8, Math.pow(2, record.lockoutCount - 1));
    const lockoutDuration = BASE_LOCKOUT_MS * backoffMultiplier;
    record.lockoutUntil = now + lockoutDuration;
    isLockedOut = true;
    lockoutRemainingSeconds = Math.ceil(lockoutDuration / 1000);

    logAuditEvent({
      action: 'rate_limit_blocked',
      status: 'BLOCKED',
      ip,
      userAgent,
      details: {
        subnet,
        totalFailures: record.failures.length,
        lockoutCount: record.lockoutCount,
        lockoutDurationSeconds: lockoutRemainingSeconds,
        alert: true
      }
    });
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.failures.length);

  return {
    allowed: !isLockedOut && remaining > 0,
    remainingAttempts: isLockedOut ? 0 : remaining,
    resetInSeconds: lockoutRemainingSeconds || Math.ceil(WINDOW_MS / 1000),
    lockoutRemainingSeconds,
    isLockedOut
  };
}

export function recordSuccessfulAttempt(ip: string): void {
  const subnet = getSubnetKey(ip);
  // Reset sliding failures for clean operator experience upon valid authentication
  ipRateLimitStore.delete(subnet);
}

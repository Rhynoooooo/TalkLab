/**
 * TalkLab 2.0 - Member WhatsApp OTP Store & Verification Engine
 * Implements one-time passcode lifecycle, rate limiting, and replay prevention.
 */

import crypto from 'crypto';
import { normalizePhone, isValidPhone } from '@/lib/openwa';
import { logAuditEvent } from '@/lib/auditLogger';

interface StoredOtp {
  code: string;
  createdAt: number;
  attempts: number;
  name?: string;
  seatNumber?: number;
  sessionName?: string;
}

// In-memory OTP cache (phone -> OTP record)
const otpStore = new Map<string, StoredOtp>();

// Rate-limiting OTP requests (phone -> timestamps[])
const otpRequestThrottle = new Map<string, number[]>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per 10 minutes
const REQUEST_WINDOW_MS = 10 * 60 * 1000;

export { normalizePhone, isValidPhone };

/**
 * Flushes all pending OTPs and throttles (used during Admin Session Reset).
 */
export function clearAllOtps(): void {
  otpStore.clear();
  otpRequestThrottle.clear();
}

/**
 * Formats a normalized phone number for friendly UI display (+218 91 234 5678).
 */
export function formatPhoneDisplay(phone: string): string {
  const norm = normalizePhone(phone);
  if (norm.startsWith('218') && norm.length === 12) {
    return `+218 ${norm.slice(3, 5)} ${norm.slice(5, 8)} ${norm.slice(8)}`;
  }
  return phone.startsWith('+') ? phone : `+${norm}`;
}

/**
 * Validates if the phone number is a valid Libyan mobile (+218 9X XXXXXXX or 09X XXXXXXX)
 */
export function isLibyanMobile(phone: string): boolean {
  const norm = normalizePhone(phone);
  // Libyan format: 218 + 91/92/93/94/95 + 7 digits = 12 digits
  return /^2189[1-5]\d{7}$/.test(norm);
}

/**
 * Generates a cryptographically strong 6-digit OTP code and records it.
 */
export function generateOtp(
  rawPhone: string,
  metadata?: { name?: string; seatNumber?: number; sessionName?: string }
): { allowed: boolean; code?: string; normPhone: string; error?: string; retryAfter?: number } {
  const norm = normalizePhone(rawPhone);

  if (!isLibyanMobile(norm) && !isValidPhone(norm)) {
    return {
      allowed: false,
      normPhone: norm,
      error: 'Please enter a valid Libyan mobile number (e.g. 091 234 5678 or +218 91 234 5678)'
    };
  }

  // Throttle check (prevent SMS/WhatsApp bombing)
  const now = Date.now();
  const requestHistory = (otpRequestThrottle.get(norm) || []).filter(
    ts => now - ts < REQUEST_WINDOW_MS
  );

  if (requestHistory.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = requestHistory[0];
    const retryAfter = Math.ceil((oldest + REQUEST_WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      normPhone: norm,
      error: `Too many OTP requests. Please wait ${Math.ceil(retryAfter / 60)} minutes before requesting another code.`,
      retryAfter
    };
  }

  requestHistory.push(now);
  otpRequestThrottle.set(norm, requestHistory);

  // Generate 6-digit numerical code
  const code = crypto.randomInt(100000, 999999).toString();

  otpStore.set(norm, {
    code,
    createdAt: now,
    attempts: 0,
    name: metadata?.name,
    seatNumber: metadata?.seatNumber,
    sessionName: metadata?.sessionName
  });

  return { allowed: true, code, normPhone: norm };
}

/**
 * Verifies and atomically consumes the OTP code (Replay Attack Defense).
 */
export function verifyAndConsumeOtp(
  rawPhone: string,
  candidateCode: string,
  ip = '127.0.0.1'
): {
  success: boolean;
  error?: string;
  normPhone: string;
  metadata?: { name?: string; seatNumber?: number; sessionName?: string };
} {
  const norm = normalizePhone(rawPhone);
  const record = otpStore.get(norm);
  const now = Date.now();

  if (!record) {
    logAuditEvent({
      action: 'login_failure',
      status: 'FAILURE',
      ip,
      details: { phone: norm, reason: 'OTP_NOT_FOUND_OR_EXPIRED' }
    });
    return {
      success: false,
      normPhone: norm,
      error: 'No active verification code found for this number. Please request a new code.'
    };
  }

  // Check TTL expiration
  if (now - record.createdAt > OTP_TTL_MS) {
    otpStore.delete(norm);
    logAuditEvent({
      action: 'login_failure',
      status: 'FAILURE',
      ip,
      details: { phone: norm, reason: 'OTP_EXPIRED' }
    });
    return {
      success: false,
      normPhone: norm,
      error: 'Verification code has expired (valid for 5 minutes). Please request a new code.'
    };
  }

  // Constant-time check on candidate code
  const hashA = crypto.createHash('sha256').update(candidateCode.trim()).digest();
  const hashB = crypto.createHash('sha256').update(record.code).digest();
  const isMatch = crypto.timingSafeEqual(hashA, hashB);

  if (!isMatch) {
    record.attempts += 1;
    const remainingAttempts = MAX_VERIFY_ATTEMPTS - record.attempts;

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      // Invalidate immediately after 3 failed attempts
      otpStore.delete(norm);
      logAuditEvent({
        action: 'login_failure',
        status: 'BLOCKED',
        ip,
        details: { phone: norm, reason: 'MAX_OTP_ATTEMPTS_EXCEEDED' }
      });
      return {
        success: false,
        normPhone: norm,
        error: 'Too many incorrect attempts. This code has been invalidated. Please request a new code.'
      };
    }

    logAuditEvent({
      action: 'login_failure',
      status: 'FAILURE',
      ip,
      details: { phone: norm, remainingAttempts }
    });

    return {
      success: false,
      normPhone: norm,
      error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
    };
  }

  // OTP is valid -> CONSUME IMMEDIATELY to prevent replay attacks
  const metadata = {
    name: record.name,
    seatNumber: record.seatNumber,
    sessionName: record.sessionName
  };
  otpStore.delete(norm);

  logAuditEvent({
    action: 'login_success',
    status: 'SUCCESS',
    actorId: `member_${norm}`,
    ip,
    details: { phone: norm, metadata }
  });

  return {
    success: true,
    normPhone: norm,
    metadata
  };
}

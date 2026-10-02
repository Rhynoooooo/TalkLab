/**
 * TalkLab 2.0 - CSRF & Origin Validation Utility
 * Validates Origin/Host headers on mutating HTTP requests to prevent Cross-Site Request Forgery.
 */

export function validateOrigin(headers: Headers): { valid: boolean; reason?: string } {
  const origin = headers.get('origin');
  const referer = headers.get('referer');
  const host = headers.get('x-forwarded-host') || headers.get('host');

  // If no host can be identified, fail safely
  if (!host) {
    return { valid: false, reason: 'Missing Host header' };
  }

  // If Origin header is present (standard on mutating fetch/xhr/form requests)
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host.toLowerCase() === host.toLowerCase()) {
        return { valid: true };
      }
      return {
        valid: false,
        reason: `Origin mismatch: expected host "${host}", received "${originUrl.host}"`
      };
    } catch {
      return { valid: false, reason: 'Malformed Origin header' };
    }
  }

  // Fallback to Referer header if Origin is omitted
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host.toLowerCase() === host.toLowerCase()) {
        return { valid: true };
      }
      return {
        valid: false,
        reason: `Referer mismatch: expected host "${host}", received "${refererUrl.host}"`
      };
    } catch {
      return { valid: false, reason: 'Malformed Referer header' };
    }
  }

  // In non-browser / direct API calls (e.g. server-to-server with API key or curl), Origin may be omitted
  return { valid: true };
}

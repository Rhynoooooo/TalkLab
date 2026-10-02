/**
 * TalkLab 2.0 - Security Audit & Operational Activity Logger
 * Logs facilitator and administrative actions for accountability and forensic review.
 */

export interface AuditLogEntry {
  timestamp: string;
  action:
    | 'login_attempt'
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'session_verify_failure'
    | 'rate_limit_blocked'
    | 'csrf_blocked'
    | 'manual_checkin'
    | 'seat_freed'
    | 'manual_seat_assigned'
    | 'session_reset'
    | 'whatsapp_pass_resent'
    | 'whatsapp_broadcast_sent'
    | 'security_alert';
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'WARNING';
  actorId?: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const record: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry
  };

  const levelColor =
    record.status === 'SUCCESS'
      ? '\x1b[32m' // Green
      : record.status === 'BLOCKED' || record.status === 'FAILURE'
      ? '\x1b[31m' // Red
      : '\x1b[33m'; // Yellow
  const resetColor = '\x1b[0m';

  // Format structured log output for Node/Vercel/Cloud logs
  console.log(
    `${levelColor}[SECURITY AUDIT ${record.status}]${resetColor} [${record.timestamp}] ` +
    `Action="${record.action}" Actor="${record.actorId || 'anonymous'}" IP="${record.ip}" ` +
    `Details=${JSON.stringify(record.details || {})}`
  );

  // In high-risk security alerts, log critical warnings
  if (record.status === 'BLOCKED' || (record.details && record.details.alert === true)) {
    console.warn(
      `🚨 [SECURITY ALERT] Suspicious administrative activity detected from IP ${record.ip}: ` +
      `${record.action} (${JSON.stringify(record.details || {})})`
    );
  }
}

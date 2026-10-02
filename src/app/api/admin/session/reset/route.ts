import { NextRequest, NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';
import { resetSessionAtomic, SessionKey } from '@/lib/boardroom/store';
import { clearAllOtps } from '@/lib/auth/otp';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const moderatorId = req.headers.get('x-moderator-id') || 'facilitator_lead';

  try {
    const body = await req.json();
    const { session, confirmed } = body;

    // Double confirmation security guard
    if (confirmed !== true) {
      return NextResponse.json(
        {
          error: 'Explicit confirmation required. Field "confirmed": true must be supplied to execute session reset.',
          code: 'CONFIRMATION_REQUIRED'
        },
        { status: 400 }
      );
    }

    if (!session || (session !== 'saturday' && session !== 'tuesday' && session !== 'both')) {
      return NextResponse.json(
        {
          error: 'Invalid session parameter. Must be "saturday", "tuesday", or "both".',
          code: 'INVALID_SESSION'
        },
        { status: 400 }
      );
    }

    // 1. Reset boardroom bookings atomically & record archive
    const resetResult = await resetSessionAtomic(session as SessionKey | 'both', moderatorId);

    // 2. Clear pending OTP verification tokens
    clearAllOtps();

    // 3. Security audit log
    logAuditEvent({
      action: 'session_reset',
      status: 'WARNING',
      actorId: moderatorId,
      ip,
      details: {
        targetSession: session,
        totalArchivedRosters: resetResult.archived.length,
        archives: resetResult.archived.map(a => ({
          archiveId: a.archiveId,
          session: a.session,
          seatsArchived: a.totalSeatsArchived
        }))
      }
    });

    return NextResponse.json({
      success: true,
      message: `Session "${session}" has been successfully flushed to initial empty state.`,
      session,
      archived: resetResult.archived,
      newState: resetResult.newState
    });
  } catch (err) {
    console.error('[Session Reset Error]:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing session reset', code: 'RESET_FAILED' },
      { status: 500 }
    );
  }
}

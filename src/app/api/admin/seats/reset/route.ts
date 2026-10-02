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
    const { session } = body;

    if (!session || (session !== 'saturday' && session !== 'tuesday')) {
      return NextResponse.json(
        { error: 'Valid session parameter (saturday or tuesday) is required' },
        { status: 400 }
      );
    }

    const resetResult = await resetSessionAtomic(session as SessionKey, moderatorId);
    clearAllOtps();

    logAuditEvent({
      action: 'session_reset',
      status: 'WARNING',
      actorId: moderatorId,
      ip,
      details: { session }
    });

    return NextResponse.json({
      success: true,
      message: `Session roster for ${session} reset successfully`,
      session,
      newState: resetResult.newState
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

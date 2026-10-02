import { NextRequest, NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';
import { releaseSeatAtomic } from '@/lib/boardroom/store';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const moderatorId = req.headers.get('x-moderator-id') || 'facilitator';

  try {
    const body = await req.json();
    const { session, seatNumber } = body;

    if (!session || typeof seatNumber !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload: session and seatNumber required' },
        { status: 400 }
      );
    }

    const result = await releaseSeatAtomic(session, seatNumber);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || `Seat #${seatNumber} could not be released` },
        { status: 400 }
      );
    }

    logAuditEvent({
      action: 'seat_freed',
      status: 'SUCCESS',
      actorId: moderatorId,
      ip,
      details: { session, seatNumber }
    });

    return NextResponse.json({
      success: true,
      message: `Seat #${seatNumber} successfully freed`,
      session,
      seatNumber
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

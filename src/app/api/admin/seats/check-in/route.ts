import { NextRequest, NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';
import { toggleCheckInAtomic } from '@/lib/boardroom/store';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const moderatorId = req.headers.get('x-moderator-id') || 'facilitator';

  try {
    const body = await req.json();
    const { session, seatNumber, checkedIn } = body;

    if (!session || typeof seatNumber !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload: session and seatNumber required' },
        { status: 400 }
      );
    }

    const result = await toggleCheckInAtomic(session, seatNumber, !!checkedIn);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || `Seat #${seatNumber} status could not be updated` },
        { status: 400 }
      );
    }

    logAuditEvent({
      action: 'manual_checkin',
      status: 'SUCCESS',
      actorId: moderatorId,
      ip,
      details: { session, seatNumber, checkedIn: !!checkedIn }
    });

    return NextResponse.json({
      success: true,
      message: `Seat #${seatNumber} status updated successfully`,
      session,
      seatNumber,
      checkedIn: !!checkedIn,
      seat: result.seat
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

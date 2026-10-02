import { NextRequest, NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/auditLogger';
import { bookSeatAtomic } from '@/lib/boardroom/store';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const moderatorId = req.headers.get('x-moderator-id') || 'facilitator';

  try {
    const body = await req.json();
    const { session, seatNumber, name, phone } = body;

    if (!session || typeof seatNumber !== 'number' || !name) {
      return NextResponse.json(
        { error: 'Invalid payload: session, seatNumber, and name are required' },
        { status: 400 }
      );
    }

    const result = await bookSeatAtomic(session, seatNumber, {
      name: String(name).trim(),
      phone: String(phone || 'N/A').trim()
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || `Seat #${seatNumber} could not be assigned` },
        { status: 400 }
      );
    }

    logAuditEvent({
      action: 'manual_seat_assigned',
      status: 'SUCCESS',
      actorId: moderatorId,
      ip,
      details: { session, seatNumber, guestName: name, phone: phone || 'N/A' }
    });

    return NextResponse.json({
      success: true,
      message: `Seat #${seatNumber} manually assigned to ${name}`,
      session,
      seatNumber,
      name,
      phone,
      seat: result.seat
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { bookSeatAtomic, SessionKey } from '@/lib/boardroom/store';
import { extractClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  extractClientIp(req.headers);

  try {
    const body = await req.json();
    const { session, seatNumber, name, phone } = body;

    if (!session || (session !== 'saturday' && session !== 'tuesday')) {
      return NextResponse.json(
        { error: 'Valid session (saturday or tuesday) is required' },
        { status: 400 }
      );
    }

    if (typeof seatNumber !== 'number' || seatNumber < 1 || seatNumber > 25) {
      return NextResponse.json(
        { error: 'Valid seat number between 1 and 25 is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Valid attendee name is required' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Valid mobile phone number is required' },
        { status: 400 }
      );
    }

    const result = await bookSeatAtomic(session as SessionKey, seatNumber, {
      name: name.trim(),
      phone: phone.trim()
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.code === 'SEAT_TAKEN' ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Seat #${seatNumber} confirmed for ${name.trim()}`,
      seat: result.seat
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

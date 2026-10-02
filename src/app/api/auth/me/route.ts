import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null
      },
      { status: 200 }
    );
  }

  // Safe client-facing profile without internal secrets or raw JWT signatures
  return NextResponse.json(
    {
      authenticated: true,
      user: {
        role: session.role,
        userId: session.userId,
        phone: session.phone,
        name: session.name,
        seatNumber: session.seatNumber,
        sessionName: session.sessionName
      }
    },
    { status: 200 }
  );
}

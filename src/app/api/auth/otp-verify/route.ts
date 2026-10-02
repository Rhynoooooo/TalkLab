import { NextRequest, NextResponse } from 'next/server';
import { verifyAndConsumeOtp } from '@/lib/auth/otp';
import { createSession } from '@/lib/auth/session';
import { extractClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);

  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit verification code' },
        { status: 400 }
      );
    }

    // Verify and atomically consume OTP to prevent replay attacks
    const verifyResult = verifyAndConsumeOtp(phone, otp.trim(), ip);

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || 'Verification failed' },
        { status: 401 }
      );
    }

    const { normPhone, metadata } = verifyResult;

    // Issue Member-scoped session cookie (talklab_session)
    const response = NextResponse.json(
      {
        success: true,
        message: 'Member authentication verified successfully',
        user: {
          role: 'member',
          userId: `member_${normPhone}`,
          phone: normPhone,
          name: metadata?.name || 'TalkLab Member',
          seatNumber: metadata?.seatNumber,
          sessionName: metadata?.sessionName
        }
      },
      { status: 200 }
    );

    await createSession(
      {
        role: 'member',
        userId: `member_${normPhone}`,
        phone: normPhone,
        name: metadata?.name || 'TalkLab Member',
        seatNumber: metadata?.seatNumber,
        sessionName: metadata?.sessionName
      },
      response
    );

    return response;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}

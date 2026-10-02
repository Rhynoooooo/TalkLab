import { NextRequest, NextResponse } from 'next/server';
import { getPollState, adminUpdatePoll } from '@/lib/poll/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const poll = await getPollState();
    return NextResponse.json({ success: true, poll });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch admin poll state';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, subtitle, isActive, options } = body;

    const result = await adminUpdatePoll({
      title,
      subtitle,
      isActive,
      options
    });

    return NextResponse.json({
      success: true,
      message: 'Poll configuration updated successfully',
      poll: result.poll
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update poll configuration';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

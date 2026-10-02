import { NextRequest, NextResponse } from 'next/server';
import { getPollState, voteOption } from '@/lib/poll/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const poll = await getPollState();
    return NextResponse.json({ success: true, poll });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to retrieve poll state';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { optionId } = body;

    if (typeof optionId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Field "optionId" (number) is required' },
        { status: 400 }
      );
    }

    const result = await voteOption(optionId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to register vote' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, poll: result.poll });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Server error casting vote';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

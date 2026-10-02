import { NextRequest, NextResponse } from 'next/server';
import { adminResetPoll } from '@/lib/poll/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { confirmed } = body;

    if (!confirmed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Explicit confirmation required. Send { confirmed: true } to reset the poll.',
          code: 'CONFIRMATION_REQUIRED'
        },
        { status: 400 }
      );
    }

    const moderatorId = req.headers.get('x-moderator-id') || 'facilitator_lead';
    const result = await adminResetPoll(moderatorId);

    return NextResponse.json({
      success: true,
      message: 'Poll votes reset to zero and archived successfully',
      poll: result.poll,
      archived: result.archived
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to reset poll';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

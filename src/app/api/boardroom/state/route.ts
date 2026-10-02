import { NextResponse } from 'next/server';
import { getBoardroomState } from '@/lib/boardroom/store';

export async function GET() {
  const state = await getBoardroomState();
  return NextResponse.json({
    success: true,
    state
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

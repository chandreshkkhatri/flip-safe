import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getPositions } from '@/lib/kiteconnect-handler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const positions = await getPositions();
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}

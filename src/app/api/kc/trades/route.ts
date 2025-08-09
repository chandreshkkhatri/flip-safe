import { NextRequest, NextResponse } from 'next/server';
import { getTrades, checkAuth } from '@/lib/kiteconnect-handler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const trades = await getTrades();
    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}
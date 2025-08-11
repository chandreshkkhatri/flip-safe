import { checkAuth, getLTP } from '@/lib/kiteconnect-handler';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { instruments } = await request.json();

    if (!instruments || !Array.isArray(instruments)) {
      return NextResponse.json({ error: 'Invalid instruments parameter' }, { status: 400 });
    }

    const ltpData = await getLTP(instruments);
    return NextResponse.json(ltpData);
  } catch (error) {
    console.error('Error fetching LTP data:', error);
    return NextResponse.json({ error: 'Failed to fetch LTP data' }, { status: 500 });
  }
}

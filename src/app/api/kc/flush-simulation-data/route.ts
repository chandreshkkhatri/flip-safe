import { checkAuth } from '@/lib/kiteconnect-handler';
import { flushSimulationData } from '@/models/simulator';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await flushSimulationData();
    return NextResponse.json(true);
  } catch (error) {
    console.error('Error flushing simulation data:', error);
    return NextResponse.json({ error: 'Failed to flush simulation data' }, { status: 500 });
  }
}

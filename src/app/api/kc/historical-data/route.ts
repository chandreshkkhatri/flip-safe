import { checkAuth, getHistoricalData } from '@/lib/kiteconnect-handler';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { instrument_token, interval, from_date, to_date, instrument_type } =
      await request.json();

    if (!instrument_token || !interval || !from_date || !to_date) {
      return NextResponse.json(
        { error: 'Missing required parameters: instrument_token, interval, from_date, to_date' },
        { status: 400 }
      );
    }

    // Set continuous parameter based on instrument type
    const continuous = instrument_type === 'derivative' ? 1 : 0;

    const historicalData = await getHistoricalData(
      instrument_token,
      interval,
      from_date,
      to_date,
      continuous
    );

    return NextResponse.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}

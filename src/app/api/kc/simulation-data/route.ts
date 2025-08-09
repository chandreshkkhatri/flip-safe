import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getHistoricalData } from '@/lib/kiteconnect-handler';
import { getSimulationData, storeSimulationData } from '@/models/simulator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const instrument_token = searchParams.get('instrument_token');
    const date = searchParams.get('date');
    const interval = searchParams.get('interval') || 'minute';

    if (!instrument_token || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: instrument_token, date' },
        { status: 400 }
      );
    }

    // Try to get cached simulation data
    const cachedData = await getSimulationData(instrument_token, interval, date);

    if (cachedData.status && cachedData.doc) {
      return NextResponse.json({
        status: true,
        data: cachedData.doc.candleStickData,
      });
    }

    // If no cached data, fetch from KiteConnect
    const from_date = `${date} 00:01:00`;
    const to_date = `${date} 23:59:00`;

    try {
      const response = await getHistoricalData(instrument_token, interval, from_date, to_date);

      // Store the fetched data for future use
      await storeSimulationData(instrument_token, interval, date, response);

      return NextResponse.json({
        status: true,
        data: response,
      });
    } catch (error) {
      console.error('Error fetching simulation data:', error);
      return NextResponse.json({
        status: false,
        error: 'Failed to fetch simulation data',
      });
    }
  } catch (error) {
    console.error('Error processing simulation data request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

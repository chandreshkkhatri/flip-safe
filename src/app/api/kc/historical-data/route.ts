import { checkAuth, getHistoricalData } from '@/lib/kiteconnect-handler';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock data for Binance symbols when Kite Connect is not available
const generateMockHistoricalData = (symbol: string, interval: string) => {
  const now = Date.now();
  const dataPoints = 100;
  const intervalMs = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
  }[interval] || 3600000;

  const basePrice = {
    BTCUSDT: 45000,
    ETHUSDT: 2500,
    BNBUSDT: 300,
    ADAUSDT: 0.5,
    XRPUSDT: 0.6,
    SOLUSDT: 100,
    DOTUSDT: 7,
    DOGEUSDT: 0.08,
    AVAXUSDT: 35,
    MATICUSDT: 0.9,
  }[symbol] || 100;

  const data = [];
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const randomChange = (Math.random() - 0.5) * 0.02; // ±2% variation
    const open = basePrice * (1 + randomChange);
    const close = open * (1 + (Math.random() - 0.5) * 0.01); // ±1% from open
    const high = Math.max(open, close) * (1 + Math.random() * 0.005); // up to 0.5% higher
    const low = Math.min(open, close) * (1 - Math.random() * 0.005); // up to 0.5% lower

    data.push({
      date: new Date(timestamp).toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000),
    });
  }

  return data;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1h';

    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
    }

    // For Binance symbols (ending with USDT), return mock data
    if (symbol.endsWith('USDT')) {
      const mockData = generateMockHistoricalData(symbol, interval);
      return NextResponse.json(mockData);
    }

    // For Kite Connect symbols, check authentication first
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated for Kite Connect' }, { status: 401 });
    }

    // Handle Kite Connect historical data request
    const instrument_token = searchParams.get('instrument_token');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const instrument_type = searchParams.get('instrument_type');

    if (!instrument_token || !from_date || !to_date) {
      return NextResponse.json(
        { error: 'Missing required parameters for Kite Connect' },
        { status: 400 }
      );
    }

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

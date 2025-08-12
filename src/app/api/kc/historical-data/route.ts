import { checkAuth, getHistoricalData } from '@/lib/kiteconnect-handler';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Fetch real candlestick data from Binance API
const fetchBinanceKlines = async (symbol: string, interval: string) => {
  try {
    // Binance klines endpoint
    const limit = 100; // Number of candles to fetch
    const binanceInterval = interval === '1m' ? '1m' :
                           interval === '5m' ? '5m' :
                           interval === '15m' ? '15m' :
                           interval === '1h' ? '1h' :
                           interval === '4h' ? '4h' :
                           interval === '1d' ? '1d' :
                           interval === '1w' ? '1w' : '1h';
    
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const klines = await response.json();
    
    // Format the data to match our chart format
    // Binance returns: [openTime, open, high, low, close, volume, closeTime, ...]
    const formattedData = klines.map((kline: any[]) => ({
      date: new Date(kline[0]).toISOString(),
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching Binance klines:', error);
    // Fallback to mock data if API fails
    return generateMockHistoricalData(symbol, interval);
  }
};

// Fallback mock data generator (simplified)
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
    '1w': 604800000,
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
  let lastClose = basePrice;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const volatility = 0.002; // 0.2% volatility
    const trend = Math.sin(i / 10) * 0.001; // Slight trending pattern
    
    const open = lastClose;
    const change = (Math.random() - 0.5) * volatility + trend;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    
    lastClose = close;

    data.push({
      date: new Date(timestamp).toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000 + 500000),
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

    // For Binance symbols (ending with USDT), fetch real data from Binance API
    if (symbol.endsWith('USDT')) {
      const binanceData = await fetchBinanceKlines(symbol, interval);
      return NextResponse.json(binanceData);
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

import { checkAuth, getHistoricalData } from '@/lib/kiteconnect-service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Binance historical data fetcher
const fetchBinanceKlines = async (symbol: string, interval: string) => {
  try {
    const limit = 100;
    const binanceInterval =
      interval === '1m'
        ? '1m'
        : interval === '5m'
          ? '5m'
          : interval === '15m'
            ? '15m'
            : interval === '1h'
              ? '1h'
              : interval === '4h'
                ? '4h'
                : interval === '1d'
                  ? '1d'
                  : interval === '1w'
                    ? '1w'
                    : '1h';

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const klines = await response.json();

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
    throw error;
  }
};

// Kite Connect historical data fetcher
const fetchKiteHistoricalData = async (params: {
  instrument_token: string;
  interval: string;
  from_date: string;
  to_date: string;
  instrument_type?: string;
}) => {
  if (!checkAuth()) {
    throw new Error('Not authenticated for Kite Connect');
  }

  const { instrument_token, interval, from_date, to_date, instrument_type } = params;
  const continuous = instrument_type === 'derivative' ? 1 : 0;

  return await getHistoricalData(instrument_token, interval, from_date, to_date, continuous);
};

// Upstox historical data fetcher (placeholder)
const fetchUpstoxHistoricalData = async (params: {
  symbol: string;
  interval: string;
  from_date?: string;
  to_date?: string;
  accountId: string;
}) => {
  // TODO: Implement Upstox historical data fetching
  throw new Error('Upstox historical data not yet implemented');
};

// Mock data generator for fallback
const generateMockHistoricalData = (symbol: string, interval: string) => {
  const now = Date.now();
  const dataPoints = 100;
  const intervalMs =
    {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '1h': 3600000,
      '4h': 14400000,
      '1d': 86400000,
      '1w': 604800000,
    }[interval] || 3600000;

  const basePrice =
    {
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
    const volatility = 0.002;
    const trend = Math.sin(i / 10) * 0.001;

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
    const vendor = searchParams.get('vendor') || 'binance'; // Default to binance
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1h';
    const accountId = searchParams.get('accountId');

    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
    }

    let historicalData;

    switch (vendor.toLowerCase()) {
      case 'binance':
        try {
          historicalData = await fetchBinanceKlines(symbol, interval);
        } catch (error) {
          console.warn('Binance API failed, falling back to mock data');
          historicalData = generateMockHistoricalData(symbol, interval);
        }
        break;

      case 'kite':
      case 'kiteconnect':
        try {
          const instrument_token = searchParams.get('instrument_token');
          const from_date = searchParams.get('from_date');
          const to_date = searchParams.get('to_date');
          const instrument_type = searchParams.get('instrument_type');

          if (!instrument_token || !from_date || !to_date) {
            return NextResponse.json(
              {
                error:
                  'Missing required parameters for Kite Connect: instrument_token, from_date, to_date',
              },
              { status: 400 }
            );
          }

          historicalData = await fetchKiteHistoricalData({
            instrument_token,
            interval,
            from_date,
            to_date,
            instrument_type: instrument_type || undefined,
          });
        } catch (error) {
          return NextResponse.json(
            {
              error:
                error instanceof Error ? error.message : 'Failed to fetch Kite historical data',
            },
            { status: 500 }
          );
        }
        break;

      case 'upstox':
        try {
          if (!accountId) {
            return NextResponse.json({ error: 'accountId required for Upstox' }, { status: 400 });
          }

          const from_date = searchParams.get('from_date');
          const to_date = searchParams.get('to_date');

          historicalData = await fetchUpstoxHistoricalData({
            symbol,
            interval,
            from_date: from_date || undefined,
            to_date: to_date || undefined,
            accountId,
          });
        } catch (error) {
          return NextResponse.json(
            {
              error:
                error instanceof Error ? error.message : 'Failed to fetch Upstox historical data',
            },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported vendor: ${vendor}. Supported vendors: binance, kite, upstox` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      vendor,
      symbol,
      interval,
      timestamp: new Date().toISOString(),
      data: historicalData,
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor = 'binance', symbol, interval = '1h', accountId, ...vendorParams } = body;

    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
    }

    let historicalData;

    switch (vendor.toLowerCase()) {
      case 'binance':
        try {
          historicalData = await fetchBinanceKlines(symbol, interval);
        } catch (error) {
          console.warn('Binance API failed, falling back to mock data');
          historicalData = generateMockHistoricalData(symbol, interval);
        }
        break;

      case 'kite':
      case 'kiteconnect':
        try {
          const { instrument_token, from_date, to_date, instrument_type } = vendorParams;

          if (!instrument_token || !from_date || !to_date) {
            return NextResponse.json(
              {
                error:
                  'Missing required parameters for Kite Connect: instrument_token, from_date, to_date',
              },
              { status: 400 }
            );
          }

          historicalData = await fetchKiteHistoricalData({
            instrument_token,
            interval,
            from_date,
            to_date,
            instrument_type,
          });
        } catch (error) {
          return NextResponse.json(
            {
              error:
                error instanceof Error ? error.message : 'Failed to fetch Kite historical data',
            },
            { status: 500 }
          );
        }
        break;

      case 'upstox':
        try {
          if (!accountId) {
            return NextResponse.json({ error: 'accountId required for Upstox' }, { status: 400 });
          }

          const { from_date, to_date } = vendorParams;

          historicalData = await fetchUpstoxHistoricalData({
            symbol,
            interval,
            from_date,
            to_date,
            accountId,
          });
        } catch (error) {
          return NextResponse.json(
            {
              error:
                error instanceof Error ? error.message : 'Failed to fetch Upstox historical data',
            },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported vendor: ${vendor}. Supported vendors: binance, kite, upstox` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      vendor,
      symbol,
      interval,
      timestamp: new Date().toISOString(),
      data: historicalData,
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}

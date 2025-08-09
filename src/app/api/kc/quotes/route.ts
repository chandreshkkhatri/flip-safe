import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getQuote } from '@/lib/kiteconnect-handler';

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

    const quotes = await getQuote(instruments);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const instruments = searchParams.get('instruments');

    if (!instruments) {
      return NextResponse.json({ error: 'Instruments parameter is required' }, { status: 400 });
    }

    const instrumentArray = instruments.split(',');
    const quotes = await getQuote(instrumentArray);

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

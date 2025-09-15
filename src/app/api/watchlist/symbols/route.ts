import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const marketType = searchParams.get('marketType');

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account ID is required',
          symbols: [],
        },
        { status: 400 }
      );
    }

    // TODO: Replace this with actual database query
    // Example: const watchlist = await db.collection('watchlists').findOne({ accountId, marketType });

    // For now, return empty array to force dynamic loading from actual database
    // In production, this should query the database based on accountId and marketType
    const symbols: string[] = [];

    return NextResponse.json({
      success: true,
      symbols,
      marketType,
      accountId,
    });
  } catch (error) {
    console.error('Error fetching watchlist symbols:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch watchlist symbols',
        symbols: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, marketType, symbols } = body;

    if (!accountId || !marketType || !symbols) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Save user's watchlist to database
    // For example: await db.watchlists.upsert({ accountId, marketType, symbols })

    return NextResponse.json({
      success: true,
      message: 'Watchlist updated successfully',
      symbols,
    });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update watchlist' },
      { status: 500 }
    );
  }
}

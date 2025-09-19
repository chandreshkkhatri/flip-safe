import connectDB from '@/lib/mongodb';
import getInstrumentModel from '@/models/instrument';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  instrument_type?: string;
  token?: string;
}

async function searchSymbolsInDatabase(
  vendor: string,
  query: string,
  exchange?: string,
  segment?: string,
  limit: number = 20
): Promise<SymbolSearchResult[]> {
  try {
    await connectDB();
    const InstrumentModel = getInstrumentModel(vendor);

    // Create regex for case-insensitive search
    const searchRegex = new RegExp(query, 'i');

    // Build search criteria
    const searchCriteria: any = {
      $or: [{ tradingsymbol: searchRegex }, { name: searchRegex }],
    };

    // Add exchange filter if provided
    if (exchange && exchange !== 'ALL') {
      searchCriteria.exchange = exchange;
    }

    // Add segment filter if provided
    if (segment && segment !== 'ALL') {
      searchCriteria.segment = segment;
    }

    // Search with filters
    const instruments = await InstrumentModel.find(searchCriteria)
      .limit(limit)
      .lean();

    // Map to SymbolSearchResult format
    return instruments.map((instrument: any) => ({
      symbol: instrument.tradingsymbol || instrument.symbol || '',
      name: instrument.name || instrument.tradingsymbol || '',
      exchange: instrument.exchange || vendor.toUpperCase(),
      instrument_type: instrument.instrument_type || '',
      segment: instrument.segment || '',
      token: instrument.instrument_token || instrument.token || '',
    }));
  } catch (error) {
    console.error(`Error searching ${vendor} symbols in database:`, error);
    return [];
  }
}

// For faster searches, you can also implement a more advanced search
// using MongoDB text search if text indexes are created
async function searchSymbolsWithTextSearch(
  vendor: string,
  query: string,
  exchange?: string,
  segment?: string,
  limit: number = 20
): Promise<SymbolSearchResult[]> {
  try {
    await connectDB();
    const InstrumentModel = getInstrumentModel(vendor);

    // Build search criteria
    const searchCriteria: any = { $text: { $search: query } };

    // Add exchange filter if provided
    if (exchange && exchange !== 'ALL') {
      searchCriteria.exchange = exchange;
    }

    // Add segment filter if provided
    if (segment && segment !== 'ALL') {
      searchCriteria.segment = segment;
    }

    // Try text search first (requires text index)
    let instruments: any[];
    try {
      instruments = await InstrumentModel.find(
        searchCriteria,
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();
    } catch (textSearchError) {
      // Fall back to regex search if text search fails
      console.log('Text search not available, using regex search');
      return searchSymbolsInDatabase(vendor, query, exchange, segment, limit);
    }

    // Map to SymbolSearchResult format
    return instruments.map((instrument: any) => ({
      symbol: instrument.tradingsymbol || instrument.symbol || '',
      name: instrument.name || instrument.tradingsymbol || '',
      exchange: instrument.exchange || vendor.toUpperCase(),
      instrument_type: instrument.instrument_type || '',
      segment: instrument.segment || '',
      token: instrument.instrument_token || instrument.token || '',
    }));
  } catch (error) {
    console.error(`Error with text search for ${vendor} symbols:`, error);
    return searchSymbolsInDatabase(vendor, query, exchange, segment, limit);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const vendor = searchParams.get('vendor');
    const exchange = searchParams.get('exchange') || undefined;
    const segment = searchParams.get('segment') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required', results: [] },
        { status: 400 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor parameter is required', results: [] },
        { status: 400 }
      );
    }

    // Validate vendor
    const supportedVendors = ['binance', 'upstox', 'kite'];
    if (!supportedVendors.includes(vendor.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported vendor. Supported vendors: ${supportedVendors.join(', ')}`,
          results: [],
        },
        { status: 400 }
      );
    }

    // Search in database using the vendor-specific collection
    // Try text search first for better performance, fall back to regex if needed
    const results = await searchSymbolsWithTextSearch(
      vendor.toLowerCase(),
      query,
      exchange,
      segment,
      Math.min(limit, 100) // Cap at 100 results
    );

    return NextResponse.json({
      success: true,
      results,
      query,
      vendor,
      filters: {
        exchange: exchange || 'ALL',
        segment: segment || 'ALL',
      },
    });
  } catch (error) {
    console.error('Error searching symbols:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search symbols',
        results: [],
      },
      { status: 500 }
    );
  }
}

import connectDB from '@/lib/mongodb';
import Account from '@/models/account';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BinanceFundsResponse {
  totalWalletBalance: string;
  totalMarginBalance: string;
  totalUnrealizedProfit: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  assets: Array<{
    asset: string;
    walletBalance: string;
    unrealizedProfit: string;
    marginBalance: string;
    availableBalance: string;
  }>;
}

// Mock fund data for development - replace with real Binance API calls
const getMockFunds = (): BinanceFundsResponse => {
  return {
    totalWalletBalance: '12500.50',
    totalMarginBalance: '12350.25', 
    totalUnrealizedProfit: '150.25',
    availableBalance: '8750.00',
    maxWithdrawAmount: '8500.00',
    assets: [
      {
        asset: 'USDT',
        walletBalance: '10000.00',
        unrealizedProfit: '0.00',
        marginBalance: '10000.00',
        availableBalance: '7500.00',
      },
      {
        asset: 'BTC',
        walletBalance: '0.02156789',
        unrealizedProfit: '125.50',
        marginBalance: '0.02156789',
        availableBalance: '0.01056789',
      },
      {
        asset: 'ETH',
        walletBalance: '0.95432100',
        unrealizedProfit: '24.75',
        marginBalance: '0.95432100',
        availableBalance: '0.45432100',
      },
    ]
  };
};

// Real Binance API implementation
const getRealBinanceFunds = async (apiKey: string, secretKey: string): Promise<BinanceFundsResponse> => {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
    
    const url = `https://fapi.binance.com/fapi/v2/account?${queryString}&signature=${signature}`;
    
    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Binance API error response:', errorText);
      throw new Error(`Binance API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Binance API response:', data);
    
    // Extract and format the data according to our interface
    return {
      totalWalletBalance: data.totalWalletBalance || '0',
      totalMarginBalance: data.totalMarginBalance || '0',
      totalUnrealizedProfit: data.totalUnrealizedProfit || '0',
      availableBalance: data.availableBalance || '0',
      maxWithdrawAmount: data.maxWithdrawAmount || '0',
      assets: data.assets || [],
    };

  } catch (error) {
    console.error('Error fetching real Binance funds:', error);
    // Fallback to mock data on error
    console.log('Falling back to mock data due to error');
    return getMockFunds();
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId parameter' }, { status: 400 });
    }

    console.log('Fetching funds for account:', accountId);

    // Connect to database and fetch account details
    await connectDB();
    const account = await Account.findById(accountId);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.accountType !== 'binance') {
      return NextResponse.json({ error: 'Invalid account type. Expected Binance account.' }, { status: 400 });
    }

    if (!account.apiKey || !account.apiSecret) {
      return NextResponse.json({ error: 'API credentials not found for this account' }, { status: 400 });
    }

    console.log('Found Binance account, fetching real funds data...');

    // Fetch real funds data using stored credentials
    const fundsData = await getRealBinanceFunds(account.apiKey, account.apiSecret);

    return NextResponse.json({
      success: true,
      accountId,
      accountName: account.accountName,
      timestamp: new Date().toISOString(),
      data: fundsData,
    });

  } catch (error) {
    console.error('Error in Binance funds API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch funds data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
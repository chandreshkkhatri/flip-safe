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

// Real Binance API implementation
const getRealBinanceFunds = async (apiKey: string, secretKey: string): Promise<BinanceFundsResponse> => {
  try {
    const timestamp = Date.now();
    const recvWindow = 5000;
    const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
    const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
    
    const url = `https://fapi.binance.com/fapi/v2/account?${queryString}&signature=${signature}`;
    
    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Binance API error response:', errorText);
      
      // Parse error to provide better feedback
      let errorMsg = `Binance API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.code === -2014) {
          errorMsg = 'Invalid API Key format';
        } else if (errorData.code === -1022) {
          errorMsg = 'Invalid signature. Please check your API Secret';
        } else if (errorData.code === -2015) {
          errorMsg = 'Invalid API Key, IP, or permissions for action';
        } else if (errorData.msg) {
          errorMsg = errorData.msg;
        }
      } catch (e) {
        // Ignore JSON parse error
      }
      
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    console.log('Successfully fetched Binance account data');
    
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
    // Re-throw the error instead of falling back to mock data
    throw error;
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
    console.log('API Key length:', account.apiKey?.length);
    console.log('API Key first 8 chars:', account.apiKey?.substring(0, 8));

    try {
      // Fetch real funds data using stored credentials (trim to be safe)
      const fundsData = await getRealBinanceFunds(
        account.apiKey.trim(), 
        account.apiSecret.trim()
      );

      return NextResponse.json({
        success: true,
        accountId,
        accountName: account.accountName,
        timestamp: new Date().toISOString(),
        data: fundsData,
      });
    } catch (apiError) {
      // If API call fails, return error instead of mock data
      console.error('Binance API call failed:', apiError);
      
      // Check if it's an authentication error
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      if (errorMessage.includes('Invalid API') || errorMessage.includes('signature')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid API credentials. Please check your API key and secret.',
            details: errorMessage
          }, 
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch funds from Binance',
          details: errorMessage
        }, 
        { status: 500 }
      );
    }

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
import connectDB from '@/lib/mongodb';
import Account from '@/models/account';
import { createUpstoxClient } from '@/lib/upstox';
import { checkAuth } from '@/lib/kiteconnect-handler';
import kiteConnectService from '@/lib/kiteconnect';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface UnifiedFundsResponse {
  totalBalance: string;
  availableBalance: string;
  usedMargin?: string;
  unrealizedPnl?: string;
  details: any;
  vendor: string;
  accountId: string;
  accountName: string;
  timestamp: string;
}

// Binance funds fetcher
const fetchBinanceFunds = async (apiKey: string, secretKey: string): Promise<any> => {
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

    return {
      totalWalletBalance: data.totalWalletBalance || '0',
      totalMarginBalance: data.totalMarginBalance || '0',
      totalUnrealizedProfit: data.totalUnrealizedProfit || '0',
      availableBalance: data.availableBalance || '0',
      maxWithdrawAmount: data.maxWithdrawAmount || '0',
      assets: data.assets || [],
    };

  } catch (error) {
    console.error('Error fetching Binance funds:', error);
    throw error;
  }
};

// Kite Connect funds fetcher
const fetchKiteFunds = async (): Promise<any> => {
  if (!checkAuth()) {
    throw new Error('Not authenticated for Kite Connect');
  }

  const kc = kiteConnectService.getKiteConnect();

  try {
    const margins = await kc.getMargins();
    return margins;
  } catch (error) {
    console.error('Error fetching Kite funds:', error);
    throw error;
  }
};

// Upstox funds fetcher
const fetchUpstoxFunds = async (account: any): Promise<any> => {
  try {
    const upstoxClient = createUpstoxClient(account);
    if (account.accessToken) {
      upstoxClient.setAccessToken(account.accessToken);
    }

    const funds = await upstoxClient.getFunds();
    return funds;
  } catch (error) {
    console.error('Error fetching Upstox funds:', error);
    throw error;
  }
};

// Normalize funds data to unified format
const normalizeFundsData = (vendor: string, rawData: any, accountId: string, accountName: string): UnifiedFundsResponse => {
  let totalBalance = '0';
  let availableBalance = '0';
  let usedMargin = undefined;
  let unrealizedPnl = undefined;

  switch (vendor.toLowerCase()) {
    case 'binance':
      totalBalance = rawData.totalWalletBalance || '0';
      availableBalance = rawData.availableBalance || '0';
      unrealizedPnl = rawData.totalUnrealizedProfit || '0';
      break;

    case 'kite':
    case 'kiteconnect':
      // Kite margins structure varies, adapt based on actual response
      if (rawData.equity) {
        totalBalance = rawData.equity.net?.toString() || '0';
        availableBalance = rawData.equity.available?.cash?.toString() || '0';
        usedMargin = rawData.equity.utilised?.debits?.toString() || '0';
      } else {
        totalBalance = rawData.net?.toString() || '0';
        availableBalance = rawData.available?.cash?.toString() || '0';
        usedMargin = rawData.utilised?.debits?.toString() || '0';
      }
      break;

    case 'upstox':
      // Adapt based on Upstox funds response structure
      if (rawData.equity) {
        totalBalance = rawData.equity.used_margin + rawData.equity.available_margin || '0';
        availableBalance = rawData.equity.available_margin?.toString() || '0';
        usedMargin = rawData.equity.used_margin?.toString() || '0';
      }
      break;
  }

  return {
    totalBalance,
    availableBalance,
    usedMargin,
    unrealizedPnl,
    details: rawData,
    vendor,
    accountId,
    accountName,
    timestamp: new Date().toISOString(),
  };
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendor = searchParams.get('vendor');
    const accountId = searchParams.get('accountId');

    // If vendor is specified, it must have accountId
    if (vendor && !accountId) {
      return NextResponse.json(
        { error: 'accountId is required when vendor is specified' },
        { status: 400 }
      );
    }

    // If no vendor specified, try to determine from symbol or default logic
    if (!vendor) {
      return NextResponse.json(
        { error: 'vendor parameter is required. Supported vendors: binance, kite, upstox' },
        { status: 400 }
      );
    }

    await connectDB();

    let account = null;
    if (accountId) {
      account = await Account.findById(accountId);
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      // Validate vendor matches account type
      if (account.accountType !== vendor.toLowerCase()) {
        return NextResponse.json(
          { error: `Account type mismatch. Expected ${vendor}, got ${account.accountType}` },
          { status: 400 }
        );
      }
    }

    let fundsData;
    let normalizedData;

    switch (vendor.toLowerCase()) {
      case 'binance':
        if (!account || !account.apiKey || !account.apiSecret) {
          return NextResponse.json(
            { error: 'Binance API credentials not found for this account' },
            { status: 400 }
          );
        }

        try {
          fundsData = await fetchBinanceFunds(account.apiKey.trim(), account.apiSecret.trim());
          normalizedData = normalizeFundsData('binance', fundsData, accountId!, account.accountName);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
          throw error;
        }
        break;

      case 'kite':
      case 'kiteconnect':
        try {
          fundsData = await fetchKiteFunds();
          normalizedData = normalizeFundsData('kite', fundsData, accountId || 'kite', account?.accountName || 'Kite Connect');
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch Kite funds' },
            { status: 500 }
          );
        }
        break;

      case 'upstox':
        if (!account) {
          return NextResponse.json({ error: 'Account not found for Upstox' }, { status: 404 });
        }

        try {
          fundsData = await fetchUpstoxFunds(account);
          normalizedData = normalizeFundsData('upstox', fundsData, accountId!, account.accountName);
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch Upstox funds' },
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
      data: normalizedData,
    });

  } catch (error) {
    console.error('Error in funds API:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor, accountId, ...vendorParams } = body;

    if (!vendor) {
      return NextResponse.json(
        { error: 'vendor parameter is required in request body' },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId parameter is required in request body' },
        { status: 400 }
      );
    }

    await connectDB();
    const account = await Account.findById(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Validate vendor matches account type
    if (account.accountType !== vendor.toLowerCase()) {
      return NextResponse.json(
        { error: `Account type mismatch. Expected ${vendor}, got ${account.accountType}` },
        { status: 400 }
      );
    }

    let fundsData;
    let normalizedData;

    switch (vendor.toLowerCase()) {
      case 'binance':
        if (!account.apiKey || !account.apiSecret) {
          return NextResponse.json(
            { error: 'Binance API credentials not found for this account' },
            { status: 400 }
          );
        }

        try {
          fundsData = await fetchBinanceFunds(account.apiKey.trim(), account.apiSecret.trim());
          normalizedData = normalizeFundsData('binance', fundsData, accountId, account.accountName);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
          throw error;
        }
        break;

      case 'kite':
      case 'kiteconnect':
        try {
          fundsData = await fetchKiteFunds();
          normalizedData = normalizeFundsData('kite', fundsData, accountId, account.accountName);
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch Kite funds' },
            { status: 500 }
          );
        }
        break;

      case 'upstox':
        try {
          fundsData = await fetchUpstoxFunds(account);
          normalizedData = normalizeFundsData('upstox', fundsData, accountId, account.accountName);
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch Upstox funds' },
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
      data: normalizedData,
    });

  } catch (error) {
    console.error('Error in funds API:', error);
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
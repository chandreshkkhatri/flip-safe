import { createBinanceClient } from '@/lib/binance';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey, apiSecret, testnet = false } = await request.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'API key and secret are required' },
        { status: 400 }
      );
    }

    // Create Binance client and test connection
    const client = createBinanceClient({
      apiKey,
      apiSecret,
      testnet,
    });

    // Test the connection and credentials
    const isConnected = await client.testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Binance API' },
        { status: 500 }
      );
    }

    // Try to fetch account info to validate credentials
    try {
      const accountInfo = await client.getAccountInfo();

      return NextResponse.json({
        success: true,
        accountInfo: {
          canTrade: accountInfo.canTrade,
          totalWalletBalance: accountInfo.totalWalletBalance,
          totalUnrealizedProfit: accountInfo.totalUnrealizedProfit,
          totalMarginBalance: accountInfo.totalMarginBalance,
        },
      });
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.data?.code === -2014) {
        return NextResponse.json(
          { success: false, error: 'Invalid API credentials' },
          { status: 401 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Binance validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.response?.data?.msg || error.message || 'Failed to validate Binance credentials',
      },
      { status: 500 }
    );
  }
}

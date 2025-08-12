import { createBinanceClient } from '@/lib/binance';
import connectDB from '@/lib/mongodb';
import Account from '@/models/account';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if this is a direct API validation (with apiKey/apiSecret in body)
    // or account-based validation (with accountId in body)
    let apiKey: string;
    let apiSecret: string;
    let testnet = false;
    
    if (body.accountId) {
      // Fetch credentials from database using accountId
      console.log('Validating stored Binance account:', body.accountId);
      
      await connectDB();
      const account = await Account.findById(body.accountId);
      
      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 }
        );
      }
      
      if (account.accountType !== 'binance') {
        return NextResponse.json(
          { success: false, error: 'Invalid account type. Expected Binance account.' },
          { status: 400 }
        );
      }
      
      if (!account.apiKey || !account.apiSecret) {
        return NextResponse.json(
          { success: false, error: 'API key and secret are required' },
          { status: 400 }
        );
      }
      
      apiKey = account.apiKey;
      apiSecret = account.apiSecret;
      testnet = body.testnet || false;
    } else {
      // Direct validation with provided credentials
      apiKey = body.apiKey;
      apiSecret = body.apiSecret;
      testnet = body.testnet || false;
    }

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

      // If this was an account-based validation, update the account status
      if (body.accountId) {
        await Account.findByIdAndUpdate(body.accountId, {
          isActive: true,
          accessToken: 'validated',
          lastSyncAt: new Date(),
          $set: {
            'metadata.validatedAt': new Date(),
            'metadata.lastBalance': accountInfo.totalWalletBalance,
          }
        });
        console.log('Binance account updated as validated');
      }

      return NextResponse.json({
        success: true,
        message: 'Binance account validated successfully',
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

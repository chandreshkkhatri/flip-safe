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
      
      // Debug logging (remove in production)
      console.log('API Key length:', apiKey?.length);
      console.log('API Key first 8 chars:', apiKey?.substring(0, 8));
      console.log('Has API Secret:', !!apiSecret);
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

    // Trim any whitespace that might have been accidentally included
    const trimmedApiKey = apiKey.trim();
    const trimmedApiSecret = apiSecret.trim();
    
    // Create Binance client and test connection
    const client = createBinanceClient({
      apiKey: trimmedApiKey,
      apiSecret: trimmedApiSecret,
      testnet,
    });
    
    console.log('Creating Binance client with trimmed keys');
    console.log('Trimmed API Key length:', trimmedApiKey.length);

    // Test the connection first
    const isConnected = await client.testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Binance API. Please check your internet connection.' },
        { status: 500 }
      );
    }

    // Try to fetch account info to validate credentials
    try {
      console.log('Testing Binance API credentials...');
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
        validationType: 'binance',
        accountId: body.accountId,
        accountInfo: {
          canTrade: accountInfo.canTrade,
          totalWalletBalance: accountInfo.totalWalletBalance,
          totalUnrealizedProfit: accountInfo.totalUnrealizedProfit,
          totalMarginBalance: accountInfo.totalMarginBalance,
        },
      });
    } catch (error: any) {
      console.error('Account info fetch error:', error.response?.data || error.message);
      
      // Check specific error codes
      const errorCode = error.response?.data?.code;
      const errorMsg = error.response?.data?.msg || error.message;
      
      if (error.response?.status === 401 || errorCode === -2014) {
        return NextResponse.json(
          { success: false, error: 'Invalid API Key format. Please check your API key.' },
          { status: 401 }
        );
      }
      
      if (errorCode === -1022) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature. Please check your API Secret key.' },
          { status: 401 }
        );
      }
      
      if (errorCode === -2015) {
        return NextResponse.json(
          { success: false, error: 'Invalid API Key, IP not whitelisted, or insufficient permissions. Please ensure your API key has Futures trading enabled and your IP is whitelisted if IP restrictions are enabled.' },
          { status: 401 }
        );
      }
      
      if (errorCode === -1021) {
        return NextResponse.json(
          { success: false, error: 'Timestamp for this request is outside of the recvWindow. Please check your system time.' },
          { status: 401 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { success: false, error: `Binance API error: ${errorMsg}` },
        { status: 500 }
      );
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

import { NextRequest, NextResponse } from 'next/server';
import upstoxService from '@/lib/upstox-service';
import { getAccountById } from '@/models/account';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    // Get account from database
    const account = await getAccountById(accountId);
    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'Account not found'
      }, { status: 404 });
    }

    if (account.accountType !== 'upstox') {
      return NextResponse.json({
        success: false,
        error: 'Account is not an Upstox account'
      }, { status: 400 });
    }

    // Initialize Upstox service with account credentials
    const isSandbox = account.metadata?.sandbox === true;
    upstoxService.initializeWithCredentials(account.apiKey, account.apiSecret, isSandbox);

    // Run debug configuration check
    const debugInfo = upstoxService.debugAppConfiguration();

    return NextResponse.json({
      success: true,
      account: {
        id: account._id,
        name: account.accountName,
        type: account.accountType,
        isSandbox
      },
      debugInfo
    });

  } catch (error: any) {
    console.error('Debug Upstox error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to debug Upstox configuration'
    }, { status: 500 });
  }
}
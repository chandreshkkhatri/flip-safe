import { NextRequest, NextResponse } from 'next/server';
import { createUpstoxClient } from '@/lib/upstox';
import { getAccountById } from '@/models/account';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const account = await getAccountById(accountId);
    if (!account || account.accountType !== 'upstox') {
      return NextResponse.json({ error: 'Upstox account not found' }, { status: 404 });
    }

    const upstoxClient = createUpstoxClient(account);
    const loginUrl = upstoxClient.generateLoginURL(`${accountId}_upstox_auth`);

    return NextResponse.json({ 
      success: true, 
      loginUrl,
      message: 'Redirect to Upstox login' 
    });
  } catch (error) {
    console.error('Error generating Upstox login URL:', error);
    return NextResponse.json({ error: 'Failed to generate login URL' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import kiteConnectService, { API_KEY } from '@/lib/kiteconnect';
import { clearSession } from '@/models/session';

export async function GET(request: NextRequest) {
  try {
    // Invalidate access token
    if (kiteConnectService.isLoggedIn()) {
      await kiteConnectService.invalidateAccessToken();
    }

    // Clear local session
    kiteConnectService.reset();

    // Clear session from database
    await clearSession();

    const login_url = `https://kite.trade/connect/login?v=3&api_key=${API_KEY}`;

    return NextResponse.json({
      isLoggedIn: false,
      message: 'Successfully Logged Out',
      login_url,
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for logout
  return GET(request);
}

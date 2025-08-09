import { NextRequest, NextResponse } from 'next/server';
import kiteConnectService, { API_KEY } from '@/lib/kiteconnect';
import { retrieveSession } from '@/models/session';

export async function GET(request: NextRequest) {
  try {
    // Check if access token exists in memory
    if (kiteConnectService.isLoggedIn()) {
      return NextResponse.json({ isLoggedIn: true });
    }

    // Check if session exists in database
    const sessionResult = await retrieveSession();

    if (sessionResult.status === 'success' && sessionResult.session) {
      const access_token = sessionResult.session.access_token;
      kiteConnectService.setAccessToken(access_token);

      // Set session expiry hook
      kiteConnectService.setSessionExpiryHook(() => {
        kiteConnectService.reset();
      });

      return NextResponse.json({ isLoggedIn: true });
    } else {
      const login_url = `https://kite.trade/connect/login?v=3&api_key=${API_KEY}`;
      return NextResponse.json({
        isLoggedIn: false,
        message: 'User Not Logged in',
        login_url,
      });
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

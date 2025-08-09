import { NextRequest, NextResponse } from 'next/server';
import kiteConnectService from '@/lib/kiteconnect';
import { clearSession, storeSession } from '@/models/session';

let client_url = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const request_token = searchParams.get('request_token');

    if (status === 'success' && request_token) {
      console.log('Login response received successfully', request_token);

      try {
        const response = await kiteConnectService.generateSession(request_token);
        console.log('Session generated:', response);

        // Set session expiry hook
        kiteConnectService.setSessionExpiryHook(() => {
          kiteConnectService.reset();
          clearSession();
        });

        // Store session in database
        await storeSession(kiteConnectService.getAccessToken()!);

        // Redirect to dashboard
        return NextResponse.redirect(`${client_url}/dashboard`);
      } catch (error) {
        console.error('Error generating session:', error);
        return NextResponse.redirect(`${client_url}/login?error=session_failed`);
      }
    } else {
      console.error('Login error: Invalid status or missing request_token');
      return NextResponse.redirect(`${client_url}/login?error=login_failed`);
    }
  } catch (error) {
    console.error('Error processing login:', error);
    return NextResponse.redirect(`${client_url}/login?error=server_error`);
  }
}

// Handle setting client URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.url) {
      client_url = body.url;
      return NextResponse.json({ message: 'Client URL set successfully' });
    }
    return NextResponse.json({ error: 'URL not provided' }, { status: 400 });
  } catch (error) {
    console.error('Error setting client URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

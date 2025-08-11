import { createUpstoxClient } from '@/lib/upstox';
import { getAccountById, updateAccount } from '@/models/account';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Upstox OAuth error:', error);
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=upstox_auth_failed&message=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/dashboard?error=upstox_auth_failed&message=Missing_authorization_code',
          request.url
        )
      );
    }

    // Extract account ID from state
    const accountId = state.split('_')[0];
    if (!accountId) {
      return NextResponse.redirect(
        new URL('/dashboard?error=upstox_auth_failed&message=Invalid_state_parameter', request.url)
      );
    }

    const account = await getAccountById(accountId);
    if (!account || account.accountType !== 'upstox') {
      return NextResponse.redirect(
        new URL('/dashboard?error=upstox_auth_failed&message=Account_not_found', request.url)
      );
    }

    const upstoxClient = createUpstoxClient(account);
    const tokenData = await upstoxClient.exchangeCodeForToken(code);

    // Update account with access token
    await updateAccount(accountId, {
      accessToken: tokenData.access_token,
      lastSyncAt: new Date(),
      metadata: {
        ...account.metadata,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        tokenUpdatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.redirect(
      new URL(
        '/dashboard?success=upstox_auth_success&message=Account_connected_successfully',
        request.url
      )
    );
  } catch (error) {
    console.error('Error in Upstox callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=upstox_auth_failed&message=Authentication_failed', request.url)
    );
  }
}

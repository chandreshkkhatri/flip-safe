import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (url) {
      // In Next.js, we can store this in environment or use it directly
      // For now, we'll just acknowledge the request
      console.log('Client URL set to:', url);
      return NextResponse.json({ message: 'Client URL set successfully' });
    }

    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  } catch (error) {
    console.error('Error setting login info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

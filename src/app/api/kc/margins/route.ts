import { checkAuth, getMargins } from '@/lib/kiteconnect-handler';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth()) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment') || undefined;

    const margins = await getMargins(segment);
    return NextResponse.json(margins);
  } catch (error) {
    console.error('Error fetching margins:', error);
    return NextResponse.json({ error: 'Failed to fetch margins' }, { status: 500 });
  }
}

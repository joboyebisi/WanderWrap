import { NextRequest, NextResponse } from 'next/server';
import { beginOAuth } from '../../../../lib/begin-oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    return beginOAuth('signup', { returnTo: request.nextUrl.searchParams.get('returnTo') || undefined, provider: request.nextUrl.searchParams.get('provider') || undefined, base: request.nextUrl.searchParams.get('domain') === 'fallback' ? 'fallback' : 'primary' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Account creation is not configured' }, { status: 503 });
  }
}

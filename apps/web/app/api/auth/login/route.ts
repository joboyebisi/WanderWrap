import { NextRequest, NextResponse } from 'next/server';
import { beginOAuth } from '../../../../lib/begin-oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    return beginOAuth('login', { returnTo: request.nextUrl.searchParams.get('returnTo') || undefined, provider: request.nextUrl.searchParams.get('provider') || undefined });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Authentication is not configured' }, { status: 503 });
  }
}

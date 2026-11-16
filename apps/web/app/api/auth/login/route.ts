import { NextRequest, NextResponse } from 'next/server';
import { beginOAuth } from '../../../../lib/begin-oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider') || undefined;
  if (provider === 'Google' && process.env.NEXT_PUBLIC_WANDERWRAP_GOOGLE_AUTH_ENABLED === 'false') {
    return NextResponse.json({ error: 'Google sign-in is temporarily unavailable. Continue with email instead.' }, { status: 503 });
  }
  try {
    return beginOAuth('login', { returnTo: request.nextUrl.searchParams.get('returnTo') || undefined, provider, base: request.nextUrl.searchParams.get('domain') === 'fallback' ? 'fallback' : 'primary' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Authentication is not configured' }, { status: 503 });
  }
}

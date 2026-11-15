import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed' }, { status: 403 });
  const base = process.env.WANDERWRAP_CORE_API_URL;
  if (!base) return Response.json({ error: 'Lead capture is not configured yet.' }, { status: 503 });
  const body = await request.text();
  try {
    const response = await fetch(new URL('/v1/public/leads', base), {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: process.env.NEXT_PUBLIC_WANDERWRAP_URL || request.nextUrl.origin },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000)
    });
    const result = await response.json().catch(() => ({ error: 'Lead capture is temporarily unavailable.' }));
    if (!response.ok) return Response.json(result, { status: response.status });
    return Response.json({
      ...result,
      onboardingAvailable: Boolean(process.env.WANDERWRAP_OAUTH_BASE_URL && process.env.WANDERWRAP_WEB_CLIENT_ID),
      onboardingUrl: '/api/auth/signup'
    }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Lead capture is temporarily unavailable. Please try again.' }, { status: 503 });
  }
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  if (origin === request.nextUrl.origin) return true;
  const configured = process.env.NEXT_PUBLIC_WANDERWRAP_URL;
  if (!configured) return false;
  try {
    const actual = new URL(origin);
    const expected = new URL(configured);
    return actual.protocol === expected.protocol && actual.hostname.replace(/^www\./, '') === expected.hostname.replace(/^www\./, '');
  } catch { return false; }
}

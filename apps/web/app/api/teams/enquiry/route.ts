import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed' }, { status: 403 });
  const base = process.env.WANDERWRAP_CORE_API_URL;
  if (!base) return Response.json({ error: 'Team enquiries are not configured yet.' }, { status: 503 });
  try {
    const response = await fetch(new URL('/v1/public/team-enquiries', base), {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: request.headers.get('origin') as string },
      body: await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000)
    });
    const result = await response.json().catch(() => ({ error: 'We could not send your enquiry.' }));
    return Response.json(result, { status: response.status, headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'We could not send your enquiry. Please try again.' }, { status: 503 });
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

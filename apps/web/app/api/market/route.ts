import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const detected = (request.headers.get('x-vercel-ip-country') || 'GB').toUpperCase();
  const country = ['GB', 'US', 'CA'].includes(detected) ? detected : 'GB';
  const config = country === 'US' ? { currency: 'USD', locale: 'en-US' } : country === 'CA' ? { currency: 'CAD', locale: 'en-CA' } : { currency: 'GBP', locale: 'en-GB' };
  return Response.json({ country, ...config, source: 'ip-default', approximate: true }, { headers: { 'cache-control': 'private, no-store', vary: 'x-vercel-ip-country' } });
}

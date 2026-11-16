import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const EEA = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE']);

export async function GET(request: NextRequest) {
  const country = (request.headers.get('x-vercel-ip-country') || 'unknown').toUpperCase();
  const subdivision = (request.headers.get('x-vercel-ip-country-region') || '').toUpperCase();
  const region = country === 'GB' ? 'uk' : EEA.has(country) ? 'eea' : country === 'US' && subdivision === 'CA' ? 'california' : 'global';
  return Response.json({ region }, { headers: { 'cache-control': 'private, no-store' } });
}

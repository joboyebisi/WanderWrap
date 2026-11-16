import type { NextRequest } from 'next/server';
// @ts-ignore Shared JavaScript agent harness is intentionally consumed by the web BFF.
import { createGiftFinderHarness, giftFinderCapability } from '../../../../../../src/gift-finder-agent.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed' }, { status: 403 });
  const capability = giftFinderCapability();
  if (capability.status !== 'available') return Response.json({ error: 'The Gift Finder agent is not configured right now.' }, { status: 503 });
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== 'object') return Response.json({ error: 'Invalid Gift Finder turn' }, { status: 400 });
  const startedAt = Date.now();
  try {
    const output = await createGiftFinderHarness().turn(input);
    console.info(JSON.stringify({
      event: 'wanderwrap.agent_turn_evaluated',
      agent: 'gift-finder-specialist',
      durationMs: Date.now() - startedAt,
      ...output.evaluation
    }));
    return Response.json({ ...output, disclosure: 'Current products are researched with Channel3. Retailers confirm final price, availability, delivery and checkout.' }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.warn(JSON.stringify({
      event: 'wanderwrap.agent_turn_failed',
      agent: 'gift-finder-specialist',
      durationMs: Date.now() - startedAt,
      intent: input && 'intent' in input && input.intent === 'search' ? 'search' : 'continue',
      errorType: error instanceof TypeError ? 'validation' : 'execution'
    }));
    return Response.json({ error: error instanceof Error ? error.message : 'The gift agent stopped safely.' }, { status: 400 });
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

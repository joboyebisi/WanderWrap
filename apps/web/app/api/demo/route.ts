import type { NextRequest } from 'next/server';
// @ts-ignore Shared JavaScript domain modules are intentionally consumed by the web BFF.
import { extractPreferenceCandidates } from '../../../../../src/preference-intelligence.mjs';
// @ts-ignore Shared JavaScript domain modules are intentionally consumed by the web BFF.
import { CATALOG, rankGifts } from '../../../../../src/recommendation.mjs';
// @ts-ignore Shared JavaScript domain modules are intentionally consumed by the web BFF.
import { searchAmazonCreators } from '../../../../../src/amazon.mjs';

export const dynamic = 'force-dynamic';

const AMAZON_DOMAINS: Record<string, string> = { GB: 'www.amazon.co.uk', US: 'www.amazon.com', CA: 'www.amazon.ca' };
const PARTNER_TAGS: Record<string, string | undefined> = {
  GB: process.env.AMAZON_PARTNER_TAG_GB,
  US: process.env.AMAZON_PARTNER_TAG_US,
  CA: process.env.AMAZON_PARTNER_TAG_CA
};
const DIRECTION_DETAILS: Record<string, { direction: string; giftType: string; confidence: number; feasibility: string; risk: string; tradeoff: string }> = {
  ceramic: { direction: 'SHARED CREATIVE RITUAL', giftType: 'EXPERIENCE + KEEPSAKE', confidence: 94, feasibility: 'Memorable and useful after the experience', risk: 'Check that making time feels restorative, not like another task', tradeoff: 'Medium effort · high emotional fit' },
  tea: { direction: 'SAFE DELIGHT', giftType: 'PHYSICAL RITUAL', confidence: 91, feasibility: 'Easy to enjoy immediately and repeatedly', risk: 'Confirm tea preference and cupboard space before checkout', tradeoff: 'Low effort · dependable usefulness' },
  tasting: { direction: 'SHARED MEMORY', giftType: 'EXPERIENCE', confidence: 87, feasibility: 'Creates connection without adding clutter', risk: 'Dates, dietary needs and travel effort still need checking', tradeoff: 'More coordination · stronger shared memory' },
  journal: { direction: 'LASTING RITUAL', giftType: 'PHYSICAL GIFT', confidence: 83, feasibility: 'Portable, versatile and simple to keep', risk: 'Less distinctive if they already use a favourite notebook', tradeoff: 'Very practical · gentler surprise' },
  speaker: { direction: 'DELIGHTFUL WILDCARD', giftType: 'TECH GIFT', confidence: 76, feasibility: 'Useful across home and small adventures', risk: 'Check compatibility and whether they already own one', tradeoff: 'Higher novelty · higher duplicate risk' }
};

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origin not allowed' }, { status: 403 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input || typeof input.action !== 'string') return Response.json({ error: 'Invalid demo request' }, { status: 400 });
  try {
    if (input.action === 'analyse') return Response.json(analyse(input));
    if (input.action === 'recommend') return Response.json(recommend(input));
    if (input.action === 'handoff') return Response.json(await handoff(input));
    return Response.json({ error: 'Unknown demo action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Demo step failed safely' }, { status: 400 });
  }
}

function analyse(input: Record<string, unknown>) {
  if (input.allowedToUse !== true) throw new Error('Please confirm that you are allowed to use these selected excerpts.');
  const snippets = Array.isArray(input.snippets) ? input.snippets.slice(0, 8).map(String).map(text => text.trim()).filter(Boolean) : [];
  if (!snippets.length) throw new Error('Add at least one selected clue.');
  const now = new Date().toISOString();
  const subjectId = 'public-demo-recipient';
  const result = extractPreferenceCandidates({
    connection: { provider: 'manual_export', accountOwnerId: subjectId, enabled: true, consent: { subjectId, selfConsented: true, grantedAt: now, scopes: ['posts.read'], purposes: ['preference_intelligence'] } },
    subjectId,
    content: snippets.map((text, index) => ({ id: `selected-${index + 1}`, kind: 'post', authorId: subjectId, text, createdAt: now })),
    now
  });
  return {
    candidates: result.candidates.map((candidate: Record<string, unknown>) => ({ id: candidate.id, value: candidate.value, confidence: candidate.confidence, rankEligible: false, status: 'needs_confirmation' })),
    rejectedCount: result.rejected.length,
    ephemeral: true,
    disclosure: 'Raw excerpts were processed transiently and are not returned to the browser response.'
  };
}

function recommend(input: Record<string, unknown>) {
  const interests = Array.isArray(input.interests) ? input.interests.map(String).map(value => value.trim().toLowerCase()).filter(Boolean).slice(0, 8) : [];
  if (!interests.length) throw new Error('Confirm at least one clue before asking for ideas.');
  const budget = Math.min(5_000, Math.max(5, Number(input.budget) || 60));
  const brief = input.brief && typeof input.brief === 'object' ? input.brief as Record<string, unknown> : {};
  const desiredValue = String(brief.recipientValue || 'A calming ritual');
  const meaning = String(brief.meaning || 'I notice you').slice(0, 80);
  const priority: Record<string, string[]> = {
    'A calming ritual': ['tea', 'ceramic', 'journal', 'tasting'],
    'A shared experience': ['tasting', 'ceramic', 'tea', 'journal'],
    'Something useful': ['journal', 'tea', 'ceramic', 'tasting']
  };
  const order = priority[desiredValue] || priority['A calming ritual'];
  const recommendations = rankGifts({ budget, signals: interests.map((value, index) => ({ id: `confirmed-${index + 1}`, value, source: 'recipient_confirmed', confirmed: true, rankEligible: true })) })
    .map((gift: Record<string, unknown>) => ({ ...gift, ...DIRECTION_DETAILS[String(gift.id)], why: `${gift.story} It supports “${meaning}” using only confirmed interests.` }))
    .sort((left: Record<string, unknown>, right: Record<string, unknown>) => order.indexOf(String(left.id)) - order.indexOf(String(right.id)));
  return { recommendations, disclosure: 'Directions use deterministic demo catalogue data, confirmed interests and the visible Gift Brief.' };
}

async function handoff(input: Record<string, unknown>) {
  const selected = CATALOG.find((gift: { id: string }) => gift.id === String(input.giftId || ''));
  if (!selected) throw new Error('Select one of the recommended gifts first.');
  const country = String(input.destinationCountry || 'GB').toUpperCase();
  const marketplace = AMAZON_DOMAINS[country] || AMAZON_DOMAINS.GB;
  const partnerTag = PARTNER_TAGS[country] || PARTNER_TAGS.GB;
  const fallbackUrl = `https://${marketplace}/s?k=${encodeURIComponent(selected.name)}`;
  const credentials = {
    credentialId: process.env.AMAZON_CREATORS_CREDENTIAL_ID,
    credentialSecret: process.env.AMAZON_CREATORS_CREDENTIAL_SECRET,
    credentialVersion: process.env.AMAZON_CREATORS_CREDENTIAL_VERSION
  };
  if (!partnerTag || !credentials.credentialId || !credentials.credentialSecret || !credentials.credentialVersion) {
    return { mode: 'amazon-search-handoff', selected, marketplace, url: fallbackUrl, offers: [], disclosure: 'Amazon Creators API is not configured yet. This is a marketplace search handoff; Amazon confirms products, price, availability, delivery and checkout.' };
  }
  try {
    const catalog = await searchAmazonCreators({ keywords: selected.name, destinationCountry: country, partnerTag, ...credentials, itemCount: 4 });
    const first = catalog.offers.find((offer: { available: boolean }) => offer.available) || catalog.offers[0];
    return {
      mode: first ? 'amazon-creators-live' : 'amazon-search-handoff', selected, marketplace,
      url: first?.detailPageUrl || catalog.searchUrl || fallbackUrl,
      offers: catalog.offers,
      disclosure: first
        ? 'Live product links and offer fields came from Amazon Creators API. Amazon still confirms delivery address and final checkout.'
        : 'Amazon returned no suitable product offer, so WanderWrap prepared a marketplace search handoff.'
    };
  } catch {
    return { mode: 'amazon-search-handoff', selected, marketplace, url: fallbackUrl, offers: [], disclosure: 'Amazon Creators API was unavailable, so WanderWrap failed safely to a marketplace search. Amazon confirms products, price, availability, delivery and checkout.' };
  }
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  if (origin === request.nextUrl.origin) return true;
  try {
    const actual = new URL(origin);
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const forwardedProtocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    if (forwardedHost && actual.host === forwardedHost && actual.protocol === `${forwardedProtocol}:`) return true;
  } catch {
    return false;
  }
  const configured = process.env.NEXT_PUBLIC_WANDERWRAP_URL;
  if (configured) {
    try {
      const actual = new URL(origin);
      const expected = new URL(configured);
      const canonicalHost = (hostname: string) => hostname.toLowerCase().replace(/^www\./, '');
      if (
        actual.protocol === expected.protocol
        && actual.port === expected.port
        && canonicalHost(actual.hostname) === canonicalHost(expected.hostname)
      ) return true;
    } catch {
      return false;
    }
  }
  return false;
}

import { supportedAmazonMarketplace } from './fulfillment-router.mjs';

const tokenCache = new Map();

export function buildAmazonSearch({ keywords, destinationCountry, partnerTag }) {
  const marketplace = supportedAmazonMarketplace(destinationCountry);
  if (!marketplace) throw new Error('No supported Amazon marketplace');
  if (!keywords || !partnerTag) throw new Error('Keywords and marketplace partner tag required');
  return {
    endpoint: 'https://creatorsapi.amazon/catalog/v1/searchItems',
    headers: { 'content-type': 'application/json', 'x-marketplace': marketplace },
    body: { keywords, marketplace, partnerTag, resources: ['images.primary.medium', 'itemInfo.title', 'offersV2.listings.availability', 'offersV2.listings.price'] }
  };
}

export function amazonRetailHandoff(item) {
  if (!item?.detailPageUrl || !item.available) throw new Error('A live available Amazon offer is required');
  return { provider: 'amazon', url: item.detailPageUrl, status: 'awaiting-user', disclosure: 'Availability, price, delivery address and final purchase are confirmed on Amazon.' };
}

export function creatorsTokenEndpoint(credentialVersion) {
  if (String(credentialVersion).startsWith('3.1')) return 'https://api.amazon.com/auth/o2/token';
  if (String(credentialVersion).startsWith('3.2')) return 'https://api.amazon.co.uk/auth/o2/token';
  if (String(credentialVersion).startsWith('3.3')) return 'https://api.amazon.co.jp/auth/o2/token';
  throw new Error('Unsupported Amazon Creators credential version');
}

export async function searchAmazonCreators({
  keywords,
  destinationCountry,
  partnerTag,
  credentialId,
  credentialSecret,
  credentialVersion,
  itemCount = 4,
  fetchImpl = fetch,
  now = () => Date.now()
} = {}) {
  if (!credentialId || !credentialSecret || !credentialVersion) throw new Error('Amazon Creators API credentials are not configured');
  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > 10) throw new Error('Amazon itemCount must be between 1 and 10');
  const request = buildAmazonSearch({ keywords, destinationCountry, partnerTag });
  const accessToken = await creatorsAccessToken({ credentialId, credentialSecret, credentialVersion, fetchImpl, now });
  const response = await fetchImpl(request.endpoint, {
    method: 'POST',
    headers: { ...request.headers, authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ ...request.body, itemCount, searchIndex: 'All' }),
    signal: AbortSignal.timeout(8_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Amazon Creators search failed (${response.status})`);
  const items = Array.isArray(payload?.searchResult?.items) ? payload.searchResult.items : [];
  return {
    provider: 'amazon-creators',
    marketplace: request.body.marketplace,
    searchUrl: safeAmazonUrl(payload?.searchResult?.searchURL, request.body.marketplace),
    offers: items.map(item => normalizeAmazonOffer(item, request.body.marketplace)).filter(Boolean),
    partialErrors: Array.isArray(payload?.errors) ? payload.errors.map(error => ({ code: String(error?.code || 'unknown') })) : []
  };
}

async function creatorsAccessToken({ credentialId, credentialSecret, credentialVersion, fetchImpl, now }) {
  const cacheKey = `${credentialVersion}:${credentialId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > now() + 30_000) return cached.value;
  const response = await fetchImpl(creatorsTokenEndpoint(credentialVersion), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: credentialId,
      client_secret: credentialSecret,
      scope: 'creatorsapi::default'
    }),
    signal: AbortSignal.timeout(8_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(`Amazon Creators authentication failed (${response.status})`);
  const expiresIn = Math.max(60, Number(payload.expires_in) || 3_600);
  tokenCache.set(cacheKey, { value: payload.access_token, expiresAt: now() + expiresIn * 1_000 });
  return payload.access_token;
}

function normalizeAmazonOffer(item, marketplace) {
  const detailPageUrl = safeAmazonUrl(item?.detailPageURL, marketplace);
  if (!item?.asin || !detailPageUrl) return null;
  const listing = item?.offersV2?.listings?.[0];
  const availability = String(listing?.availability?.type || 'UNKNOWN').toUpperCase();
  const unavailable = new Set(['OUT_OF_STOCK', 'OUTOFSTOCK', 'UNAVAILABLE', 'UNKNOWN']);
  return {
    asin: String(item.asin),
    title: String(item?.itemInfo?.title?.displayValue || 'Amazon gift idea'),
    detailPageUrl,
    imageUrl: safeImageUrl(item?.images?.primary?.medium?.url),
    available: !unavailable.has(availability),
    availability,
    price: listing?.price?.money ? {
      amount: Number(listing.price.money.amount),
      currency: String(listing.price.money.currency || ''),
      displayAmount: String(listing.price.money.displayAmount || '')
    } : null,
    deliveryVerified: false
  };
}

function safeAmazonUrl(value, marketplace) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && (url.hostname === marketplace || url.hostname.endsWith(`.${marketplace}`)) ? url.toString() : null;
  } catch { return null; }
}

function safeImageUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && url.hostname === 'm.media-amazon.com' ? url.toString() : null;
  } catch { return null; }
}

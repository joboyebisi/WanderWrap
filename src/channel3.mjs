import { Channel3 } from '@channel3/sdk';

const SUPPORTED_MARKETS = Object.freeze({
  GB: { country: 'GB', currency: 'GBP', language: 'en' },
  US: { country: 'US', currency: 'USD', language: 'en' },
  CA: { country: 'CA', currency: 'CAD', language: 'en' }
});

export function channel3Capability(env = process.env) {
  if (env.CHANNEL3_DISCOVERY_ENABLED !== 'true') return { status: 'disabled', reason: 'feature_flag_off' };
  if (!env.CHANNEL3_API_KEY) return { status: 'configuration_required', reason: 'missing_api_key' };
  return { status: 'available', reason: 'configured' };
}

export async function searchChannel3Gifts({
  query,
  budget,
  country = 'GB',
  userId,
  limit = 8,
  apiKey = process.env.CHANNEL3_API_KEY,
  client
} = {}) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) throw new TypeError('A gift search query is required');
  if (!apiKey && !client) throw new Error('Channel3 is not configured');

  const market = SUPPORTED_MARKETS[String(country).toUpperCase()] || SUPPORTED_MARKETS.GB;
  const maxPrice = Number.isFinite(Number(budget)) ? Math.max(5, Math.min(5_000, Number(budget))) : undefined;
  const activeClient = client || new Channel3({ apiKey, timeoutInSeconds: 12, maxRetries: 1 });
  const page = await activeClient.products.search({
    query: normalizedQuery.slice(0, 1_200),
    limit: Math.max(1, Math.min(12, Number(limit) || 8)),
    ...(userId ? { 'x-user-id': String(userId).slice(0, 120) } : {}),
    ...(maxPrice ? { filters: { price: { max_price: maxPrice }, conditions: ['new'], availability: ['InStock'] } } : {}),
    config: { mode: 'agentic', ...market }
  });

  return {
    provider: 'channel3',
    observedAt: new Date().toISOString(),
    market,
    products: page.data.map(normalizeProduct).filter(Boolean)
  };
}
function normalizeProduct(product) {
  const offer = product?.offers?.find(item => item?.availability === 'InStock') || product?.offers?.[0];
  if (!product?.id || !product?.title || !offer?.url) return null;
  const image = product.images?.find(item => item?.is_main_image) || product.images?.[0];
  return {
    id: String(product.id),
    title: String(product.title),
    description: product.description ? String(product.description).slice(0, 280) : null,
    imageUrl: image?.cleaned_url || image?.url || null,
    imageAlt: image?.alt_text || product.title,
    merchant: String(offer.domain || 'Retailer'),
    url: String(offer.url),
    availability: offer.availability || 'Unknown',
    price: Number.isFinite(offer.price?.price) ? Number(offer.price.price) : null,
    currency: offer.price?.currency || null,
    category: product.category?.title || null
  };
}

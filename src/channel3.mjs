import { Channel3 } from '@channel3/sdk';

const SUPPORTED_MARKETS = Object.freeze({
  GB: { country: 'GB', currency: 'GBP', language: 'en' },
  US: { country: 'US', currency: 'USD', language: 'en' },
  CA: { country: 'CA', currency: 'CAD', language: 'en' }
});

export function channel3Market(country = 'GB') {
  return SUPPORTED_MARKETS[String(country).toUpperCase()] || SUPPORTED_MARKETS.GB;
}

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

  const market = channel3Market(country);
  const maxPrice = Number.isFinite(Number(budget)) ? Math.max(5, Math.min(5_000, Number(budget))) : undefined;
  const activeClient = client || new Channel3({ apiKey, timeoutInSeconds: 12, maxRetries: 1 });
  const page = await activeClient.products.search({
    query: normalizedQuery.slice(0, 1_200),
    limit: Math.max(1, Math.min(12, Number(limit) || 8)),
    ...(maxPrice ? { filters: { price: { max_price: maxPrice }, conditions: ['new'], availability: ['InStock'] } } : {}),
    config: { mode: 'agentic', ...market }
  }, requestOptions(userId));

  return {
    provider: 'channel3',
    observedAt: new Date().toISOString(),
    market,
    products: page.data.map(normalizeProduct).filter(Boolean)
  };
}

export async function runChannel3GiftFinderTurn({
  message,
  conversationId,
  country = 'GB',
  userId,
  apiKey = process.env.CHANNEL3_API_KEY,
  client
} = {}) {
  const text = String(message || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) throw new TypeError('A shopper message is required');
  if (text.length > 1_600) throw new TypeError('Shopper message is too long');
  if (!apiKey && !client) throw new Error('Channel3 is not configured');
  const market = channel3Market(country);
  const activeClient = client || new Channel3({ apiKey, timeoutInSeconds: 25, maxRetries: 1 });
  const result = await activeClient.conversations.createTurn({
    message: { role: 'user', parts: [{ type: 'text', text }] },
    ...(conversationId ? { conversation_id: String(conversationId).slice(0, 160) } : {}),
    config: market,
    ...(!conversationId ? { context: {
      application_context: `WanderWrap Gift Finder: a calm, consent-first gifting assistant for ${market.country} shoppers using ${market.currency}. Ask one concise, high-value question at a time. Understand the recipient, relationship, occasion, budget, timing, interests, dislikes and practical constraints before searching. Use only information the giver supplies. When there is enough context, search for meaningfully different current gifts. Never imply that WanderWrap has ordered, paid for or guaranteed delivery of anything.`,
      user_context: 'The shopper may begin as a guest. Build an editable Gift Brief before recommendation reveal. The giver makes the final choice and currently completes any purchase with the retailer.'
    } } : {})
  }, requestOptions(userId));
  const parts = Array.isArray(result.message?.parts) ? result.message.parts : [];
  const products = [];
  for (const part of parts) {
    if (part?.type !== 'tool' || !part.output || part.output.is_error) continue;
    for (const product of part.output.products || []) {
      const normalized = normalizeProduct(product);
      if (normalized && !products.some(item => item.id === normalized.id)) products.push(normalized);
    }
  }
  const reply = parts.filter(part => part?.type === 'text').map(part => cleanConversationText(part.text)).filter(Boolean).join('\n\n');
  return {
    provider: 'channel3-conversations',
    conversationId: result.conversation_id,
    turnId: result.turn_id,
    reply: reply || (products.length ? 'I found a few current options worth comparing.' : 'Tell me a little more about the person you are celebrating.'),
    suggestions: Array.isArray(result.message?.suggestions) ? result.message.suggestions.slice(0, 4).map(String) : [],
    products: products.slice(0, 10),
    usage: result.usage || null,
    observedAt: new Date().toISOString()
  };
}

export async function retrieveChannel3Product({
  productId,
  country = 'GB',
  userId,
  apiKey = process.env.CHANNEL3_API_KEY,
  client
} = {}) {
  const id = String(productId || '').trim();
  if (!id || id.length > 200) throw new TypeError('A valid product reference is required');
  if (!apiKey && !client) throw new Error('Channel3 is not configured');
  const market = channel3Market(country);
  const activeClient = client || new Channel3({ apiKey, timeoutInSeconds: 12, maxRetries: 1 });
  const product = await activeClient.products.retrieve({ product_id: id, ...market }, requestOptions(userId));
  return { provider: 'channel3', observedAt: new Date().toISOString(), market, product: normalizeProduct(product) };
}

function requestOptions(userId) {
  const safe = String(userId || '').replace(/[^a-zA-Z0-9._@-]/g, '').slice(0, 128);
  return safe ? { headers: { 'x-user-id': safe } } : undefined;
}

function cleanConversationText(value) {
  return String(value || '')
    .replace(/\[([^\]]+)\]\(cp:[^)]+\)/g, '$1')
    .replace(/\s+\n/g, '\n')
    .trim();
}

export function normalizeProduct(product) {
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

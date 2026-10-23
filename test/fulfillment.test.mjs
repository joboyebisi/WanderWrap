import test from 'node:test';
import assert from 'node:assert/strict';
import { routeGift } from '../src/fulfillment-router.mjs';
import { buildAmazonSearch, amazonRetailHandoff, creatorsTokenEndpoint, searchAmazonCreators } from '../src/amazon.mjs';
import { handleMcpRequest, PROTOCOL_VERSION } from '../src/mcp-server.mjs';

test('Amazon is preferred for a fulfilable physical gift', () => {
  const result = routeGift({ giftKind: 'physical', senderCountry: 'GB', destinationCountry: 'US', amazonOffer: { available: true, shipsToDestination: true, detailPageUrl: 'https://amazon.com/dp/example' } });
  assert.equal(result.route, 'amazon-retail-handoff');
  assert.equal(result.marketplace, 'www.amazon.com');
  assert.equal(result.autoPurchase, false);
});

test('PayPal supplier checkout takes precedence when Amazon cannot fulfil', () => {
  const result = routeGift({ giftKind: 'experience', senderCountry: 'GB', destinationCountry: 'CA', amazonOffer: { available: false }, alternateSupplier: { id: 'local-1', available: true } });
  assert.equal(result.route, 'paypal-merchant-checkout');
  assert.equal(result.supplierId, 'local-1');
});

test('Xoom is selected only as an eligible cross-border money handoff', () => {
  const result = routeGift({ giftKind: 'money', senderCountry: 'GB', destinationCountry: 'NG', xoomAvailable: true });
  assert.equal(result.route, 'xoom-handoff');
  assert.equal(result.externalHandoff, true);
  assert.equal(result.requiresUserApproval, true);
});

test('Amazon request is marketplace aware and final checkout remains external', () => {
  const request = buildAmazonSearch({ keywords: 'ceramic tea set', destinationCountry: 'GB', partnerTag: 'wanderwrap-21' });
  assert.equal(request.headers['x-marketplace'], 'www.amazon.co.uk');
  assert.throws(() => amazonRetailHandoff({ available: false, detailPageUrl: 'x' }));
});

test('Creators API exchanges credentials and returns provider-authored product links', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (String(url).includes('/auth/o2/token')) return new Response(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }), { status: 200 });
    return new Response(JSON.stringify({ searchResult: { searchURL: 'https://www.amazon.co.uk/s?k=ceramics&tag=wanderwrap-21', items: [{
      asin: 'B012345678', detailPageURL: 'https://www.amazon.co.uk/dp/B012345678?tag=wanderwrap-21',
      itemInfo: { title: { displayValue: 'Pottery starter kit' } },
      images: { primary: { medium: { url: 'https://m.media-amazon.com/images/I/example.jpg' } } },
      offersV2: { listings: [{ availability: { type: 'IN_STOCK' }, price: { money: { amount: 34.99, currency: 'GBP', displayAmount: '£34.99' } } }] }
    }] } }), { status: 200 });
  };
  const result = await searchAmazonCreators({ keywords: 'ceramics', destinationCountry: 'GB', partnerTag: 'wanderwrap-21', credentialId: 'test-id', credentialSecret: 'test-secret', credentialVersion: '3.2', fetchImpl });
  assert.equal(creatorsTokenEndpoint('3.2'), 'https://api.amazon.co.uk/auth/o2/token');
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[0].options.body).scope, 'creatorsapi::default');
  assert.equal(calls[1].options.headers.authorization, 'Bearer test-token');
  assert.equal(result.offers[0].detailPageUrl, 'https://www.amazon.co.uk/dp/B012345678?tag=wanderwrap-21');
  assert.equal(result.offers[0].price.displayAmount, '£34.99');
  assert.equal(result.offers[0].deliveryVerified, false);
});

test('MCP exposes 2025-11-25 tools and gates side effects', async () => {
  const init = await handleMcpRequest({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: PROTOCOL_VERSION } }, { userId: 'u1' });
  assert.equal(init.result.protocolVersion, PROTOCOL_VERSION);
  const list = await handleMcpRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, { userId: 'u1' });
  assert.equal(list.result.tools.some(x => x.name === 'route_gift'), true);
  const blocked = await handleMcpRequest({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'create_group_gift', arguments: { organizerId: 'u1', title: 'Gift', targetMinorUnits: 1000 } } }, { userId: 'u1' });
  assert.equal(blocked.error.code, -32001);
});

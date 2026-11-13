import test from 'node:test';
import assert from 'node:assert/strict';
import { channel3Capability, searchChannel3Gifts } from '../src/channel3.mjs';

test('Channel3 capability fails closed without both flag and server credential', () => {
  assert.deepEqual(channel3Capability({}), { status: 'disabled', reason: 'feature_flag_off' });
  assert.deepEqual(channel3Capability({ CHANNEL3_DISCOVERY_ENABLED: 'true' }), { status: 'configuration_required', reason: 'missing_api_key' });
  assert.deepEqual(channel3Capability({ CHANNEL3_DISCOVERY_ENABLED: 'true', CHANNEL3_API_KEY: 'test-only' }), { status: 'available', reason: 'configured' });
});

test('Channel3 search uses an agentic UK query and normalizes merchant offers', async () => {
  let request;
  const client = { products: { search: async input => {
    request = input;
    return { data: [{ id: 'c3-1', title: 'Hand-thrown tea set', description: 'A quiet tea ritual.', images: [{ url: 'https://images.example/tea.jpg', is_main_image: true }], category: { title: 'Tea sets' }, offers: [{ url: 'https://merchant.example/tea?affiliate=1', domain: 'merchant.example', availability: 'InStock', price: { price: 48, currency: 'GBP' } }] }] };
  } } };

  const result = await searchChannel3Gifts({ query: 'A calming ceramic ritual for a tea lover', budget: 60, country: 'GB', client });
  assert.equal(request.config.mode, 'agentic');
  assert.deepEqual(request.config, { mode: 'agentic', country: 'GB', currency: 'GBP', language: 'en' });
  assert.equal(request.filters.price.max_price, 60);
  assert.equal(result.products[0].merchant, 'merchant.example');
  assert.equal(result.products[0].price, 48);
  assert.equal(result.products[0].url.includes('affiliate=1'), true);
});

test('Channel3 search rejects an empty query before making a provider call', async () => {
  await assert.rejects(searchChannel3Gifts({ query: ' ', client: { products: { search: () => assert.fail('must not call provider') } } }), /query is required/);
});

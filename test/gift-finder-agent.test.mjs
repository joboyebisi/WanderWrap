import test from 'node:test';
import assert from 'node:assert/strict';
import { createGiftFinderHarness, giftFinderCapability } from '../src/gift-finder-agent.mjs';
import { leadRateKey, normalizeLead, normalizeTeamEnquiry, teamEnquiryRateKey } from '../src/lead-capture.mjs';

test('Gift Finder specialist carries conversation context through the bounded harness', async () => {
  const calls = [];
  const harness = createGiftFinderHarness({ conversationProvider: async input => {
    calls.push(input);
    return { provider: 'channel3-conversations', conversationId: 'conv_1', turnId: `turn_${calls.length}`, reply: calls.length === 1 ? 'What does she enjoy?' : 'I found three options.', suggestions: [], products: calls.length === 1 ? [] : [{ id: 'p1', title: 'Tea set', url: 'https://merchant.example/tea' }], observedAt: '2026-11-15T10:00:00Z' };
  } });
  const first = await harness.turn({ sessionId: 'session_1234567890', message: 'A gift for my mum', turnNumber: 1, requestId: 'request-1' });
  const second = await harness.turn({ sessionId: 'session_1234567890', message: 'She loves tea', conversationId: first.conversationId, turnNumber: 2, requestId: 'request-2' });
  assert.equal(calls[1].conversationId, 'conv_1');
  assert.equal(first.stage, 'building_gift_brief');
  assert.equal(second.stage, 'recommendations_ready');
  assert.equal(second.canCaptureLead, true);
  assert.ok(harness.getAuditLog().some(entry => entry.event === 'execution.succeeded'));
});

test('Gift Finder specialist rejects oversized or excessive turns before provider use', async () => {
  let calls = 0;
  const harness = createGiftFinderHarness({ conversationProvider: async () => { calls++; } });
  await assert.rejects(harness.turn({ sessionId: 'session_1234567890', message: 'x'.repeat(1_601), turnNumber: 1 }), /1,600/);
  await assert.rejects(harness.turn({ sessionId: 'session_1234567890', message: 'hello', turnNumber: 17 }), /16 turns/);
  assert.equal(calls, 0);
});

test('Gift Finder capability requires the server-side Channel3 configuration', () => {
  assert.equal(giftFinderCapability({}).status, 'configuration_required');
  assert.equal(giftFinderCapability({ CHANNEL3_DISCOVERY_ENABLED: 'true', CHANNEL3_API_KEY: 'secret' }).status, 'available');
});

test('Lead capture happens only after value and keeps marketing consent separate', () => {
  const lead = normalizeLead({ email: ' Person@Example.com ', serviceConsent: true, marketingConsent: false, valueReceived: true, recommendationCount: 4 }, { now: '2026-11-15T10:00:00.000Z' });
  assert.equal(lead.email, 'person@example.com');
  assert.equal(lead.serviceConsentAt, '2026-11-15T10:00:00.000Z');
  assert.equal(lead.marketingConsentAt, null);
  assert.equal(lead.recommendationCount, 4);
  assert.equal(lead.interest, 'save_shortlist');
  assert.equal(Object.hasOwn(lead, 'conversation'), false);
  assert.throws(() => normalizeLead({ email: 'person@example.com', serviceConsent: true, valueReceived: false }), /after recommendations/);
});

test('team enquiries require executive contact details and separate marketing consent', () => {
  const enquiry = normalizeTeamEnquiry({ name: 'Alex Morgan', email: 'alex@example.com', company: 'Example Ltd', role: 'People Director', teamSize: '201–500', region: 'United Kingdom', useCase: 'Employee milestones', message: 'We are reviewing a recognition programme.', contactConsent: true, marketingConsent: false }, { now: '2026-11-15T12:00:00.000Z' });
  assert.equal(enquiry.company, 'Example Ltd');
  assert.equal(enquiry.contactConsentAt, '2026-11-15T12:00:00.000Z');
  assert.equal(enquiry.marketingConsentAt, null);
  assert.throws(() => normalizeTeamEnquiry({ email: 'alex@example.com', contactConsent: true }), /Name, company and role/);
  assert.match(teamEnquiryRateKey('203.0.113.9', new Date('2026-11-15T12:10:00Z')).PK, /^RATE#TEAM_ENQUIRY#/);
});

test('Lead rate keys are pseudonymous and expire', () => {
  const at = new Date('2026-11-15T10:15:00.000Z');
  const key = leadRateKey('203.0.113.8', at);
  assert.match(key.PK, /^RATE#LEAD#[a-f0-9]{64}$/);
  assert.equal(key.PK.includes('203.0.113.8'), false);
  assert.equal(key.SK, '2026-11-15T10');
  assert.ok(key.expiresAt > at.getTime() / 1000);
});

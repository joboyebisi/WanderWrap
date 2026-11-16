import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceGiftBrief } from '../src/gift-brief.mjs';

test('gift brief carries structured clues across natural turns', () => {
  const first = advanceGiftBrief({}, 'It is for my mum, her 60th birthday. She loves gardening but already owns the obvious tools.', 1);
  assert.equal(first.brief.recipient.toLowerCase(), 'mum');
  assert.equal(first.brief.occasion.toLowerCase(), 'birthday');
  assert.equal(first.readyToReveal, false);
  const second = advanceGiftBrief(first.brief, 'Around £80 and I need it by next Friday.', 2);
  assert.equal(second.readyToReveal, true);
  assert.match(second.brief.budget, /£80/);
});

test('gift brief never reveals from one vague turn', () => {
  const state = advanceGiftBrief({}, 'I need a nice gift', 1);
  assert.equal(state.readyToReveal, false);
  assert.ok(state.missing.length >= 3);
});

test('gift brief understands a natural possessive milestone opener', () => {
  const state = advanceGiftBrief({}, 'Mum’s 60th—she loves gardening but owns the obvious tools.', 1);
  assert.equal(state.brief.recipient.toLowerCase(), 'mum');
  assert.equal(state.brief.occasion, 'birthday');
  assert.equal(state.brief.preferences[0], 'gardening');
});

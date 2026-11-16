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
  assert.match(second.brief.timing, /next Friday/i);
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

test('gift brief accepts short guided answers instead of repeatedly asking the same question', () => {
  const budget = advanceGiftBrief({ recipient: 'mum', occasion: 'birthday', preferences: ['reading'] }, 'about 60', 3);
  assert.equal(budget.score, 4);
  assert.match(budget.brief.budget, /60/);
  const clue = advanceGiftBrief({ recipient: 'mentor', occasion: 'thank-you', budget: '£50', timing: 'no fixed date' }, 'A keen cook who hates clutter', 3);
  assert.equal(clue.score, 4);
  assert.match(clue.brief.preferences[0], /keen cook/i);
  const flexible = advanceGiftBrief({ recipient: 'friend', occasion: 'birthday' }, 'My budget is flexible; show me good value.', 2);
  assert.match(flexible.brief.budget, /flexible/i);
});

test('gift brief recognises common deadlines and asks for timing before reveal', () => {
  const base = { recipient: 'friend', occasion: 'birthday', budget: 'under £50', preferences: ['running'] };
  const missing = advanceGiftBrief(base, 'not sure', 2);
  assert.equal(missing.readyToReveal, false);
  assert.equal(missing.missing[0], 'when it needs to be ready');
  assert.match(missing.nextQuestion, /when/i);
  for (const [message, expected] of [
    ['I need it within 3 days', /within 3 days/i],
    ['I need it this month', /need it this month/i],
    ['It should arrive before 20 December', /before 20 December/i],
    ['ASAP please', /asap/i],
    ['No fixed date', /no fixed date/i]
  ]) {
    const state = advanceGiftBrief(base, message, 2);
    assert.match(state.brief.timing, expected);
    assert.equal(state.readyToReveal, true);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { contactName, lifecycleStage } from '../src/marketing-handler.mjs';

test('marketing contacts use human profile names', () => {
  assert.deepEqual(contactName('Job Oyebisi'), { firstName: 'Job', lastName: 'Oyebisi' });
  assert.deepEqual(contactName('  Cher  '), { firstName: 'Cher' });
});

test('safe lifecycle stages follow achieved product value', () => {
  assert.equal(lifecycleStage('contact.preferences_updated'), 'subscribed');
  assert.equal(lifecycleStage('gift_brief.saved'), 'saved-brief');
  assert.equal(lifecycleStage('gift_item.saved'), 'saved-item');
  assert.equal(lifecycleStage('full_service.waitlist_joined'), 'waitlist');
});

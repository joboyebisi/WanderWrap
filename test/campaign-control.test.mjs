import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignOperationsSnapshot, REGIONAL_CAMPAIGNS } from '../src/campaign-control.mjs';

test('holiday launch covers only the three approved markets', () => {
  assert.deepEqual(REGIONAL_CAMPAIGNS.map(campaign => campaign.market), ['GB', 'US', 'CA']);
  assert.match(REGIONAL_CAMPAIGNS.find(campaign => campaign.market === 'US').themes.join(' '), /Thanksgiving/);
  assert.doesNotMatch(REGIONAL_CAMPAIGNS.find(campaign => campaign.market === 'CA').themes.join(' '), /Thanksgiving/);
});

test('campaign control fails closed until Loops delivery gates pass', () => {
  const snapshot = campaignOperationsSnapshot({ MARKETING_QUEUE_URL: 'queue', LOOPS_SECRET_CONFIGURED: 'false', LOOPS_MARKETING_ENABLED: 'false', TRANSACTIONAL_EMAIL_CONFIGURED: 'true' });
  assert.equal(snapshot.mode, 'safe-draft');
  assert.ok(snapshot.campaigns.every(campaign => campaign.deliveryStatus === 'blocked-until-email-gates-pass'));
  assert.ok(snapshot.agents.every(agent => agent.autonomy !== 'send'));
});

export const REGIONAL_CAMPAIGNS = Object.freeze([
  {
    id: 'holiday-2026-gb',
    market: 'GB',
    region: 'United Kingdom',
    locale: 'en-GB',
    currency: 'GBP',
    window: 'November–December 2026',
    themes: ['Christmas gifting', 'thoughtful last-minute ideas', 'year-end thank-yous'],
    audienceRule: 'seasonalIdeas=true AND country=GB',
    compliance: 'Explicit opt-in; sender identity and one-click unsubscribe; suppress revocations, bounces and complaints.',
    status: 'draft'
  },
  {
    id: 'holiday-2026-us',
    market: 'US',
    region: 'United States',
    locale: 'en-US',
    currency: 'USD',
    window: 'November–December 2026',
    themes: ['Thanksgiving gratitude', 'Christmas and holiday gifting', 'year-end thank-yous'],
    audienceRule: 'seasonalIdeas=true AND country=US',
    compliance: 'WanderWrap opt-in standard; accurate sender identity, postal address and working unsubscribe in every campaign.',
    status: 'draft'
  },
  {
    id: 'holiday-2026-ca',
    market: 'CA',
    region: 'Canada',
    locale: 'en-CA',
    currency: 'CAD',
    window: 'November–December 2026',
    themes: ['Christmas and holiday gifting', 'winter celebrations', 'year-end thank-yous'],
    audienceRule: 'seasonalIdeas=true AND country=CA',
    compliance: 'Express or evidenced CASL consent; identify WanderWrap and provide a working unsubscribe mechanism.',
    status: 'draft'
  }
]);

export const AGENT_OPERATORS = Object.freeze([
  { id: 'campaign-research', name: 'Campaign research dot', autonomy: 'read-only', responsibility: 'Research seasonal context and propose region-specific briefs from approved sources.', approval: 'Cannot select recipients, change consent or send.' },
  { id: 'content-steward', name: 'Content steward dot', autonomy: 'draft-only', responsibility: 'Prepare subject lines, body variants and accessibility checks using approved campaign facts.', approval: 'A human approves every published template and campaign.' },
  { id: 'lifecycle-analyst', name: 'Lifecycle analyst dot', autonomy: 'read-only', responsibility: 'Review aggregate consented lifecycle events and suggest segments or frequency changes.', approval: 'No prompt text, recipient details or direct identifiers are available.' },
  { id: 'delivery-watch', name: 'Delivery watch dot', autonomy: 'read-only', responsibility: 'Monitor queue, bounce, complaint and unsubscribe health and prepare incident notes.', approval: 'Replay, suppression changes and sends require an administrator.' }
]);

export function campaignOperationsSnapshot(env = process.env) {
  const gates = {
    transactionalEmail: env.TRANSACTIONAL_EMAIL_CONFIGURED === 'true',
    lifecycleQueue: Boolean(env.MARKETING_QUEUE_URL),
    loopsSecret: env.LOOPS_SECRET_CONFIGURED === 'true',
    loopsSending: env.LOOPS_MARKETING_ENABLED === 'true'
  };
  return {
    mode: gates.loopsSending ? 'limited-production' : 'safe-draft',
    gates,
    campaigns: REGIONAL_CAMPAIGNS.map(campaign => ({ ...campaign, deliveryStatus: gates.loopsSecret && gates.loopsSending ? 'eligible-after-approval' : 'blocked-until-email-gates-pass' })),
    agents: AGENT_OPERATORS,
    approvalPolicy: 'Agents may research, draft and monitor. Audience changes, publishing, sending, replaying failures and provider writes require an authenticated administrator and an audit event.'
  };
}

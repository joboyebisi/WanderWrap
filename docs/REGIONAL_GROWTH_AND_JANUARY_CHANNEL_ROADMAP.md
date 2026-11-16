# Regional growth control plane and January channel roadmap

Last reviewed: 2026-11-16

## November–December launch system

WanderWrap will launch one consent-led seasonal programme across GB/GBP, US/USD and CA/CAD. The source of truth is the versioned campaign registry in `src/campaign-control.mjs`; `/v1/admin/operations` exposes the registry and live enablement gates only to the `wanderwrap-admins` Cognito group. The console is deliberately read-only while role elevation, step-up authentication, reason capture, dual control and recovery are not yet implemented.

Each market has its own locale, currency, themes, audience expression and compliance note. Thanksgiving is a US theme in this November–December programme; it is not inferred for UK or Canadian users. Christmas or any other observance is an explicit campaign choice, never a belief inferred from location. A contact is eligible only when the relevant consent property is true and their chosen shopping market matches the campaign. Approximate IP country can choose an initial storefront but cannot create marketing consent.

The delivery split remains:

- Amazon SES in `eu-west-2` for essential identity/security messages through Cognito.
- Loops for opted-in lifecycle education, seasonal inspiration and the full-service waitlist.
- No payment, order, fulfilment or delivery-confirmation messages until those provider evidence gates are live.

The administrator must see all of the following before a campaign can move from draft to limited production: verified sending domain, encrypted provider credential, successful contact-property sync, reviewed/published workflow, working unsubscribe, current consent recheck, synthetic delivery, bounce/complaint suppression, retry and DLQ recovery. Campaigns use small cohorts and a maximum frequency policy before expansion.

## Agent-managed operations

The first agent roles are encoded in the admin snapshot but are not represented as deployed Dots until a company-controlled OpenAI workspace, required plugins and Custom Rules are configured.

- **Campaign research dot — read-only:** monitors calendars, market context and approved sources; proposes briefs.
- **Content steward dot — draft-only:** creates localized subject/body variants and accessibility checks; never publishes.
- **Lifecycle analyst dot — read-only:** reviews aggregate, consented product events and proposes segment/frequency changes. It receives no prompts, recipient details or direct identifiers.
- **Delivery watch dot — read-only:** monitors queues, bounces, complaints and unsubscribes; prepares incident notes. It cannot replay or send.

Human approval is mandatory for audience changes, publishing, sends, provider writes, suppression changes, DLQ replay and customer-account actions. Dots' proactive research should use read-only connectors; writable actions require Custom Rules and approval. Activity/audit records must identify the agent, operator, input evidence, proposed action, approval and outcome.

Official platform basis: [OpenAI Dots](https://openai.com/index/introducing-dots/), [Loops API](https://loops.so/agents/api), and [Loops workflows](https://loops.so/agents/workflows).

## Regional compliance baseline

WanderWrap uses explicit opt-in everywhere even where a narrower exception might exist. This gives one explainable global rule and satisfies the strict Canadian baseline.

- **UK:** electronic marketing to individuals requires consent unless every soft-opt-in condition applies; every message needs an opt-out. Social DMs are electronic marketing too. [ICO electronic mail marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/)
- **US:** campaigns must have accurate sender information, a valid physical postal address and a functioning opt-out processed promptly. WanderWrap still requires affirmative product consent as its product policy. Legal counsel must verify the final footer and state-law overlay before launch. [FTC CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- **Canada:** CASL commercial electronic messages require consent, identification/contact information and a working unsubscribe. Evidence of consent must be retained. [CRTC CASL guidance](https://crtc.gc.ca/eng/com500/guide.htm)

This document is an engineering baseline, not legal advice. Final identity, address, processor and retention facts require counsel approval before the first campaign.

## January: Teams, enterprise and WanderWrap HRI

January scope is a governed enterprise gifting workspace, not autonomous purchasing:

1. Tenant, membership and RBAC: owner, administrator, programme manager, organiser, contributor, viewer and audited support.
2. SSO/SCIM and domain verification for enterprise tenants; tenant-owned retention, export and deletion policies.
3. WanderWrap HRI as a versioned enterprise capability whose final expansion and claims require product-owner definition before external copy. Initial implementation may cover governed relationship/occasion context, approvals and personalised gift briefs; it must not imply sensitive-trait inference or automatic surveillance.
4. Budget policies, campaign briefs, recipient eligibility, approval chains, exception queues, audit export and external-retailer handoff. Payments remain unavailable until separately approved.
5. Channel adapters use the same proposal/approval envelope as the web app. Each adapter verifies signatures, scopes every tenant, deduplicates events and never treats a chat instruction as authorization to purchase or message another person.

### Enterprise channels

- **Slack:** org-ready OAuth application with minimum bot scopes, signed Events API requests, tenant/workspace mapping and an administrator-approved install. Enterprise-managed authorization can be evaluated for Enterprise Grid. The bot responds only in installed/authorized contexts. [Slack Events API](https://docs.slack.dev/apis/events-api/)
- **Telegram:** users must start the bot or add it to a group; Privacy Mode stays enabled by default. WanderWrap reads commands, direct replies and explicitly invoked messages, not whole group history. [Telegram bots](https://core.telegram.org/bots)
- **WhatsApp:** use the Business Platform, verified webhooks and approved utility/marketing templates. Each recipient requires the appropriate opt-in and campaign category. [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview)

## January: consented people and social connections

The product objective is to help a user identify people they can legitimately gift—not to classify strangers from social content.

The connection graph uses explicit evidence states:

1. `provider_connected`: the user authorized a specific provider and scopes.
2. `provider_relationship`: the provider explicitly returned an edge such as mutual app friendship/following.
3. `address_book_match`: both sides independently consented to privacy-preserving contact discovery; raw address books are not retained.
4. `user_confirmed`: the giver confirms this is a friend/family/contact and may optionally state the relationship.
5. `recipient_confirmed`: the recipient accepts a private gifting connection or gift claim.

Only `user_confirmed` or `recipient_confirmed` relationships may drive gifting/reminders. Provider edges can propose candidates but are never sufficient to infer closeness, family status, occasion or preference. Proposed matches carry provider, scope, timestamp and revocation provenance; disconnecting a provider removes its proposals and rank contribution.

Facebook's `user_friends` edge returns only friends who also use the same app and grant the permission, so it cannot represent a complete friend list. [Meta `user_friends`](https://developers.facebook.com/docs/graph-api/reference/user/friends). X following/follower edges indicate platform relationships, not personal friendship. Address-book matching must use explicit OS permission, normalized contact points protected with keyed hashing or private-set-intersection design, strict tenant/user isolation and deletion on revocation.

Never scrape profiles, continuously monitor recipients, ingest arbitrary posts, infer sensitive traits, upload a non-user's contact data for marketing, or message a matched person without their consent. Follow `docs/WANDERSIGNAL_PRD.md` for evidence selection, confirmation, revocation, abstention and evaluation gates.

## Acceptance gates

- The admin API and UI remain group-gated and write an audit event when viewed.
- Regional definitions are version-controlled and tests prevent Thanksgiving from being assigned to the Canadian programme.
- All agent roles are read-only or draft-only until an administrator approves a precisely scoped action.
- Marketing sends fail closed without current category consent, country match, provider credential and enable flag.
- Social candidates are provenance-rich proposals; only confirmed relationships become rank-eligible.
- Every channel adapter has signature verification, OAuth/token rotation, tenant binding, idempotency, rate limits, replay protection and a kill switch before launch.

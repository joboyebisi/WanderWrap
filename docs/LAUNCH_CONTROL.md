# WanderWrap launch control

**Owner:** Founder / launch operator
**Target checkpoint:** Tuesday 17 November 2026
**Status:** active handoff document
**Rule:** update this file and `PROJECT_STATE.md` whenever a launch dependency changes.

## 1. Launch order

### P0 — Consumer web loop

Ship one complete, measurable loop before adding more channels:

1. landing prompt → guest Gift Finder conversation;
2. editable, explainable Gift Brief;
3. secure account creation before durable saving/full recommendation reveal;
4. current product shortlist and shopping-site handoff;
5. separate opt-ins for full-service launch and concierge completion;
6. saved conversation/brief, feedback and deletion controls;
7. operational dashboard for leads, provider health and privacy requests.

**Launch evidence:** a new customer can complete this loop on mobile and desktop; no state is lost at sign-in; price/availability is refreshed; every external handoff is labelled; account export/deletion and consent withdrawal work.

### P0 in parallel — Trust and operations

- operating mailbox suite live and monitored;
- branded `auth.wanderwrap.co.uk` and email/password sign-in;
- Google sign-in only after verified WanderWrap OAuth branding and account-link tests;
- privacy/cookies/terms reviewed with confirmed company details;
- incident, support, privacy-request and lead-response playbooks;
- non-root AWS administration through IAM Identity Center;
- production backups, alarms, structured-log redaction and restore test.

### P1 — Teams demand capture

Launch the executive enquiry page now. Do not build the enterprise campaign workspace until at least five qualified conversations identify the same approval, reporting and fulfilment needs. Manually respond within one business day and capture structured discovery notes.

### P1 — Fulfilment provider pilot

Apply to Goody first, and Snappy as a parallel enterprise option. Keep Channel3 for discovery. Restore Unwrap only when one provider passes sandbox evidence for send/create, recipient claim or choice, status, cancellation/refund behavior, webhook verification, idempotency and UK market coverage.

### P2 — Saved relationship and occasion system

Add People, Occasions, saved briefs, reminders and recipient-approved preferences after the account/data-rights foundation. Manual entry comes before calendar/contact imports. Google Calendar/Contacts are separate connections, never implied by Google sign-in.

### P3 — Additional surfaces

1. responsive PWA/mobile shell using the same API and journey contracts;
2. Alexa/voice after account linking and the web flow are stable;
3. share extension/mobile share sheet for selected social evidence;
4. native mobile only when retention proves repeat use;
5. social messaging bots only after provider review and a clear customer need.

## 2. Tuesday 17 November reminder

**Reminder title:** WanderWrap launch operations and accelerator deadline
**Due:** Tuesday 17 November 2026, 17:00 Europe/London
**Suggested alerts:** Monday at 09:00; Tuesday at 09:00 and 15:00.

Complete or explicitly reschedule every item:

- [ ] Create and test the operational email suite in section 3.
- [ ] Submit the Goody API/partner application.
- [ ] Submit the Snappy API/enterprise enquiry and identify one UK-capable backup provider.
- [ ] Submit the late YC Winter 2027 application; record confirmation and application owner.
- [ ] Submit Techstars before the 18 November final deadline; prioritise London, then the best generalist programme fit.
- [ ] Finalise the one-minute founder/product video, demo link, deck, traction numbers and founder profiles used by both applications.
- [ ] Start IAM Identity Center setup so production AWS changes no longer use root.
- [ ] Confirm GoDaddy access and add the ACM validation record for `auth.wanderwrap.co.uk` after a non-root operator requests it.
- [ ] Confirm the legal entity name, registered/postal address and monitored privacy contact for the Trust Centre.

The Google Calendar connector was unavailable when this reminder was written, so no calendar event has been claimed as created. Copy the title, due time, alerts and checklist into the founder's calendar if the connector remains unavailable.

## 3. Essential email suite

Create these as role addresses or aliases on the company mail system; do not create separate passwords for every address. Route them into a small number of protected shared inboxes with MFA, recovery contacts and named owners.

| Address | Purpose | Initial owner/SLA |
|---|---|---|
| `privacy@wanderwrap.co.uk` | Data rights, consent withdrawal and privacy incidents | Founder/privacy owner; acknowledge within 2 business days |
| `support@wanderwrap.co.uk` | Customer help, account and Gift Finder issues | Operations; reply within 1 business day |
| `hello@wanderwrap.co.uk` | General and partnership enquiries | Founder; reply within 2 business days |
| `teams@wanderwrap.co.uk` | Executive Teams enquiries | Founder/sales; reply within 1 business day |
| `security@wanderwrap.co.uk` | Vulnerability and security reports | Technical owner; acknowledge within 1 business day |
| `legal@wanderwrap.co.uk` | Contracts, provider terms and formal notices | Founder/legal owner |
| `billing@wanderwrap.co.uk` | Future invoices, refunds and payment support | Finance/operations; activate before payments |
| `notifications@wanderwrap.co.uk` | Transactional sending identity only; not a support inbox | Automated sender with monitored bounce/reply handling |
| `founders@wanderwrap.co.uk` | Accelerator, investor and high-priority partner correspondence | Founders |

Setup checklist:

- [ ] SPF contains every approved sender and only one SPF record exists.
- [ ] DKIM enabled for each sending service.
- [ ] DMARC starts with reporting, routes aggregate reports to a monitored mailbox, then moves toward quarantine/reject after legitimate senders pass.
- [ ] MFA and recovery methods tested for all mailbox administrators.
- [ ] No production secret, API key or customer export is sent by ordinary email.
- [ ] Privacy, support and security addresses are published only after inbound and outbound tests pass.
- [ ] Ticket labels and response templates distinguish service messages from optional marketing.

When `wanderwrap.com` is acquired, add matching aliases and make the `.com` addresses primary gradually. Keep `.co.uk` aliases receiving indefinitely. Do not change customer authentication and email domains simultaneously.

## 4. Branded authentication runbook

Current facts verified on 15 November 2026:

- production user pool: `wanderwrap-users` in `eu-west-2`;
- DNS for `wanderwrap.co.uk`: GoDaddy nameservers, not Route 53;
- no certificate for `auth.wanderwrap.co.uk` exists in ACM `us-east-1`;
- AWS CLI currently authenticates as account root, so production mutation is paused;
- infrastructure now supports optional `AuthDomainName` and `AuthCertificateArn` parameters without hard-coding the domain.

Execution order:

1. Configure AWS IAM Identity Center and a least-privilege production identity role.
2. Request an ACM public certificate for `auth.wanderwrap.co.uk` in `us-east-1` using that role.
3. Add the ACM DNS-validation CNAME in GoDaddy and wait for `ISSUED`.
4. Deploy `infrastructure/template.yaml` with `AuthDomainName=auth.wanderwrap.co.uk` and the certificate ARN.
5. Add the returned `CognitoCustomDomainDnsTarget` as the GoDaddy CNAME target for host `auth`.
6. Wait for Cognito domain status `ACTIVE`, then set the web deployment's `WANDERWRAP_OAUTH_BASE_URL=https://auth.wanderwrap.co.uk` and redeploy.
7. Apply Cognito Managed Login branding: WanderWrap name, emblem, favicon, forest/ivory palette and accessible focus/contrast.
8. Test sign-up, verification, login, reset, cancellation, logout, expired state and refresh on production.
9. Create Google OAuth branding/client, verify WanderWrap branding, store the secret encrypted, add the Google IdP to Cognito and test new/existing-email collision behavior.
10. Add Facebook only if demand justifies its maintenance and review burden.

Acquiring `wanderwrap.com` later does not block this plan. Keep `auth.wanderwrap.co.uk` stable while `.com` becomes the primary marketing domain. If authentication is later moved to `auth.wanderwrap.com`, treat it as a controlled migration with both callback sets, session testing and rollback—not a DNS rename.

## 5. Accelerator application pack

Use one evidence pack for YC and Techstars:

- one-line company description;
- founder story and why this team;
- problem, current product and why now;
- live URL and 60–90 second demo;
- what is genuinely live versus early access;
- current users, conversations, leads, conversion and retention—never vanity forecasts presented as traction;
- business model: consumer/concierge margin hypotheses plus Teams platform/service model;
- moat: consented preference evidence, editable Gift Brief, explainable ranking and provider-neutral orchestration;
- competition and why a retailer search/chatbot is not the whole product;
- 12-month milestones and use of funds;
- incorporation, ownership, time commitment and founder video details.

YC Winter 2027's on-time deadline has passed, but YC states that late applications are still considered. Submit promptly rather than waiting. Techstars currently lists multiple programmes with a final deadline of 18 November 2026; complete the shared application pack by the 17th so the final day is buffer, not production time.

## 6. Extensibility rules

- All channels call the same versioned journey, consent, Gift Brief, recommendation, approval and audit services.
- Product discovery, gifting/fulfilment, payments, messaging and preference extraction remain registered provider adapters behind capability contracts.
- Never import provider-specific fields into the core domain; normalize them at the adapter boundary and retain provider provenance.
- External writes require idempotency, immutable approval evidence, signed webhook verification and an `outcome_unknown` state.
- UI surfaces consume stable API/view models; web, PWA, native mobile, voice and enterprise interfaces must not reimplement ranking or consent rules.
- Every new provider ships with a conformance test, feature flag, health check, rollback path and live-integration evidence.
- Every new personal-data source ships with a separate scope, purpose, retention period, revoke path and deletion propagation test.
- Keep secrets in encrypted platform stores, keep customer content out of URLs/logs and keep production access non-root and least-privilege.

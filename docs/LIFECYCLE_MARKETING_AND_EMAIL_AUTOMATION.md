# Lifecycle marketing and email automation

Status: implemented behind a disabled production gate. Loops sending-domain DNS is published. A separate Amazon SES transactional identity and return-path are also provisioned for essential account mail. Loops API credential creation, provider drafts and end-to-end consent/revocation evidence remain required before lifecycle sending is enabled.

## Provider decision

Use **Loops** for the first product-led lifecycle programme. Its free plan supports up to 1,000 contacts and 4,000 emails in 30 days, with marketing, product and transactional features. Its contact properties, segments and event-triggered workflows suit WanderWrap's activation journey better than a newsletter-first system. Brevo is the fallback if WanderWrap later needs a broader CRM/sales suite; MailerLite's current free subscriber allowance is below the first-1,000 requirement.

Official references: [free plan](https://app.loops.so/docs/account/free-plan), [API](https://loops.so/agents/api), [workflows](https://loops.so/workflows), [contact subscription behaviour](https://app.loops.so/docs/contacts/properties), and [DNS authentication](https://loops.so/tools/dns-checker).

## Consent and data contract

The user chooses each category separately: product guidance, seasonal ideas, and full-service launch news. No box is preselected. Preferences live in DynamoDB at `USER#<subject>` / `MARKETING#PREFERENCES`; consent changes are audited. Setting every category to false sends an explicit unsubscribe update to Loops. Essential identity, security and service messages are outside these marketing choices.

Only the email, stable Cognito subject, consent flags, market/currency and named lifecycle event leave WanderWrap. Prompts, recipient names, Gift Brief text and product titles never enter the marketing queue. The Loops API key stays in AWS Secrets Manager.

The application publishes to an encrypted SQS queue and returns immediately. A separately permissioned Lambda reads the user's current preference before every provider call, retries transient failures and sends poison messages to a retained dead-letter queue. The provider is disabled unless `LOOPS_MARKETING_ENABLED=true`, the secret ARN is configured, and the following launch gates pass.

## Delivery responsibilities

- **Amazon SES in eu-west-2** sends only essential Cognito identity and security messages from `WanderWrap <no-reply@wanderwrap.co.uk>`. Its custom MAIL FROM domain is `notify.wanderwrap.co.uk`, separate from Loops. SES account suppression covers bounces and complaints, and the transactional configuration set requires TLS and enables reputation metrics.
- **Loops** sends opt-in product education, seasonal inspiration, full-service waitlist mail and future editable product notifications. A marketing unsubscribe must never prevent verification, recovery or security mail.
- Payment confirmations remain drafts and must not be published while payments are unavailable. No template or provider state may imply that WanderWrap accepted payment, placed an order or fulfilled a gift.

## Segments and workflows

Create these Loops custom contact properties before enabling: `productUpdates` (boolean), `seasonalIdeas` (boolean), `fullServiceWaitlist` (boolean), `country` (string), `currency` (string), `lifecycleStage` (string), and `lastActiveAt` (date). Standard `firstName` and `lastName` fields come from the user's persisted Cognito-backed profile. Create workflows with exits and frequency controls:

1. **Welcome to first value** — `contact.preferences_updated`; welcome immediately, then one Gift Finder starter after 24 hours only if no `gift_brief.saved` event occurred.
2. **Brief to saved find** — `gift_brief.saved`; acknowledge the saved space, then explain the heart action after three days only if no `gift_item.saved` event occurred.
3. **Power-user progress** — three saved briefs or five saved items, once counters are added; ask for feedback and teach reuse rather than increasing volume.
4. **Seasonal help** — only `seasonalIdeas=true`, segmented by country and scheduled for locally relevant occasions. Never infer a religious or cultural observance from location.
5. **Re-engagement** — 14 and 30 days after last meaningful use, maximum two attempts, then suppress until a new product event.
6. **Full-service waitlist** — only `fullServiceWaitlist=true`; a confirmation and the eventual availability notice. Do not send unrelated campaigns to this segment.

Recommended cap: at most two automated lifecycle messages per person per week plus one opted-in seasonal message per month. Workflows must exit after their goal event and suppress bounced, complained or unsubscribed contacts.

## Measurement

Measure consent rate, first Gift Brief completion, first saved item, second-session return, click-to-Gift-Finder, unsubscribe, complaint and bounce rates. Attribute links with documented UTM parameters and measure the destination event with the existing consent-gated analytics adapter. Do not optimise primarily for open rate; privacy features make it noisy. No marketing cookie is needed for provider delivery.

## Launch checklist

- Create the Loops workspace under a company-controlled address and enable MFA.
- Authenticate a dedicated sending subdomain with SPF, DKIM and DMARC; keep the web and Cognito records unchanged.
- Create the five custom properties, categories/lists and the first two workflows in draft.
- Store the API key in Secrets Manager and deploy `LoopsApiKeySecretArn` while the enable flag remains false.
- Test opt-in, category change, all-category revocation, provider unsubscribe, bounce, retry and DLQ behaviour with synthetic accounts.
- Publish workflows, enable the CloudFormation flag, observe the first small cohort, then record evidence in `docs/LIVE_INTEGRATION_CHECKLIST.md`.
- Add Loops to the final privacy-policy processor list with purpose, region/subprocessor and transfer terms after counsel review.

The Loops MCP can later help an operator inspect contacts and workflows, but it does not replace audited application events or action-time approval for provider writes.

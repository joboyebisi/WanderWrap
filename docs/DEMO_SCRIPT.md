# WanderWrap demo script

Target length: 2:35-2:50. Record in English at 1080p. Use a clean test account only if the production OAuth smoke test passes; otherwise use the no-account local browser simulator. Hide bookmarks/notifications and redact IDs or tokens from logs.

## Before recording

- Open the WanderWrap landing page and browser simulator in separate tabs.
- Reset the journey; keep the partner/ceramics scenario ready.
- Use Amazon's isolation-mode simulator only if official onboarding is complete. Otherwise label the recording **WanderWrap browser simulator** and do not call it an Alexa+ Web Simulator recording.
- Keep catalogue, price and delivery fixtures visibly disclosed.
- Keep a terminal ready with the final `npm run check` and `npm run test:e2e` summaries, not raw credentials or environment variables.

## 0:00-0:25 — The real moment

**On screen:** WanderWrap landing-page hero, then the channel/consent section.

**Say:**

> WanderWrap started when I wanted to surprise my partner with a gift they would genuinely enjoy. Asking directly would ruin the surprise, but guessing felt impersonal. I already remembered clues from our life together—things they had mentioned and moments they enjoyed. WanderWrap turns only the clues I confirm into thoughtful, explainable ideas, without reading private messages or buying anything for me.

## 0:25-1:20 — Ask naturally; see why it fits

**On screen:** The clearly labelled WanderWrap browser simulator. Enter or speak:

> Help me surprise my partner with a thoughtful gift. They like ceramics and slow Sunday mornings. Keep it under sixty pounds.

**After the response, say:**

> This simulation runs the same Alexa+ journey against WanderWrap's MCP tools. The result uses a clue my partner actually shared and I confirmed—not a hidden personality profile. Each idea explains why it fits, and the tool trace shows initialization, discovery and recommendation.

**Show:** the top recommendation and multimodal card, then ask:

> What is the safest way to get it to them?

**Say:**

> The routing tool separates gift quality from fulfilment. A provider route must have evidence; otherwise WanderWrap returns an honest fallback. It never invents stock or delivery.

## 1:20-1:45 — Safe routing, not a silent purchase

**On screen:** Run the prepared Amazon-unavailable route.

**Say:**

> If a verified Amazon offer is unavailable, WanderWrap returns an approved supplier proposal or a manual review. This demo uses fixture routes: it is not a completed Amazon order or PayPal payment. Ambiguous writes never fail over automatically, so a timeout cannot create a duplicate order.

## 1:45-2:15 — Continue on the web

**On screen:** Switch to the WanderWrap gift workspace and connections page. If production login is not verified, use the local demo and say so.

**Say:**

> The customer can continue on the web with the same gifting context. They can add a person, confirm an interest, save an idea for approval, and see which channels are genuinely available. Alexa, calendar, Telegram, Facebook and X are separate permissions—not bundled access to someone else's private life.

**Show:** save-for-approval confirmation and the connections readiness labels.

## 2:15-2:35 — Technical proof

**On screen:** Show the redacted MCP trace, then the passing test summaries.

**Say:**

> Underneath, WanderWrap is a Streamable HTTP MCP server using protocol 2025-11-25, deployed on AWS with Cognito PKCE, scoped tokens, encrypted DynamoDB and CloudWatch alarms. Ninety-two contracts plus an end-to-end HTTP suite cover initialization, discovery, recommendation, routing and approval rejection.

## 2:35-2:50 — Close

**On screen:** Return to the strongest recommendation card or landing hero.

**Say:**

> WanderWrap preserves the surprise without making privacy the price of convenience. One thoughtful journey can begin with Alexa+, continue on the web, and end only when the customer approves. Remember the person. Find the gift.

## Recording shot list

1. Landing hero and consent promise — 8 seconds.
2. Partner prompt in the browser simulator — 12 seconds.
3. Recommendation reason and MCP tool trace — 35 seconds.
4. Amazon-unavailable fixture and honest route label — 25 seconds.
5. Gift workspace plus connections readiness — 30 seconds.
6. Passing test summary and architecture caption — 20 seconds.
7. Hero closing frame — 15 seconds.

## Optional judge Q&A

**Did it place an Amazon order?**  
No. It recommends and prepares a marketplace handoff. Amazon or Alexa+ owns eligible checkout and final confirmation.

**Is PayPal live?**  
The server-side sandbox client boundary and webhook-verification contracts exist. It is not called live until the credentialed sandbox create/approve/capture/webhook evidence is recorded.

**Does it read Facebook or private messages?**  
No. Social and calendar connectors are optional, granular and not live. Recipient preferences must be confirmed before ranking.

**Do you need an Echo?**  
No for this hackathon's permitted simulated-experience path. Official Alexa+ Web Simulator evidence remains an onboarding gate.

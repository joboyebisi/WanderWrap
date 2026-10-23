# WanderWrap three-minute demo script

Target length: 2:45–3:00. Record in English at 1080p. Use a clean verified test account, hide browser bookmarks/notifications and redact IDs or tokens from logs.

## Before recording

- Open the WanderWrap landing page, signed-out dashboard and Alexa+ Web Simulator in separate tabs.
- Reset the test journey; keep the Toronto/ceramics scenario ready.
- Use Amazon’s isolation-mode simulator for the primary take. If Amazon onboarding is not complete, label the recording “WanderWrap browser simulator” and do not call it an Alexa+ Web Simulator recording.
- Ensure any catalogue, price or delivery fixture is visibly disclosed.
- Keep a terminal ready with the final `npm run check` summary, not raw credentials or environment variables.

## 0:00–0:20 — Problem and promise

**On screen:** WanderWrap landing-page hero, then the channel/consent section.

**Say:**

> Buying a gift is easy. Remembering what makes it thoughtful—and whether it can actually reach someone—is the hard part. WanderWrap is a consent-first gifting companion for Alexa+ and the web. It turns only confirmed clues into explainable ideas, then checks a safe route before anything leaves the app.

## 0:20–1:15 — Natural Alexa+ journey

**On screen:** Alexa+ Web Simulator in isolation mode. Enter or speak:

> Help me find a thoughtful Christmas gift for my sister in Toronto. She likes ceramics and slow weekends. Keep it under sixty pounds.

**After the response, say:**

> Alexa+ discovers WanderWrap’s remote MCP tools. The recommendation is produced from a preference she actually shared—not a hidden personality profile. Each result includes a reason, a guide price when available, and a clear next step.

**Show:** the top recommendation and multimodal card, then ask:

> Can it arrive in Canada?

**Say:**

> The routing tool separates gift quality from fulfilment. A verified Amazon offer can hand off to the recipient’s marketplace; otherwise WanderWrap returns an approved supplier route or an honest manual review. It never invents stock or delivery.

## 1:15–1:45 — Safe fallback

**On screen:** Run the prepared Amazon-unavailable route.

**Say:**

> Here Amazon is unavailable. The same journey falls back to a PayPal-capable supplier proposal. This is a route decision, not a completed payment. Ambiguous writes never fail over automatically, so a timeout cannot create a duplicate order.

## 1:45–2:15 — Web continuation and customer control

**On screen:** Switch to the authenticated WanderWrap dashboard and connections page.

**Say:**

> The customer can continue on the web with the same account and gifting context. They can add a person, confirm an interest, save an idea for approval, and see which channels are genuinely available. Alexa, calendar, Telegram and Messenger are separate permissions—not bundled access to someone’s private life.

**Show:** save-for-approval confirmation and the connections readiness labels.

## 2:15–2:40 — Technical proof

**On screen:** Show the redacted tool trace, then the short passing-test summary.

**Say:**

> Underneath, WanderWrap is a Streamable HTTP MCP server using protocol 2025-11-25, deployed on AWS with Cognito PKCE, scoped resource-bound tokens, encrypted DynamoDB and CloudWatch alarms. The suite covers ninety-two contracts plus the authenticated HTTP journey across initialization, discovery, recommendation, routing and approval rejection.

## 2:40–3:00 — Close

**On screen:** Return to the strongest recommendation card or landing hero.

**Say:**

> WanderWrap makes gifting feel personal without making privacy the price of convenience. One thoughtful journey can begin with Alexa+, continue on the web, and end only when the customer explicitly approves. Remember the person. Find the gift.

## Optional judge Q&A answers

**Did it place an Amazon order?**  
No. It recommends and prepares a marketplace handoff. Amazon or Alexa+ owns eligible checkout and final confirmation.

**Is PayPal live?**  
The server-side sandbox client boundary and webhook verification contracts exist. Call it live only after the credentialed sandbox create/approve/capture/webhook evidence is recorded.

**Does it read Facebook or private messages?**  
No. Social and calendar connectors are optional, granular and not live. Recipient preferences must be confirmed before ranking.

**Do you need an Echo?**  
No for the simulator-first demo. The official Alexa+ Web Simulator provides the end-to-end development-stage path; representative device QA remains a production/certification gate.

# WanderWrap demo script

Target length: 2:35–2:50. Record in English at 1080p. Use the local browser simulator unless official Alexa+ onboarding has been completed. Hide notifications and never show credentials, tokens, or private partner data.

## Before recording

- Start the app with `npm run demo`, then open `http://127.0.0.1:4202/alexa-simulator.html`.
- Keep the default Echo Show 8 surface selected and click **Load example clues** only after recording begins.
- Use only the fictional example excerpts. Do not paste real partner posts into the recording.
- Keep the **Fixtures disclosed** badge, Amazon fixture status, and approval language visible.
- Keep a terminal ready with the final `npm run check` and `npm run test:e2e` summaries.

## 0:00–0:22 — The real moment

**On screen:** WanderWrap landing-page hero, then the interactive simulator hero.

**Say:**

> WanderWrap started when I wanted to surprise my partner with a gift they would genuinely enjoy. Asking directly would spoil the surprise, but guessing felt impersonal. The clues were already in things they had chosen to share. WanderWrap turns only selected, permitted clues into gift ideas—and keeps me in control before anything leaves the app.

## 0:22–0:58 — Selected clues, not surveillance

**On screen:** Click **Load example clues**, briefly show the three fictional excerpts, tick the permission box, then click **Find safe clues**.

**Say:**

> I can paste a few relevant excerpts I am allowed to use. WanderWrap does not connect to my partner’s account, scrape a feed, or retain this raw text. The privacy and preference agents process it transiently, reject sensitive material, and return possible interests—not facts.

**Show:** the visible agent rail moving from waiting to complete.

## 0:58–1:22 — Human confirmation is the boundary

**On screen:** Show the candidate interests and click **Confirm & coordinate**.

**Say:**

> These candidates cannot affect ranking until I confirm that they match what I personally know. That small step preserves the surprise without turning a social post into a hidden personality profile.

## 1:22–1:52 — Agents coordinate an explainable shortlist

**On screen:** Show the four cards and their reasons. Select **Make-your-own ceramic cup**.

**Say:**

> The recommendation agent now works only from confirmed interests. The catalogue and fulfilment agents have narrower jobs, and the approval guard controls every external action. Each suggestion explains why it fits. This is real MCP tool coordination; the catalogue facts are deliberately labelled as fixtures in this demo.

## 1:52–2:18 — A strong Amazon handoff

**On screen:** Let the Amazon handoff panel appear. Do not click the external Amazon link while recording.

**Say:**

> WanderWrap has finished the thoughtful part and selected the recipient’s UK marketplace route. Nothing has been purchased. Amazon still owns live price, availability, delivery address, and checkout. The customer must explicitly choose Continue to Amazon.

## 2:18–2:38 — Technical proof

**On screen:** Expand **Technical evidence**, then show the passing terminal summaries.

**Say:**

> Underneath is a Streamable HTTP MCP server using protocol 2025-11-25. The visible specialists are driven by actual clue-analysis, recommendation, and routing tool calls. AWS provides Cognito, Lambda, API Gateway, DynamoDB, and CloudWatch, with deterministic safe fallbacks and automated approval tests.

## 2:38–2:50 — Close

**On screen:** Return to the final handoff or hero.

**Say:**

> WanderWrap preserves the surprise without making privacy the price of convenience. Remember the person. Find the gift.

## Recording shot list

1. Hero and story — 12 seconds.
2. Fictional selected excerpts and consent — 28 seconds.
3. Confirmation-only candidates — 24 seconds.
4. Agent rail and explainable shortlist — 30 seconds.
5. Amazon review handoff — 26 seconds.
6. MCP trace and passing tests — 20 seconds.
7. Closing frame — 10 seconds.

## Optional judge Q&A

**Did it place an Amazon order?**

No. It recommends and prepares a marketplace handoff. Amazon or Alexa+ owns eligible checkout and final confirmation.

**Does it read Facebook, X, or private messages?**

No. This demo accepts only excerpts the giver deliberately selects and confirms they are allowed to use. Direct social connectors are not live.

**Are multiple agents actually involved?**

The demo’s visible states are driven by separate MCP clue-analysis, recommendation, and routing calls. The production-shaped core also has bounded specialist orchestration, least-privilege tool access, signed approvals, and audit events.

**Is Amazon catalogue data live?**

Not yet. The handoff route and guide data are clearly labelled fixtures until Amazon Creators API credentials and live-response evidence pass the integration checklist.

**Do you need an Echo?**

No for the hackathon browser-simulation path. Official Alexa+ Web Simulator evidence remains dependent on selected-partner tooling access.

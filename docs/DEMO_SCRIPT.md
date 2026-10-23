# WanderWrap demo script

Target length: 2:45–3:00. Record in English at 1080p. Use `https://www.wanderwrap.co.uk/gift-finder` after the production smoke test passes. Use only the fictional partner story; never show credentials, tokens or real partner data.

## Before recording

- Hide notifications and close unrelated tabs.
- Open the Gift Finder at stage one with the page title and seven-step journey visible.
- Keep a terminal ready with the final `npm run check` and `npm run test:e2e` summaries.
- Do not open the external Amazon link during the recording.
- If official Alexa+ onboarding is incomplete, say “Alexa+ journey preview,” not “live Alexa add-on.”

## 0:00–0:20 — The real problem

**On screen:** WanderWrap landing page, then click **Gift Finder**.

> WanderWrap began when I wanted to surprise my partner with something they would genuinely enjoy. Asking directly would spoil the surprise, but searching Amazon from a single keyword felt impersonal. WanderWrap does the thoughtful work before shopping begins.

## 0:20–0:42 — Define the moment

**On screen:** Show **The Moment**. Keep Partner, Just because, “I notice you,” £60 and This week selected. Click **Build the moment**.

> First, WanderWrap asks what the gift should communicate—not what product I want to buy. Relationship, occasion, emotional intent, budget and timing become a visible decision brief.

## 0:42–1:05 — Selected evidence, not surveillance

**On screen:** Show the four evidence-source chips. Click **Fill with a fictional example**, tick the permission box and click **Find thoughtful signals**.

> I can use a remembered comment, a known hobby, a requested item or a few selected public excerpts. WanderWrap does not scrape a feed or retain this raw wording. The Privacy Guard and Clue Finder return possible interests, never hidden facts.

## 1:05–1:27 — Confirm and resolve uncertainty

**On screen:** Show the four proposed interests. Keep **A calming ritual** and **Thoughtful surprise**, then click **Create the Gift Brief**.

> Every proposed interest is confirmation-only. Two focused questions then resolve what keywords cannot: what the recipient would value and how adventurous the choice should be.

## 1:27–1:52 — The intelligence moment

**On screen:** Pause on the complete **Gift Brief**, confidence panel, low-clutter choice and “anything to avoid” field. Click **Explore gift directions**.

> Before recommending anything, the agents publish a shared Gift Brief: the moment, confirmed interests, recipient value, practical constraints, exclusions and uncertainty. Every specialist is bounded to this evidence.

## 1:52–2:20 — Meaningful directions, not a product grid

**On screen:** Slowly reveal the four directions and their fit, recipient lens, watch-out and trade-off. Choose **Make-your-own ceramic cup**.

> WanderWrap deliberately compares different directions: a safe delight, a creative ritual, a lasting ritual and a shared memory. Each one explains why it fits, what effort it creates and how it might fail. That keeps the explanation honest instead of persuasive.

## 2:20–2:40 — A complete gift plan

**On screen:** Show Recipient Lens, Delivery Check, Gift Note and Approval. Click **Prepare Amazon matches**.

> The selected direction becomes a complete gift plan with a recipient check, delivery requirement, editable message and explicit approval boundary. Only now does the Amazon Scout begin its work.

## 2:40–2:55 — Safe Amazon handoff

**On screen:** Show the final handoff and “Nothing has been ordered.”

> Amazon confirms the actual product, live price, availability, delivery and checkout. Nothing is silently purchased. WanderWrap remembers the person, builds confidence and hands off only when I am ready.

## 2:55–3:00 — Close

**On screen:** Agent Studio with completed specialists or the final handoff.

> WanderWrap: remember the person, then find the gift.

## Recording shot list

1. Landing page and Gift Finder entry — 12 seconds.
2. Moment and emotional intent — 22 seconds.
3. Fictional evidence and consent — 23 seconds.
4. Confirmation and adaptive questions — 22 seconds.
5. Gift Brief and agent evidence — 25 seconds.
6. Four contrasting directions — 28 seconds.
7. Complete gift plan — 20 seconds.
8. Amazon handoff and closing frame — 18 seconds.

## Optional judge Q&A

**Did it place an Amazon order?**

No. It prepares a marketplace handoff. Amazon or Alexa+ owns eligible checkout and final confirmation.

**Does it read Facebook, X or private messages?**

No. This demo accepts only evidence the giver deliberately selects and confirms they are allowed to use. Direct social connectors are not live.

**Are multiple agents actually involved?**

The visible specialists correspond to bounded analysis, policy, recommendation and routing responsibilities. The production-shaped core enforces least-privilege tool access, signed approvals, idempotency and audit events.

**Is Amazon catalogue data live?**

The Creators API client is implemented and contract-tested, but the public demo uses an explicitly labelled Amazon search fallback until approved credentials and live-response evidence pass the integration checklist.

**Do you need an Echo?**

No for the browser preview. Official Alexa+ Web Simulator and device evidence still depend on selected-partner tooling access.

# Gift Finder monitoring and evaluation

This is the operating contract for knowing whether WanderWrap’s shopper is helping or looping. It deliberately keeps recipient descriptions, chat text, Gift Brief values and retailer URLs out of analytics and ordinary logs.

## Two complementary signals

1. **Server evaluations (essential operations):** every Gift Finder request writes one structured Vercel log event: `wanderwrap.agent_turn_evaluated` or `wanderwrap.agent_turn_failed`. Fields are limited to intent, turn number, brief progress, progress delta, missing-field count, loop-risk flag, product count, duration and failure class. These logs support reliability and abuse investigation without copying the conversation.
2. **PostHog product analytics (optional consent):** the browser sends explicit, content-free journey events only after analytics consent. Autocapture, form capture and session replay are disabled. The EU ingestion endpoint is proxied through `/ingest`; no PostHog request is made before consent.

## Events and questions they answer

| Event | Purpose |
|---|---|
| `landing_gift_prompt_started` | Which acquisition visits begin a Gift Finder journey? |
| `gift_agent_message_sent` | How many turns do shoppers choose to take? |
| `gift_agent_turn_completed` | Did the brief progress, stall, fail or produce products? |
| `gift_search_requested` | Do shoppers use the explicit escape hatch, and at what progress? |
| `gift_shortlist_prepared` | Did search create a useful reveal? |
| `auth_started` | Which onboarding method is chosen after value is shown? |
| `gift_item_saved` | Do recommendations feel promising? |
| `retailer_handoff_opened` / `retailer_handoff_confirmed` | Do shoppers inspect and then accept the retailer boundary? |

Acquisition dimensions are limited to referrer hostname and the allowlisted `utm_source`, `utm_medium` and `utm_campaign` values. URLs captured for page views contain the origin and path only.

## Initial dashboard

Create these PostHog insights after `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is configured:

- Funnel: page view → `landing_gift_prompt_started` → `gift_search_requested` or an automatic `gift_shortlist_prepared` → `auth_started` → `retailer_handoff_confirmed`.
- Agent health: p50/p95 `duration_ms`, failure rate, and empty-result rate by day.
- Loop rate: `gift_agent_turn_completed` where `loop_risk=true` divided by conversations with at least three completed turns.
- Time to value: median maximum `turn_number` at `gift_shortlist_prepared`.
- Escape-hatch success: `gift_shortlist_prepared` with `search_trigger=search` divided by `gift_search_requested`.
- Recommendation quality proxies: save rate and confirmed retailer-handoff rate per shortlist.
- Acquisition: starts and successful shortlists grouped by `referrer_host`, UTM source and campaign.

## Release gates

- Zero raw chat, Gift Brief values, recipient identifiers or full outbound URLs in PostHog events and structured agent logs.
- Question-loop rate below 5% over a rolling seven-day window once at least 100 eligible conversations exist.
- Shopper-triggered search produces at least one normalized product in 95% of configured-provider test runs.
- Gift Finder request failure rate below 2%; p95 duration below 15 seconds for direct search and below 30 seconds for conversation turns.
- Every change to extraction, stopping rules, provider prompting or recommendation routing adds a fixture and runs `npm run check` plus `npm run test:e2e`.

Alert on threshold breaches through PostHog insight alerts and Vercel log alerts once the respective projects are connected. A model-graded evaluator may be added later for sampled, separately governed traces, but deterministic checks and human review remain the release authority.

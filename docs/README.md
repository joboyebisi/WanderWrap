# WanderWrap documentation

Use this page as the repository map. `PROJECT_STATE.md` is the operational checkpoint; the documents below describe the product and the evidence needed to call a capability live.

## Start here

| Need | Document |
|---|---|
| Current truth, blockers and next actions | [`PROJECT_STATE.md`](../PROJECT_STATE.md) |
| Launch the Next.js app on Vercel | [`WEB_LAUNCH_RUNBOOK.md`](WEB_LAUNCH_RUNBOOK.md) |
| Finish Alexa+ onboarding and testing | [`ALEXA_PLUS_TEST_PLAN.md`](ALEXA_PLUS_TEST_PLAN.md) |
| Record the three-minute walkthrough | [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) |
| Understand what is live versus simulated | [`LIVE_INTEGRATION_CHECKLIST.md`](LIVE_INTEGRATION_CHECKLIST.md) |

## Product

- [`PRD.md`](PRD.md) — complete product requirements and journeys.
- [`PRODUCT.md`](PRODUCT.md) — concise product direction.
- [`PRD_AMAZON_ALEXA_PLUS.md`](PRD_AMAZON_ALEXA_PLUS.md) — Alexa+ event slice.
- [`PRD_PAYPAL_AI.md`](PRD_PAYPAL_AI.md) — PayPal event slice.
- [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) — requirement-by-requirement delivery status.

## Architecture and extension points

- [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) — implementation contract.
- [`PLATFORM_ARCHITECTURE.md`](PLATFORM_ARCHITECTURE.md) — application services and trust boundaries.
- [`OMNICHANNEL_ARCHITECTURE.md`](OMNICHANNEL_ARCHITECTURE.md) — Alexa, web, mobile and messaging adapter model.
- [`PROVIDER_ADAPTER_GUIDE.md`](PROVIDER_ADAPTER_GUIDE.md) — registered provider extension contract.
- [`CONNECTED_EXPERIENCE.md`](CONNECTED_EXPERIENCE.md) — cross-surface journey details.

## Launch and testing

- [`ALEXA_PLUS_READINESS.md`](ALEXA_PLUS_READINESS.md) — capability readiness matrix.
- [`ALEXA_SIMULATOR_TESTING.md`](ALEXA_SIMULATOR_TESTING.md) — simulator-first testing guide.
- [`ALEXA_PLUS_TEST_PLAN.md`](ALEXA_PLUS_TEST_PLAN.md) — remaining external Alexa+ sequence and evidence checklist.
- [`HACKATHON_E2E_CHECKLIST.md`](HACKATHON_E2E_CHECKLIST.md) — repository-native end-to-end gates.
- [`HACKATHON_REQUIREMENTS.md`](HACKATHON_REQUIREMENTS.md) — event requirements snapshot.
- [`LAUNCH_ACCOUNTS.md`](LAUNCH_ACCOUNTS.md) — official signup links and credential handling.
- [`BEDROCK_SETUP.md`](BEDROCK_SETUP.md) — Bedrock enablement and validation.

## Provider readiness

- [`INTEGRATION_READINESS.md`](INTEGRATION_READINESS.md) — provider capability truth table.
- [`PAYPAL_AND_MARKET_ROADMAP.md`](PAYPAL_AND_MARKET_ROADMAP.md) — payment/market rollout decisions.
- [`LIVE_INTEGRATION_CHECKLIST.md`](LIVE_INTEGRATION_CHECKLIST.md) — ordered credential, sandbox and evidence gates.

## Document ownership

- Change product intent in the PRD first, then reconcile the technical spec and implementation status.
- Update `PROJECT_STATE.md` after material implementation or external deployment work.
- Add evidence to the test plan only after the exact environment, credential and result have been verified.
- A specific Devpost workflow is not initialized yet. Run `$start-hackathon` before creating the plugin-managed build/submission checklist.

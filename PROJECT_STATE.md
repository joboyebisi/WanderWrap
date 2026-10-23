# WanderWrap project state

Last updated: 2026-10-23

Latest verification: `npm run check` passed on 2026-10-23 — Alexa MCP App build, Next.js production build, AWS handler syntax and 92/92 automated tests. `npm run test:e2e` independently passed 3/3 HTTP golden-path tests, and GitHub CI passed for commit `2cdfac6`. Both public hostnames now reach Vercel: `wanderwrap.co.uk` returns Vercel's permanent `308` redirect to `www.wanderwrap.co.uk`, and `www` serves the latest app, including the X/Twitter banner. A cache-bypassed production smoke test still receives `503` from signup with `WANDERWRAP_OAUTH_BASE_URL is not configured`, despite the variables being reported as added and redeployed; confirm the exact key, Production scope, correct Vercel project and deployment association. The live MCP resource metadata returns `200`, unauthenticated initialize returns the Alexa-required `401` without `WWW-Authenticate`, and CORS accepts `https://www.wanderwrap.co.uk`. AWS `wanderwrap-development` is `UPDATE_COMPLETE`, Cognito callback/logout URLs use the `www` origin, both intended origins are allow-listed, and both alarms are `OK`.

Git checkpoint: `origin` is `https://github.com/joboyebisi/WanderWrap.git`; verified state commit `2cdfac6` is on remote `main`. The former `joboyebisi/TenderTeddy` remote was the wrong destination and must not be used for deployment.

This is the durable handoff for humans and coding agents. Read it first; update it after material work. It records what is proven, what is simulated, and the next safe step. It must never contain secrets.

## Product checkpoint

WanderWrap is an explainable, consent-first gifting companion whose first launch surfaces are Alexa+ and a Next.js web companion. Its core is channel-neutral and uses registered provider adapters so recommenders, preference models, catalogues, fulfilment, payments, and gift services can be swapped without changing channel code.

The primary hackathon story is: ask for a gift, receive evidence-backed recommendations, select one, verify a fulfilment route, and move to an explicit approval/handoff. WanderWrap does not silently purchase, capture money, expose a recipient address, or infer consent.

## Working now

- Alexa+-compatible MCP endpoint using Streamable HTTP and protocol `2025-11-25`.
- Device-free browser simulator at `/alexa-simulator.html`, including Amazon, PayPal fallback, and Xoom fixture branches.
- MCP Apps adaptive gift board for inline/fullscreen, screen, mobile, and voice-safe results.
- Explainable deterministic recommendation plus optional XLM-R preference and Bedrock explanation provider boundaries.
- Tenant-aware provider registry with deterministic selection, health controls, safe read fallback, and no ambiguous write failover.
- Bounded specialist-agent orchestration with least privilege, signed payload-bound approvals, idempotency, and audit events.
- Next.js App Router workspace in `apps/web` and a constrained backend-for-frontend proxy.
- Next.js PKCE login/callback/session routes, HttpOnly token storage, refresh/revocation handling, same-origin mutation checks, and an interactive person → confirmed clue → recommendation → saved-for-approval workspace.
- Public responsive landing page, honest `/connections` readiness hub, explicit verified-email `/api/auth/signup` flow, and authenticated `/simulator` that calls the protected MCP endpoint while visibly tracing initialize, tool discovery, recommendation and routing.
- Cognito/DynamoDB/Lambda/HTTP API CloudFormation deployment and a frozen AWS development preview.
- Isolated `wanderwrap-development` AWS stack with Cognito managed login, OAuth code flow + PKCE, resource scopes, JWT signature/client/scope/audience validation, restrictive origins, retained encrypted DynamoDB data, log retention, and duration/error alarms.
- PayPal sandbox client boundary for OAuth, idempotent create/capture, and provider-verified webhooks; it remains disabled until sandbox credentials and trusted supplier pricing are configured.
- Automated domain, provider, orchestration, channel, MCP, AWS, and HTTP end-to-end tests.
- `wanderwrap-deployment-iam` AWS stack with a GitHub OIDC role restricted to `joboyebisi/WanderWrap` on `main`, a separate CloudFormation execution role, and no long-lived CI access key.
- GitHub-facing README with existing approved artwork, architecture/journey diagrams, documentation index, Vercel runbook, Alexa+ remaining-test plan, demo script, pull-request template and automatic CI.
- Alexa Cognito infrastructure now accepts Amazon's complete comma-separated redirect list and creates a separate confidential app client when onboarding values are supplied.
- Public Next.js deployment is available at `https://www.wanderwrap.co.uk`; X/Twitter is represented honestly as a planned channel in the landing banner and connections hub.
- Repeatable `npm run test:web:live -- <origin>` production smoke test covers Vercel delivery, security headers, health, signed-out behavior and Cognito PKCE redirect configuration.

## Proof commands

```powershell
npm install
npm run check
npm run test:e2e
npm run demo
```

Then open `http://127.0.0.1:4202/alexa-simulator.html`. `npm run test:e2e` starts an ephemeral authenticated server and proves health, static simulator delivery, OAuth protected-resource discovery, bearer-token enforcement, MCP initialization/tool discovery, recommendation, fulfilment routing, and write approval rejection.

## Live versus simulated

| Capability | Current truth |
|---|---|
| Recommendation and routing policy | Real local application code with deterministic fixtures |
| Alexa+ conversation | Local simulated experience plus a live development MCP endpoint; remote add-on onboarding, Alexa client redirect URI, linked-user test and Web Simulator evidence pending |
| Amazon catalogue | Request/handoff adapter; live Creators API response pending credentials and conformance work |
| PayPal | Server-priced proposal plus tested sandbox HTTP client boundary; credentialed create/approve/capture/webhook loop pending |
| Xoom | Customer handoff only; no public transfer API claim |
| Bedrock | Adapter exists; production uses an IAM role; live model call depends on AWS model access/configuration |
| Social and calendar channels | Architecture/contracts only unless explicitly marked live in the integration checklist |

## Current blockers and external dependencies

1. The GitHub deployment identity is now created, but human AWS CLI access still identifies as account root. Configure IAM Identity Center/SSO before further routine human operations.
2. Both domains reach Vercel and the apex redirects permanently to `www`; no DNS blocker remains.
3. The deployed Vercel function still cannot read `WANDERWRAP_OAUTH_BASE_URL`, despite the variables being reported as configured and redeployed, so signup/login currently return `503`. Confirm the exact key, Production environment scope, correct WanderWrap project, and that the production deployment was created after the variable was saved.
4. Amazon Developer registration/identity verification is complete, but Alexa+ selected-partner enablement is not yet proven. A direct public-npm install of `@alexa-ai/cli` returned `404`; Amazon's current setup requires the AWS account to be associated through an Alexa+ Solutions Architect, an `alexa-ai` role-assumption profile, and authentication to Amazon's private CodeArtifact registry before installation. The exact Alexa redirect URI, development add-on deployment, and Web Simulator evidence remain incomplete.
5. Amazon Creators and PayPal sandbox credentials have not been supplied through a secure secret store.
6. The provider webhook/reconciliation loop and fulfilment/thank-you UI are not yet complete.
7. `.devpost-hackathon-state.json` is absent, so no specific event, deadline, rules, or submission record is attached to the repo yet.

## Next actions, in order

1. Resolve why the production Vercel function cannot read `WANDERWRAP_OAUTH_BASE_URL`, then redeploy and run `npm run test:web:live -- https://www.wanderwrap.co.uk` until it passes.
2. Complete one human browser sign-up/login and prove dashboard plus protected simulator journeys. Configure IAM Identity Center/SSO for routine human AWS work.
3. Request/confirm Alexa+ MCP Toolkit partner enablement with Amazon, supplying the AWS account ID (never credentials) for association. After Amazon grants the private tooling role, configure the dedicated least-privilege `alexa-ai` AWS profile and CodeArtifact registry, install/authenticate the Alexa AI CLI, then create the development add-on.
4. Add every exact Amazon redirect URI to `AlexaRedirectUris`, configure the generated client secret securely in Amazon, and verify resource-bound OAuth 2.1/PKCE account linking.
5. Integrate Amazon Creators API and verify live search responses without presenting unverified price, delivery, or stock.
6. Complete the PayPal sandbox create/approve/capture/signed-webhook loop and replay/idempotency tests.
7. Record Alexa+ Web Simulator, provider sandbox, latency, accessibility, and failure-recovery evidence.
8. Initialize the specific Devpost hackathon workflow when the event is known, then map the evidence to its rules and submission fields.

The web launch and non-administrator customer test sequence is in `docs/WEB_LAUNCH_RUNBOOK.md`.

## Source of truth documents

- Product: `docs/PRD.md`
- Technical design: `docs/TECHNICAL_SPEC.md`
- Delivery status: `docs/IMPLEMENTATION_STATUS.md`
- Omnichannel architecture: `docs/OMNICHANNEL_ARCHITECTURE.md`
- Alexa readiness and testing: `docs/ALEXA_PLUS_READINESS.md`, `docs/ALEXA_SIMULATOR_TESTING.md`, `docs/ALEXA_PLUS_TEST_PLAN.md`
- Recording: `docs/DEMO_SCRIPT.md`
- Credential/live gates: `docs/LIVE_INTEGRATION_CHECKLIST.md`
- Provider extension contract: `docs/PROVIDER_ADAPTER_GUIDE.md`

## Decisions that must remain true

- Social data is opt-in, revocable, provenance-tagged, and converted into user-confirmable preference candidates; it is not used for covert personality diagnosis.
- Personality features are self-discovery first, separately consented, and never used to infer sensitive traits.
- Only registered, code-reviewed adapters may be selected by configuration; configuration does not dynamically import code.
- Read providers may fail over only where semantically safe. Payment, fulfilment, and other ambiguous writes never fail over automatically.
- Every external purchase, contribution, money transfer, recipient claim, or private-data action requires explicit human approval.

# WanderWrap project state

Last updated: 2026-10-23

Production follow-up: Vercel deployed `5bed212`, and `https://www.wanderwrap.co.uk/route` completed the no-account journey through permission, four confirmation-only signals, four explainable gifts, the selected ceramic cup and a safe Amazon.co.uk search handoff. The final screen explicitly stated that Creators API was not configured and nothing was ordered. The Vercel proxy-safe same-origin check was verified on the canonical `www` domain. `npm run check` passed 94/94 and `npm run test:e2e` passed 3/3 after the final fix.

Latest verification: `npm run check` passed on 2026-10-23 after the public `/route` and Amazon Creators client update — Alexa MCP App build, Next.js production build, AWS handler syntax and 94/94 automated tests. `npm run test:e2e` independently passed 3/3 HTTP golden-path tests. The public no-account browser journey was exercised manually through permission, confirmation-only candidates, explainable recommendations and the Amazon search handoff; the landing-page entry point was also verified. The last production smoke test still received `503` from signup with `WANDERWRAP_OAUTH_BASE_URL is not configured`; `/route` does not depend on that blocked account flow. The live MCP resource metadata previously returned `200`, unauthenticated initialize returned the Alexa-required `401` without `WWW-Authenticate`, and CORS accepted `https://www.wanderwrap.co.uk`. AWS `wanderwrap-development` was `UPDATE_COMPLETE`, Cognito callback/logout URLs used the `www` origin, both intended origins were allow-listed, and both alarms were `OK`.

Git checkpoint: `origin` is `https://github.com/joboyebisi/WanderWrap.git`; the current deployed checkpoint is `5bed212` on `main`. The former `joboyebisi/TenderTeddy` remote was the wrong destination and must not be used for deployment.

This is the durable handoff for humans and coding agents. Read it first; update it after material work. It records what is proven, what is simulated, and the next safe step. It must never contain secrets.

## Product checkpoint

WanderWrap is an explainable, consent-first gifting companion whose first launch surfaces are Alexa+ and a Next.js web companion. Its core is channel-neutral and uses registered provider adapters so recommenders, preference models, catalogues, fulfilment, payments, and gift services can be swapped without changing channel code.

The primary hackathon story is: ask for a gift, receive evidence-backed recommendations, select one, verify a fulfilment route, and move to an explicit approval/handoff. WanderWrap does not silently purchase, capture money, expose a recipient address, or infer consent.

## Working now

- Alexa+-compatible MCP endpoint using Streamable HTTP and protocol `2025-11-25`.
- Device-free interactive browser simulator at `/alexa-simulator.html`: selected clue inbox, permission gate, confirmation-only candidates, explainable shortlist, visible MCP-driven specialist coordination, and a polished Amazon review handoff with fixture disclosure.
- `analyse_gift_clues` MCP tool for transient analysis of deliberately selected text; it returns sanitized preference candidates that remain ineligible for ranking until the giver confirms them.
- MCP Apps adaptive gift board for inline/fullscreen, screen, mobile, and voice-safe results.
- Explainable deterministic recommendation plus optional XLM-R preference and Bedrock explanation provider boundaries.
- Tenant-aware provider registry with deterministic selection, health controls, safe read fallback, and no ambiguous write failover.
- Bounded specialist-agent orchestration with least privilege, signed payload-bound approvals, idempotency, and audit events.
- Next.js App Router workspace in `apps/web` and a constrained backend-for-frontend proxy.
- Next.js PKCE login/callback/session routes, HttpOnly token storage, refresh/revocation handling, same-origin mutation checks, and an interactive person → confirmed clue → recommendation → saved-for-approval workspace.
- Public responsive landing page, honest `/connections` readiness hub, explicit verified-email `/api/auth/signup` flow, and authenticated `/simulator` that calls the protected MCP endpoint while visibly tracing initialize, tool discovery, recommendation and routing.
- Public no-account `/route` experience with a landing-page “Try it now” entry point, delightful responsive UI, consent-first clue analysis, visible specialist states, explainable cards and an Amazon handoff.
- Amazon Creators API OAuth client-credentials exchange, one-hour token cache, marketplace-aware SearchItems call, allow-listed product/image URLs, normalized live offers and safe search-link fallback. Exact product links activate only when approved Creators credentials and a marketplace Partner Tag are present.
- Cognito/DynamoDB/Lambda/HTTP API CloudFormation deployment and a frozen AWS development preview.
- Isolated `wanderwrap-development` AWS stack with Cognito managed login, OAuth code flow + PKCE, resource scopes, JWT signature/client/scope/audience validation, restrictive origins, retained encrypted DynamoDB data, log retention, and duration/error alarms.
- PayPal sandbox client boundary for OAuth, idempotent create/capture, and provider-verified webhooks; it remains disabled until sandbox credentials and trusted supplier pricing are configured.
- Automated domain, provider, orchestration, channel, MCP, AWS, and HTTP end-to-end tests.
- `wanderwrap-deployment-iam` AWS stack with a GitHub OIDC role restricted to `joboyebisi/WanderWrap` on `main`, a separate CloudFormation execution role, and no long-lived CI access key.
- GitHub-facing README with existing approved artwork, architecture/journey diagrams, documentation index, Vercel runbook, Alexa+ remaining-test plan, demo script, pull-request template and automatic CI.
- Alexa Cognito infrastructure now accepts Amazon's complete comma-separated redirect list and creates a separate confidential app client when onboarding values are supplied.
- Public Next.js deployment is available at `https://www.wanderwrap.co.uk`; X/Twitter is represented honestly as a planned channel in the landing banner and connections hub.
- Repeatable `npm run test:web:live -- <origin>` production smoke test covers Vercel delivery, security headers, health, signed-out behavior and Cognito PKCE redirect configuration.
- Devpost event state is initialized for `amazonappdev2026`; project `wanderwrap` has been populated as an editable pre-draft, not submitted. A judge-ready narrative, product-feedback answers, friction log, MIT license and partner-first recording script are prepared locally.
- The primary demo story now begins with surprising a partner using selected, permitted public excerpts or remembered clues. The interactive simulator proves the full clue → confirm → ideas → Amazon handoff sequence without claiming live social-account access or live commerce.

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
| Amazon catalogue | Credentialed Creators API client and normalized handoff implemented and contract-tested; production response evidence pending credentials. Without them, `/route` clearly falls back to an Amazon marketplace search link. |
| PayPal | Server-priced proposal plus tested sandbox HTTP client boundary; credentialed create/approve/capture/webhook loop pending |
| Xoom | Customer handoff only; no public transfer API claim |
| Bedrock | Adapter exists; production uses an IAM role; live model call depends on AWS model access/configuration |
| Social and calendar channels | Architecture/contracts only unless explicitly marked live in the integration checklist |

## Current blockers and external dependencies

1. The GitHub deployment identity is now created, but human AWS CLI access still identifies as account root. Configure IAM Identity Center/SSO before further routine human operations.
2. Both domains reach Vercel and the apex redirects permanently to `www`; no DNS blocker remains.
3. The deployed Vercel function still cannot read `WANDERWRAP_OAUTH_BASE_URL`, despite the variables being reported as configured and redeployed, so signup/login currently return `503`. Confirm the exact key, Production environment scope, correct WanderWrap project, and that the production deployment was created after the variable was saved.
4. Amazon Developer registration/identity verification is complete, but Alexa+ selected-partner enablement is not yet proven. A direct public-npm install of `@alexa-ai/cli` returned `404`; Amazon's current setup requires the AWS account to be associated through an Alexa+ Solutions Architect, an `alexa-ai` role-assumption profile, and authentication to Amazon's private CodeArtifact registry before installation. The exact Alexa redirect URI, development add-on deployment, and Web Simulator evidence remain incomplete.
5. A normal Amazon Developer Console account is enough to manage developer registration, but not to make exact product links live. Amazon Creators requires an Amazon Associates account with final acceptance/eligibility, a Creators API application, credential ID/secret/version, and a UK Partner Tag. Login with Amazon is optional because Cognito already supplies the customer OAuth boundary. The integration code is ready, but no Amazon Creators or PayPal sandbox secrets have been supplied through a secure secret store.
6. The provider webhook/reconciliation loop and fulfilment/thank-you UI are not yet complete.
7. The Devpost deadline is 23 October 2026 at 19:00 UTC. Project `1502859` / `wanderwrap` is populated but remains a pre-draft; a public YouTube/Vimeo video, submitter declarations and explicit final-submit confirmation are still required.

## Next actions, in order

1. Record the 2:35-2:50 English demo from `docs/DEMO_SCRIPT.md`, upload it publicly to YouTube or Vimeo, and add the URL to `devpost-submission.md` and Devpost.
2. Confirm the submitter country plus the age, eligible-jurisdiction and non-employee declarations; then perform the explicit final Devpost submit before 19:00 UTC.
3. Resolve why the production Vercel function cannot read `WANDERWRAP_OAUTH_BASE_URL`, redeploy, and run `npm run test:web:live -- https://www.wanderwrap.co.uk`. Until it passes, use the verified public `/route` demo rather than instructing judges to create an account.
4. After submission, continue the official Alexa+ path: obtain selected-partner tooling access, add the exact redirect URIs, deploy the development add-on and capture Web Simulator evidence.
5. Apply for/finalize Amazon Associates and create the Creators API application; integrate its credentials and PayPal sandbox credentials only through encrypted secret stores, then capture provider/webhook evidence before changing any capability to live.

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

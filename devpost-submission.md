# WanderWrap — Devpost submission draft

## Title

WanderWrap

## One-line summary

A consent-first Alexa+ and web companion that turns remembered, user-confirmed clues into explainable gift ideas and safe fulfilment handoffs.

## The story

WanderWrap began with a familiar problem: we wanted to surprise our partner with a gift they would genuinely like and enjoy, but asking directly would spoil the surprise. The useful clues were already in ordinary memories—interests they had mentioned, things they enjoyed doing, and moments we had shared. The hard part was turning those clues into a thoughtful choice without becoming intrusive.

That is why WanderWrap uses remembered or explicitly connected clues only after the customer confirms them. It does not scrape private messages, infer sensitive traits or silently buy anything. It helps the giver preserve the surprise while keeping the recipient's privacy intact.

## Problem

Gift shopping tools are good at finding products, but weak at remembering the person. Search results rarely explain why an idea fits, and voice-to-commerce journeys can blur the line between a suggestion, a fulfilment route and a purchase. The giver needs a short, confident answer; the recipient deserves privacy; and every external action needs clear human approval.

## Solution

WanderWrap is a channel-neutral gifting companion with Alexa+ and web entry points. A customer can describe the person directly or paste a few selected public excerpts they are allowed to use. A privacy-first MCP tool processes that text transiently, discards sensitive material, and returns confirmation-only preference candidates. Only the candidates the giver personally recognises can influence the explainable shortlist. WanderWrap then checks an eligible handoff route separately from recommendation quality, while purchases, payments, transfers, recipient claims and private-data actions remain behind explicit approval.

For this hackathon we built a self-hosted MCP server using specification `2025-11-25` and Streamable HTTP, an MCP App gift board, a clearly labelled browser-based Alexa+ journey simulator, a Next.js companion, and an AWS deployment with Cognito, Lambda, API Gateway, DynamoDB and CloudWatch.

## Why it matters

Thoughtful gifting is emotionally important but cognitively expensive. WanderWrap reduces that effort without making surveillance the price of personalization. Its explainability and approval boundary make the same interaction useful on voice-only, multimodal and web surfaces.

## How AI is used

- A deterministic ranking pipeline combines occasion, budget, confirmed interests and fulfilment constraints so results remain testable and explainable.
- An optional Amazon Bedrock adapter can improve the wording of recommendation explanations. If the model is unavailable, the product fails safely to deterministic explanations.
- A bounded specialist-agent orchestrator separates preference, recommendation, fulfilment and approval responsibilities with least-privilege tool access.
- No model is allowed to silently purchase, move money, expose an address or convert unconfirmed private data into a recipient profile.

## How Codex was used

Codex helped translate the product requirements into the MCP/AWS/web implementation, review security boundaries, add automated tests, structure launch documentation, diagnose deployment configuration and prepare the hackathon evidence. Human decisions defined the product story, privacy rules, approval policy, provider claims and final submission.

## Key features

1. **Surprise without surveillance:** remembered clues become ranking evidence only after the customer confirms them.
2. **Consent-first clue inbox:** selected excerpts are transient input to an MCP tool; raw text is not returned to downstream agents, and candidates require human confirmation.
3. **Visible specialist coordination:** privacy, preference, recommendation, catalogue, fulfilment and approval responsibilities are shown as real MCP-driven state transitions.
4. **Explainable gift shortlist:** every recommendation says why it fits and distinguishes guide data from provider-verified facts.
5. **Alexa+-ready MCP:** Streamable HTTP, protocol `2025-11-25`, protected-resource discovery, scoped bearer validation, tool discovery and MCP Apps UI.
6. **Safe Amazon handoff:** recommendation and routing are separate; the demo ends at a clearly disclosed Amazon review boundary and never invents a purchase.
7. **Explicit approval:** no purchase, payment or recipient-data action occurs silently, and ambiguous writes never fail over automatically.
8. **Web continuation:** a normal customer can create an account, manage confirmed clues, save an idea for approval and see honest connection readiness.

## Architecture

Alexa+ or the browser simulator connects to the authenticated Streamable HTTP MCP gateway. The gateway exposes recommendation and routing tools plus a `ui://` adaptive gift board. The shared application core applies consent and approval policy, invokes bounded specialist agents, selects registered provider adapters and stores tenant-scoped state in encrypted DynamoDB. Cognito supplies authorization-code + PKCE identity and resource scopes. The Next.js application runs separately on Vercel and reaches the same AWS core through a constrained server-side proxy. CloudWatch logs and alarms cover the deployed Lambda/API path.

## Testing

- `npm run check` builds the Alexa MCP App and Next.js app, validates the AWS handler, and runs the automated contract suite, including confirmation-only clue extraction.
- `npm run test:e2e` proves health, simulator delivery, OAuth metadata, bearer/origin enforcement, MCP initialization, tool discovery, recommendation, routing and rejection of an unapproved write.
- The interactive browser journey was exercised end to end: fixture excerpts, permission, candidate confirmation, recommendation, selected gift, and Amazon handoff.
- Provider, approval, idempotency, webhook-signature and fallback behaviour have focused tests.
- The public website and AWS development endpoint are deployed. The recording uses the clearly labelled browser simulator unless official Alexa+ partner tooling becomes available before capture.
- Amazon catalogue responses, PayPal transactions and official Alexa+ Web Simulator execution are not presented as live without their remaining credential/evidence gates.

## Links

- Website: https://www.wanderwrap.co.uk
- Repository: https://github.com/joboyebisi/WanderWrap
- Friction log: https://github.com/joboyebisi/WanderWrap/blob/main/docs/FRICTION_LOG.md
- Demo video: **TODO — add public English YouTube or Vimeo URL (under 3 minutes)**
- Optional testing link: https://www.wanderwrap.co.uk/simulator

## Suggested screenshots

1. Landing hero with “Remember the person. Find the gift.”
2. Browser simulator showing the partner scenario, tool trace and explainable shortlist.
3. MCP App gift board with recommendation reasons.
4. Web gift workspace showing a confirmed clue and saved-for-approval idea.
5. Connections page showing honest Ready / Developer setup / Planned states.
6. Passing automated test summary with no credentials or tokens visible.

## Limitations and honest readiness

- The self-hosted MCP server and browser simulator work; official Alexa+ add-on onboarding and Web Simulator evidence still depend on selected-partner tooling access.
- Catalogue and routing data in the demo are deterministic fixtures unless provider verification is explicitly shown.
- Amazon Creators API and PayPal sandbox credentials are not yet connected.
- The live Vercel OAuth environment must pass the final signup/login smoke test before judges are instructed to create an account.
- Bedrock integration exists, but live model invocation should only be claimed after attributed runtime evidence.

## Official form answer draft

| Field | Draft answer |
|---|---|
| Submitter Type | Individual |
| Organization Name | N/A |
| Country | **USER CONFIRMATION REQUIRED** |
| Canada province | N/A, unless the submitter resides in Canada |
| Primary track | Alexa+ |
| Repository | https://github.com/joboyebisi/WanderWrap |
| New or existing before 31 Aug 2026 | New |
| AWS Builder mini challenge | Yes |
| Open Source mini challenge | No — the primary repository is MIT-licensed, but no separate qualifying OSS contribution is being claimed |
| Feature request | **Important:** provide a public account-access preflight and self-service sandbox for the Alexa+ MCP Toolkit, including role/registry validation and exact OAuth redirect outputs. |
| Friction log | https://github.com/joboyebisi/WanderWrap/blob/main/docs/FRICTION_LOG.md |
| Testing link | https://www.wanderwrap.co.uk/simulator (use only after the production OAuth smoke test passes) |
| AI tools | Amazon Bedrock adapter for optional explanations; Codex for implementation, testing, documentation and submission preparation. |
| Learning level | Significant |
| Career AI value | Yes |

### AWS Builder answer

WanderWrap's deployed development backend uses AWS Lambda for the MCP/API runtime, API Gateway for public HTTPS transport and CORS enforcement, Amazon Cognito for OAuth authorization code + PKCE and scoped JWTs, DynamoDB for encrypted tenant-scoped state, CloudWatch for logs/alarms, IAM for least-privilege runtime and GitHub OIDC deployment roles, and an Amazon Bedrock Runtime adapter for optional explanation generation with a deterministic fallback. CloudFormation keeps the integration reproducible and emits the values used by the web and Alexa account-linking boundaries.

### Product feedback Q1 — tools used and purpose

We used Alexa+'s self-hosted MCP requirements to design the voice/multimodal integration; the Model Context Protocol SDK and MCP Apps package for Streamable HTTP tools and the adaptive gift board; AWS Lambda and API Gateway to host the MCP/API surface; Cognito for OAuth/PKCE and resource scopes; DynamoDB for tenant state; CloudWatch for observability; IAM/GitHub OIDC for deployment; and Amazon Bedrock Runtime as an optional explanation provider. We used the Alexa+ browser-simulation route permitted by the hackathon while official partner tooling access remained pending.

### Product feedback Q2 — what worked well

The MCP protocol boundary made the domain tools portable and easy to test independently of a specific device. Streamable HTTP mapped cleanly onto API Gateway/Lambda, and MCP Apps allowed the same result to have voice-safe text plus a richer visual board. CloudFormation produced a repeatable AWS stack; Cognito, API Gateway, DynamoDB and CloudWatch composed into a credible production-shaped backend. AWS SDK clients and local contract tests made error/fallback cases predictable.

### Product feedback Q3 — what needs work

Alexa+ Toolkit access was the largest friction point: the public quick-start does not make the selected-partner/private CodeArtifact prerequisite prominent enough, and a public npm install fails with a generic `404`. The exact OAuth redirect values arrive late in onboarding. MCP Apps client support would benefit from a versioned compatibility matrix separating transport, authentication and UI rendering. Bedrock would benefit from a single readiness check covering region, model/inference-profile availability, first-use requirements and effective IAM permissions.

### Product feedback Q4 — onboarding experience

The underlying MCP and AWS build path was productive once the architecture was clear. Getting from zero to a tested self-hosted server was straightforward with the SDK and local simulator. Getting from that server to an official Alexa+ development add-on was not self-service for this account: identity verification alone did not provide the partner role or private package access. We therefore used the hackathon's supported simulated-experience route and documented the remaining official-onboarding gate precisely.

### Product feedback Q5 — would we build with these again?

Yes. MCP is a strong fit for separating a reusable gifting capability from voice, screen and web clients, and AWS provides the identity, hosting, persistence and observability pieces needed for a secure service. We would build with them again, especially if Alexa+ offered an immediately available developer sandbox and clearer access diagnostics. We would also retain the deterministic fallback so model or provider outages never turn into unsafe commerce behaviour.

## Submission readiness

- [x] Working source and run instructions are in the repository.
- [x] MIT license added for public-repository eligibility.
- [x] Alexa+ track implementation exists in code and is covered by end-to-end tests.
- [x] AWS Builder integration is documented.
- [x] Product feedback and friction log are drafted.
- [ ] Country, age-of-majority, eligible-jurisdiction and non-employee declarations confirmed by the submitter.
- [ ] Production OAuth signup/login smoke test passes, or judge instructions use the no-account local demo path.
- [ ] Under-three-minute public English YouTube/Vimeo demo URL added.
- [ ] Final screenshots/thumbnail uploaded.
- [ ] Final Devpost submit action explicitly approved by the user.

### ⏳ Not submitted yet

Nothing has been sent to Devpost.

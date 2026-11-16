# WanderWrap engineering playbook

**Status:** Team working agreement
**Date:** 9 November 2026
**Architecture:** [`COMMERCIAL_ARCHITECTURE.md`](COMMERCIAL_ARCHITECTURE.md)

This playbook keeps continuous delivery safe as the team grows. It applies to employees, contractors and coding agents.

## 1. Sources of truth

| Question | Source |
|---|---|
| What is verified now? | `PROJECT_STATE.md` |
| What should the product do? | `docs/PRD.md` |
| What is the target commercial shape? | `docs/COMMERCIAL_ARCHITECTURE.md` |
| What are the technical contracts? | `docs/TECHNICAL_SPEC.md` and provider guides |
| What is implemented? | `docs/IMPLEMENTATION_STATUS.md` plus automated tests |
| What may be called live? | `docs/LIVE_INTEGRATION_CHECKLIST.md` |

When intent changes, update the PRD first, then architecture/contracts, implementation status and project checkpoint in that order. Tests and runtime evidence outrank unchecked prose.

## 2. Repository evolution

Keep the existing application working while moving toward explicit packages:

```text
apps/
  web/                  customer and operations web surfaces
  api/                  future commercial core composition root
  workers/              future durable workflow composition root
packages/
  contracts/            versioned API/event schemas
  domain/               pure aggregates, policies and money types
  application/          commands, queries and authorization orchestration
  providers/            registered adapters and conformance suite
  observability/        redaction, logging, metrics and tracing helpers
infrastructure/         environment-neutral IaC modules and stacks
test/                   cross-package contract and end-to-end tests
docs/                   decisions, runbooks and evidence requirements
```

This is a migration direction, not permission for a big-bang restructure. New code should create a clean seam; existing modules move only when touched for product work and covered by characterization tests.

Dependency direction is `apps -> application -> domain/contracts`. Provider and infrastructure code implement ports owned by the application/domain layer. Domain packages do not import Next.js, AWS SDKs, databases, model SDKs or provider SDKs.

## 3. Change workflow

1. Start from a user outcome and acceptance criteria linked to a PRD requirement.
2. Write or update the contract and failure states before implementation.
3. Add the smallest test that fails for the intended reason.
4. Implement behind an existing boundary; add a feature flag for risky or externally dependent behaviour.
5. Update documentation and capability truth in the same pull request.
6. Run the required local gates and attach redacted evidence.
7. Use a reviewer who owns the affected domain; require security/commerce review for auth, tenancy, claims, payment, fulfilment or privacy changes.
8. Promote the same immutable artifact through staging to production.

Prefer short-lived branches and small, reversible pull requests. Use conventional change categories in titles (`feat`, `fix`, `security`, `ops`, `docs`, `refactor`, `test`). A refactor must preserve behaviour and should not be mixed with a risky provider change.

## 4. Definition of done

A change is done only when:

- acceptance criteria and explicit non-goals are recorded;
- success, failure, timeout, retry and permission-denied paths are handled;
- authorization occurs at the application boundary and repository scope;
- money uses integer minor units and ISO currency;
- consequential writes are idempotent and auditable;
- logs/traces contain no secrets, raw social text, claim tokens, payment details or addresses;
- unit/contract/integration tests cover the risk introduced;
- accessibility and responsive states are checked for UI changes;
- dashboards/alerts/runbooks change when operational behaviour changes;
- migrations are backward-compatible and have rollback/roll-forward plans;
- documentation distinguishes implemented, simulated, sandbox and production evidence;
- `npm run check` passes, plus `npm run test:e2e` for the boundaries named in `AGENTS.md`.

## 5. Quality strategy

| Layer | Purpose | Runs |
|---|---|---|
| Static | Type/lint/schema/IaC and forbidden dependency checks | Every commit/PR |
| Unit | Pure policy, scoring, money and state transitions | Every commit/PR |
| Contract | API/event/provider fixtures, conformance and backward compatibility | Every PR |
| Integration | Database transactions, migrations, queues, identity and local emulators | Every PR where affected |
| End to end | Golden customer, claim, payment and failure journeys | PR for critical boundaries; staging before release |
| Security | SAST, dependency/secret/IaC scan and authorization abuse suite | Every PR; deeper scheduled scan |
| Accessibility | Automated checks plus keyboard/screen-reader review | PR smoke; manual release gate |
| Performance | API, queue and seasonal-spike tests against budgets | Scheduled and release candidate |
| Resilience | Provider timeout, replay, duplicate, partial failure and restore drills | Staging release gate |
| AI evaluation | Relevance, diversity, faithfulness, sensitive inference, injection and abstention | Model/prompt/provider change |

Tests use synthetic data and provider fixtures by default. Sandbox tests are isolated, rate-aware and never run with production credentials. Flaky tests are defects: quarantine requires an owner, issue and removal date, and cannot hide a launch-critical failure.

### Required commercial journey matrix

At minimum, automate:

- guest Gift Brief -> recommendation -> retailer handoff disclosure;
- signed-in Gift Brief -> approval -> PayPal sandbox completion -> claim issuance;
- cancelled/denied/duplicate/delayed PayPal events -> no false funded gift;
- claim view -> accept/decline -> second-use rejection -> expiry/revocation;
- cross-user and cross-tenant reads/writes -> denied without existence leakage;
- consent revocation -> future processing stopped and derived data handled by policy;
- provider timeout after dispatch -> `outcome_unknown` -> reconcile/manual review;
- restore from backup -> documented integrity checks pass.

## 6. CI/CD gates

The current CI is the baseline. Grow it into ordered, fail-closed jobs:

1. locked install, formatting, types, lint and generated-contract drift;
2. secret, dependency-license/vulnerability, SAST and IaC scans;
3. unit and contract tests with coverage on critical domain modules;
4. production builds for every deployable;
5. ephemeral integration tests with migrations applied from zero and from the previous release;
6. HTTP/customer end-to-end and authorization isolation suites;
7. signed SBOM and immutable artifact creation;
8. preview deployment with synthetic smoke tests;
9. staging promotion, provider-sandbox tests and manual approval for production;
10. production canary/smoke verification with automatic rollback criteria.

Branch protection should require passing checks, resolved review comments, current base branch, at least one code-owner approval and no direct production deployment from a developer workstation.

## 7. Environments and data

| Environment | Data | External providers | Purpose |
|---|---|---|---|
| Local | Generated synthetic fixtures | Stub/recorded fixtures | Fast development |
| Preview | Synthetic per-PR data | Stubs only unless explicitly isolated | Product/review validation |
| Development | Synthetic shared data | Provider sandboxes where safe | Integration work |
| Staging | Production-shaped synthetic data | Dedicated sandboxes | Release evidence and drills |
| Production | Real customer data | Approved live providers only | Limited then general availability |

Never copy production customer records to lower environments. Seed scripts must be deterministic and clearly fictional. Access is least-privilege, time-limited where possible and reviewed quarterly.

## 8. Database and event changes

- Give every migration a unique ordered ID and owner.
- Use expand/backfill/switch/contract; application versions on either side of a deployment must coexist safely.
- Never combine destructive schema contraction with the code release that stops using the field.
- Backfills are resumable, throttled, observable and tenant-aware.
- Event consumers accept the current and previous supported event versions during rollout.
- Breaking API/event changes require a new version and a documented consumer migration window.
- Production rollback normally means application rollback plus forward data repair, not blindly reversing a partially applied migration.

## 9. Release and incident practice

Release notes state customer impact, flags, migrations, monitoring, rollback trigger and owner. Start risky changes with internal tenants, then a small pilot cohort, then progressive rollout. Payment, claim and authorization changes require a named release watcher.

Incident severities:

- **SEV-1:** data exposure, unauthorized money movement, widespread inability to claim/pay or loss of payment truth;
- **SEV-2:** material degradation, stuck provider workflow, broken tenant feature or elevated incorrect recommendations;
- **SEV-3:** limited defect with a safe workaround;
- **SEV-4:** minor issue or documentation gap.

For SEV-1/2: stop harmful effects with a flag/kill switch, preserve evidence, assign incident lead and communications owner, create a timeline, reconcile impacted transactions, notify required parties and complete a blameless review with owned actions. Never repair commercial state by untracked direct database edits.

## 10. Documentation and decisions

Create a short architecture decision record for a choice that changes a durable boundary, data store, provider, security posture or deployment topology. It should contain context, decision, alternatives, consequences, migration and rollback. Supersede old records; do not silently rewrite history.

Every provider has an owner, capability matrix, sandbox setup, credential location (never the value), rate/timeout policy, normalized error map, webhook verification method, reconciliation procedure, support contact and kill switch.

Every public API/event has schema examples and error semantics. Every alert links to a tested runbook. Every dashboard names its owner and expected healthy range.

## 11. Developer onboarding

### First day

- Read `AGENTS.md`, `PROJECT_STATE.md`, the PRD, commercial architecture and live checklist.
- Install the pinned Node version and dependencies; run `npm run check` and `npm run test:e2e`.
- Run the local demo using synthetic data and trace one recommendation through the provider boundary.
- Complete security/privacy orientation before receiving cloud or provider access.

### First week

- Ship a small test or documentation fix through review and preview.
- Pair on one domain state machine and one operational dashboard/runbook.
- Learn how consent, tenant context, approvals, idempotency and live-evidence gates are enforced.

### Access

Grant access by role, environment and time needed. Use individual SSO identities and MFA; never shared accounts or credentials in chat, tickets, repository files or screenshots. Remove access promptly on role change or departure.

## 12. Ownership model

Until dedicated teams exist, assign named primary and backup owners for:

- identity, authorization and tenancy;
- consent, privacy and evidence;
- recommendation and AI evaluation;
- gifts, claims and recipient experience;
- payments, fulfilment and reconciliation;
- web/channel experience and accessibility;
- infrastructure, observability and incident response;
- product analytics and experimentation.

Ownership includes code review, backlog health, SLOs, provider renewals, security fixes, runbooks and incident participation. A document or integration without an owner is not launch-ready.

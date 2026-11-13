# WanderSignal preference intelligence PRD

**Status:** Foundation approved for staged implementation
**Owner:** Recommendation and AI evaluation
**Product surface:** Consumer Gift Finder, recipient preference review, enterprise campaign preparation
**Working name:** **WanderSignal**

## 1. Product outcome

WanderSignal helps WanderWrap's agents understand what may make a gift feel personal without pretending to know a person from their social profile. It turns deliberately shared, gift-relevant evidence into a small set of reviewable interest clues. The sender or recipient accepts, edits or rejects every clue before it can influence a Gift Brief or recommendation.

This replaces the unsafe pattern demonstrated by older projects such as GiftHub, which accepted a Twitter handle, inferred personality with IBM Watson and mapped the result directly to marketplace suggestions. WanderSignal keeps the useful interaction—turning text into gift ideas—but removes covert personality profiling, unrestricted account collection and unconfirmed ranking.

## 2. User journeys

### 2.1 Selected evidence

1. The giver enters the occasion, relationship, budget, market, timing and known constraints.
2. They add a remembered comment, known interest, wishlist item or selected excerpt they are allowed to use.
3. The interface shows the source type, intended person, purpose and deletion period before analysis.
4. WanderSignal proposes gift-relevant clues such as `ceramics`, `slow tea rituals` or `live jazz`, each with provenance, confidence and an uncertainty note.
5. The user accepts, edits or rejects each clue. None is rank-eligible before confirmation.
6. Confirmed clues become one part of the editable Gift Brief.

### 2.2 Authorized public-post search

A user may provide a public profile only after confirming their authority and the intended use. A connector may retrieve public posts only when current platform terms, API access, lawful basis, rate limits and WanderWrap's connector evidence gates permit it. The user chooses the excerpts to analyse; WanderWrap does not silently monitor a feed. If the connector is unavailable, the product asks for selected links or pasted excerpts instead.

The review screen must show:

- which excerpts were selected and who selected them;
- proposed interests and explicit wants/dislikes;
- excluded or ambiguous material without exposing sensitive categories;
- accept, edit, reject and remove-source controls;
- the exact clues that will enter the Gift Brief.

Instagram and X account connection is not an authorization to profile friends. Private messages, private posts, full account exports and inferred protected or sensitive traits are out of scope.

### 2.3 Enterprise campaigns

Enterprise users supply a campaign brief, policy, per-recipient budget and only recipient data they are permitted to use. Agents prepare recipient-level Gift Briefs, identify exceptions, research catalogue matches and return an approval-ready campaign. Managers can approve, reject or send a private preference request to the recipient. Aggregate reporting shows coverage, constraints, approvals, exceptions and provider outcomes; it must not expose private preference text to the employer.

## 3. Agent roles

| Agent | Job | Human checkpoint |
|---|---|---|
| Evidence agent | Sanitize selected text and propose narrow clues | Sender/recipient confirms every clue |
| Gift Brief agent | Combine confirmed clues with occasion and constraints | User edits and approves the brief |
| Discovery agent | Search current catalogues, including Channel3 | User reviews provider, price freshness and merchant handoff |
| Recommendation agent | Filter, rank and diversify suitable products | User chooses a direction or asks for another pass |
| Commerce planner | Prepare a provider handoff or, later, a purchase proposal | Exact price/action approval before any transaction |
| Reporting agent | Summarize work, decisions, exceptions and outcomes | Enterprise operator reviews and exports |

Agents propose. Deterministic policy, consent, approval and provider services authorize and execute.

## 4. WanderSignal system design

WanderSignal is a versioned pipeline rather than one unrestricted model:

1. **Evidence gate:** verifies actor, subject, source, purpose, consent, visibility, retention and connector capability.
2. **Content firewall:** treats text and links as untrusted data, strips instructions and blocks unsupported URLs and sensitive categories.
3. **Preference extractor:** a self-hosted multilingual encoder proposes canonical interests, wants, dislikes, ownership and avoid signals with calibrated confidence and abstention reasons.
4. **Evidence ledger:** stores structured clues, source hashes, confirmation state and lineage; raw text receives the shortest practical retention and never enters ordinary logs.
5. **Gift Brief compiler:** combines confirmed clues with explicit occasion, budget, deadline, market, delivery and recipient constraints.
6. **Catalogue discovery:** sends a minimized, non-sensitive brief to read-only providers. Channel3 uses agentic search for rich briefs and returns current merchant links; it is not a purchase or fulfilment rail.
7. **Deterministic ranker:** applies hard filters first, then versioned fit, delivery, budget, diversity and uncertainty features. Affiliate commission never determines suitability.
8. **Grounded explanation:** every “why” cites confirmed evidence and timestamped provider facts.

The extractor is hosted as a private inference service with no public ingress, allowlisted callers, signed artefacts, pinned model revisions, bounded requests, redacted telemetry and independent rollback. Model output never authorizes a connector read, evidence confirmation, message, purchase or provider write.

## 5. Recommendation contract

Every recommendation records:

- Gift Brief version and confirmed evidence IDs;
- extractor, taxonomy, ranker and prompt versions;
- hard-filter results and rejected alternatives with reason codes;
- additive ranking contributions and uncertainty;
- provider, product ID, merchant URL, price/currency, availability and observation time;
- explanation hash and experiment cohort.

Channel3 links are refreshed at display time where practical. The interface says “View at retailer,” never “Ordered,” and the retailer confirms final price, availability, delivery and checkout. Goody or another verified gifting provider is required for a true end-to-end recipient-choice and fulfilment flow.

## 6. Evaluation programme

### 6.1 Offline extraction evaluation

- explicit want/dislike precision at least 95% on the frozen opt-in set;
- subject attribution and negation accuracy at least 99% on the critical adversarial set;
- zero allowed sensitive-trait inference in the release set;
- precision/recall by language, source type and content length;
- expected calibration error and abstention quality;
- person/household-separated, temporal, multilingual and red-team splits.

### 6.2 Recommendation evaluation

- 100% hard-constraint satisfaction and evidence-grounded explanations;
- NDCG@4, Recall@20, catalogue coverage and intra-list diversity;
- recipient accept/keep, exchange, decline, return and “this felt wrong/creepy” rates;
- delivery feasibility, price freshness and broken-handoff rate;
- quality by market, budget band and catalogue coverage;
- no degradation against the deterministic baseline before promotion.

### 6.3 Privacy, policy and reliability evaluation

- zero unconsented, revoked or wrong-subject evidence use;
- zero raw excerpts, tokens or private identifiers in logs and traces;
- prompt-injection, sarcasm, sponsorship, repost, shared-account and already-owned-item sets;
- revocation invalidates derived clues, caches and recommendations within the defined SLO;
- duplicate, timeout, stale offer, provider outage and partial-result tests fail safely;
- every external action requires the correct immutable approval artefact.

### 6.4 Release and monitoring

New models progress through offline benchmark, opt-in shadow, deterministic canary and explicit active cohorts. Dashboards track quality, abstention, privacy/policy failures, drift, latency, cost and provider health by model and taxonomy version. Any zero-tolerance violation disables the affected model or connector and returns the journey to confirmed manual inputs and the deterministic ranker.

## 7. Delivery phases

1. **Now:** selected excerpts, confirmation UI, deterministic Gift Brief, Channel3 discovery behind a server flag, retailer handoff and recorded evaluation fixtures.
2. **Next:** private WanderSignal inference service, consent receipts, durable evidence ledger, benchmark runner and shadow evaluation.
3. **Connector pilot:** authorized X/Instagram capability only after provider approval and privacy/legal gates; selected-post review remains mandatory.
4. **Commerce pilot:** Goody sandbox price/claim/recipient-choice flow with exact human approval and verified webhooks.
5. **Enterprise:** bulk dry-run, policy/budget controls, maker-checker approval, exception handling and outcome reporting.

## 8. Explicit non-goals

- scraping or continuously monitoring a recipient's social accounts;
- accepting a username as consent to profile someone;
- inferring protected traits, diagnosis, politics, religion, sexuality, grief, fertility or financial distress;
- allowing model output to confirm its own evidence or approve spend;
- representing Channel3 discovery or an affiliate click as a WanderWrap purchase;
- autonomous merchant switching after an ambiguous write.

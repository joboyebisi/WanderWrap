# Gift Finder specialist agent

Status: implemented public-web conversation and Channel3 catalogue boundary; retailer checkout remains external.

## Customer journey

1. The giver describes the recipient and moment in ordinary language.
2. The specialist asks one useful follow-up at a time and carries the Channel3 `conversation_id` across turns.
3. The conversation becomes the working Gift Brief; only giver-supplied information is used.
4. The composer shows two to four server-selected quick replies for the next missing field; the buttons send natural-language messages through the same path as typed input.
5. Automatic reveal requires an explicit timing answer, including `No fixed date`; a shopper may still deliberately use **Find gifts now** with a partial brief.
6. When enough context exists, the agent returns current Channel3 product cards and refinement suggestions.
7. The customer can refine the result turn by turn or open the explicit retailer handoff.
8. Only after recommendations are visible does WanderWrap offer to save an email lead and continue account onboarding.

## Interaction contract

`src/gift-finder-interaction.mjs` owns the extensible WanderWrap persona and quick-reply templates. The persona is warm, observant, practical and lightly playful, but remains clearly a bounded gift-shopping agent. Templates are keyed by the deterministic next missing field, contain a stable ID, visual icon, short visible label and the full natural-language message sent to the harness. Provider suggestions may supplement a set only after validation; deterministic templates take priority and the response is capped at four choices.

Emoji and symbols are never the only accessible label. The UI hides decorative icons from assistive technology, keeps visible button text, supports keyboard activation and leaves the free-text field available at every step. Analytics and ordinary logs record no selected suggestion text, recipient value or Gift Brief value.

## Harness

`src/gift-finder-agent.mjs` registers one least-privilege `gift-finder-specialist` in the shared `AgentRegistry`. Its only allowed action is `continue-gift-conversation`. It cannot purchase, create claims, access accounts or invoke payment/fulfilment tools.

Each request is bounded by:

- a transient browser session ID;
- a maximum 1,600-character message;
- at most 16 turns;
- a 30-second agent timeout;
- a unique idempotency key and correlation reference;
- the Channel3 conversation ID returned by the previous turn.

The Channel3 API key stays server-side. Product tool parts are normalized to WanderWrap's presentational offer contract. Provider citation tokens are removed from customer prose, while provider, observation time, price and availability caveats remain visible.

## Lead capture

The lead endpoint accepts an email only after the client has received at least one recommendation. Transactional shortlist/onboarding consent is required; marketing consent is optional and stored separately. The record intentionally excludes the recipient name, conversation, Gift Brief and product choices.

The AWS public endpoint:

- validates same-origin requests;
- rate-limits to five attempts per source-IP hash per hour;
- stores the lead in the existing encrypted DynamoDB table;
- deduplicates on a one-way email hash;
- returns a generic accepted response to avoid email enumeration;
- records an audit event without recipient or conversation content.

Account onboarding is offered only when the web deployment has a configured Cognito OAuth boundary.

## Evaluation and release checks

- Multi-turn context: the same conversation ID is used and refinements affect the next search.
- Harness authority: unknown actions and turns beyond the bound fail before provider invocation.
- Privacy: lead records contain no conversation or Gift Brief.
- Consent: service and marketing timestamps remain separate.
- Provider truth: product price/availability are presented with observation time and retailer confirmation language.
- Side effects: clicking a product opens a confirmation panel; no purchase or order state is created.

Required commands after recommendation, routing or lead changes:

```powershell
npm run check
npm run test:e2e
npm run demo:record
```

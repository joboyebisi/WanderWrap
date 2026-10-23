# Alexa+ remaining test plan

This is the shortest safe path from the current deployed MCP foundation to a recorded Alexa+ Web Simulator demo. Complete it in order because each stage produces inputs for the next.

## Current baseline

Already proven:

- public HTTPS `/mcp` endpoint and protected-resource metadata;
- Streamable HTTP MCP protocol `2025-11-25`;
- `initialize`, `tools/list`, `tools/call` and MCP Apps resource discovery;
- Cognito authorization-code + PKCE S256 foundation, access/refresh tokens and resource/scope validation;
- voice-safe recommendation/routing summaries and approval-gated write tools;
- local browser simulator and automated HTTP golden path;
- Alexa+ package copy, icons, carousel art, privacy and terms drafts.

Not yet proven in Amazon’s environment:

- Alexa developer authentication and Add-on ID;
- Amazon-issued redirect URI list registered in Cognito;
- Alexa-specific OAuth client and linked customer;
- development-stage add-on deployment;
- official Local Inspector/Web Simulator isolation and global-routing journeys;
- simulator logs, latency and accessibility evidence.

## 1. Deploy the Vercel companion first

Follow [`WEB_LAUNCH_RUNBOOK.md`](WEB_LAUNCH_RUNBOOK.md), attach `wanderwrap.co.uk`, then update the AWS stack so Cognito and API origins use the verified HTTPS domain.

Acceptance:

- new customer can sign up, verify email, sign in, use `/dashboard`, run `/simulator`, refresh the session and sign out;
- browser access tokens remain in HttpOnly cookies;
- no provider secret is present in Vercel or the client bundle.

## 2. Create the Amazon development add-on

1. Sign into the [Amazon Developer Console](https://developer.amazon.com/).
2. Install/configure the current Alexa AI CLI and authenticate with `alexa-ai configure`.
3. Introspect the deployed MCP URL and scaffold or reconcile the add-on package.
4. Record the Add-on ID and the complete Amazon redirect URI list. Redirects vary by customer registration region; register every URI Amazon supplies.
5. Keep the returned identifiers out of public screenshots until reviewed. They are configuration, not passwords, but should still be handled deliberately.

Acceptance:

- Alexa AI CLI can reach the remote MCP server;
- schemas and MCP App resources introspect without validation errors;
- package media, descriptions, privacy URL and terms URL validate.

## 3. Add the Alexa OAuth client in AWS

Update `wanderwrap-development` with the Amazon redirect URI configuration. The existing CloudFormation template creates a separate confidential Cognito client when `AlexaRedirectUris` is supplied. Enter the complete comma-separated list exactly as Amazon provides it.

Retrieve the generated Alexa app-client secret through an authorized AWS administrator and enter it only in Amazon’s secure account-linking configuration. Never put it in this repository, Vercel, browser code, screenshots or the demo recording.

Configure Alexa account linking with:

- authorization endpoint: Cognito managed-login `/oauth2/authorize`;
- token endpoint: Cognito `/oauth2/token`;
- grant: authorization code;
- PKCE: `S256`;
- resource: `https://3eaf282enj.execute-api.eu-west-2.amazonaws.com/mcp`;
- scopes: `wanderwrap/gifts.read wanderwrap/gifts.write` plus the identity scopes Alexa accepts for this integration.

Acceptance:

- unauthenticated MCP request fails closed;
- Alexa starts linking, the customer signs in, and Alexa receives access plus refresh tokens;
- token refresh succeeds without relinking;
- revoked, expired, wrong-client, wrong-resource and missing-scope tokens are rejected.

## 4. Deploy to Alexa+ development stage

Run the current CLI validation and development deploy. Redeploy whenever tool schemas, resources or authentication metadata change because Alexa caches discovery/configuration at deployment.

Acceptance:

- development deployment succeeds and returns a version;
- introspected tool names/descriptions match the repository;
- p95 round-trip latency is below Alexa+’s documented 500 ms target for non-provider calls.

## 5. Run the test matrix

### MCP isolation

- list all six tools and the MCP App resource;
- call recommendation and routing with valid, invalid and repeated inputs;
- verify write tools reject missing explicit approval;
- export redacted traces.

### Local Inspector

- inline and fullscreen UI;
- light/dark theme where supported;
- mobile, Echo Show 8, Echo Show 15 and voice-only layouts;
- keyboard/focus, touch targets, VoiceView/read order and reduced motion.

### Alexa+ Web Simulator — isolation mode

Run these utterances:

1. “Help me find a thoughtful Christmas gift for my sister in Toronto. She likes ceramics and slow weekends. Keep it under sixty pounds.”
2. “Make it more practical.”
3. “Can it arrive in Canada?”
4. “Show me another option.”
5. “Continue with that one.”

Verify multi-turn state, concise voice responses, visible cards, correction handling, route disclosure and approval handoff.

### Alexa+ Web Simulator — global mode

Use natural gifting requests without “ask WanderWrap.” Verify Alexa+ selects the add-on, does not over-route unrelated requests, and recovers when it chooses another capability.

### Failure cases

- no account link, expired token and revoked token;
- Bedrock timeout;
- Amazon unavailable/cannot deliver;
- PayPal ambiguous timeout;
- malformed tool input and repeated request;
- no screen, no touch and interrupted conversation.

## 6. Capture evidence

Save, with tokens and personal data redacted:

- CLI deploy result and Add-on ID;
- account-link success, refresh and relink evidence;
- isolation/global simulator transcripts;
- tool trace for `recommend_gifts` and `route_gift`;
- Echo Show/mobile/voice-only screenshots;
- p50/p95 latency and failure recovery;
- one explicit screenshot proving that no purchase occurred.

## Stop-ship conditions

Do not record the final submission demo if:

- any Alexa redirect URI is missing from the authorization client;
- refresh/revocation or audience/scope checks fail;
- fixture availability is described as provider-confirmed;
- the UI or voice response implies that an order/payment completed;
- tokens, email addresses, addresses or provider payloads appear in the recording;
- isolation mode passes but global discovery has not been attempted and disclosed.

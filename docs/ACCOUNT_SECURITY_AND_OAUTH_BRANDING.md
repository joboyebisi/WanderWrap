# WanderWrap account security and OAuth branding

**Status:** required before inviting public account sign-ups
**Owner:** identity, privacy and platform operations
**Last reviewed:** 16 November 2026

This is the launch checklist for making sign-in look and behave like WanderWrap while keeping Amazon Cognito as the standards-based identity service behind it. It does not put provider secrets in the repository.

## 1. Customer-facing identity

Use `auth.wanderwrap.co.uk` as the Cognito custom domain. Do not send customers to the generated `wanderwrap-production-<account-id>.auth...amazoncognito.com` hostname after the custom domain is proven.

1. Request an ACM certificate for `auth.wanderwrap.co.uk` in **US East (N. Virginia), us-east-1**. Cognito requires the custom-domain certificate there even when the user pool is in London.
2. In the Cognito user pool, create the custom domain and select **Managed login** rather than Hosted UI (classic).
3. Add the DNS alias Cognito supplies for `auth.wanderwrap.co.uk` and wait for certificate/domain status to become active.
4. Set production `WANDERWRAP_OAUTH_BASE_URL=https://auth.wanderwrap.co.uk` and redeploy the web application.
5. In Cognito Managed login, create a style for the WanderWrap web app client. Upload the WanderWrap emblem for the form logo. Use the calm forest/ivory palette, accessible contrast, visible rose focus rings and the same border radius as the web app. The versioned source is `infrastructure/cognito-managed-login-branding.json`; apply or inspect it with `npm run deploy:cognito-branding -- --profile wanderwrap-admin --apply` or `--describe`.
6. Test sign-up, sign-in, email verification, forgotten password, Google/Facebook return, logout, cancellation, expired state and account linking on the custom domain before removing the generated domain from customer links.

The managed-login editor controls logo, colours, background, form and external-provider buttons, but not arbitrary page copy. Keep legal and contextual explanations on WanderWrap immediately before redirecting.

### Resolver-cache recovery

If a newly-created custom domain is still blocked by a previously cached `NXDOMAIN`, the user pool may temporarily host a Cognito-owned prefix domain alongside the custom domain. Keep the custom domain and DNS record intact. The fallback must use the same app client, and every federated provider must explicitly allowlist the fallback `/oauth2/idpresponse` URI before its button is enabled. Production keeps the custom domain as `WANDERWRAP_OAUTH_BASE_URL`; the prefix is a separate `WANDERWRAP_OAUTH_FALLBACK_BASE_URL` and appears only behind an explicit troubleshooting disclosure. A `domain=fallback` request selects it and an HttpOnly cookie binds the callback token exchange to that exact origin. Never redirect or silently retry an in-progress authorization on another domain. The fallback may remain classic hosted login while the primary uses managed-login v2 so the emergency path does not depend on the primary branding configuration.

## 2. Google sign-in branding

Create a dedicated Google OAuth web client for WanderWrap. In Google Auth Platform:

- set the product/app name to **WanderWrap**;
- upload the approved WanderWrap emblem and use a WanderWrap support email;
- add `wanderwrap.co.uk` as an authorised domain;
- publish `https://www.wanderwrap.co.uk/privacy` and `https://www.wanderwrap.co.uk/terms`;
- use Cognito's exact Google redirect URI, normally `https://auth.wanderwrap.co.uk/oauth2/idpresponse`;
- request only `openid email profile` for sign-in;
- enable `people.googleapis.com` in the same Google Cloud project because Cognito's Google provider retrieves the mapped basic profile through the Google People API;
- complete Google's branding verification so the verified WanderWrap name/logo appears instead of an unverified domain label;
- store the Google client secret in AWS Secrets Manager or the encrypted deployment secret store, never CloudFormation parameters committed to Git.

In Cognito, add Google as an identity provider, map `email`, `email_verified`, `name`, `given_name`, `family_name` and `picture` only where the application uses them, and add Google to the web app client's `SupportedIdentityProviders`. Test first-time creation and an existing-email collision. Define and test an explicit account-linking procedure; never automatically merge accounts based only on an unverified email.

Use Google's official multicolour `G` artwork and prescribed neutral button treatment. Do not recolour the mark to WanderWrap green, redraw it, place it inside another shape or use a generic letter icon. WanderWrap branding belongs in the surrounding page, emblem, typography, focus state and email action; the provider mark continues to identify Google accurately.

The callback validates returned state and the PKCE verifier before accepting either a code or a provider error. Cancellation is a normal `cancelled` outcome: transient cookies are cleared and the sign-in page explains that nothing changed. The Cognito `PreSignUp_ExternalProvider` trigger permits a first-time Google identity only when Google supplies a verified email and no user-pool profile already has that email. A collision fails with `WANDERWRAP_ACCOUNT_EXISTS_USE_EMAIL` and returns the shopper to email sign-in; the trigger never calls `AdminLinkProviderForUser`. A future **Connect Google** flow must start from an authenticated existing session and deliberately link the exact Google subject after reauthentication.

Deployment evidence on 16 November 2026: the trigger, its least-privilege `ListUsers` role, invocation permission and 30-day log group were deployed through reviewed change set `wanderwrap-google-auth-1aea149`. Cognito reports the trigger ARN on the production user pool, Lambda reports `Active`/`Successful`, and a content-free synthetic verified-new-user probe returned `200`. The live web route reaches Google's account chooser. The pool contained no users, so a real collision could not yet be produced; first creation, logout, repeat sign-in and existing-email recovery remain release evidence, not assumptions.

Branding evidence on 16 November 2026: change set `wanderwrap-managed-login-v2` updated the custom domain without replacement or deletion. Cognito reports `auth.wanderwrap.co.uk` active on managed-login version 2, and branding ID `113ffcf8-85a8-40be-9d05-088f37bb054e` is attached with the WanderWrap form emblem. The public sign-in page and recommendation gate use the official multicolour Google mark. The first fallback consent-screen journey reached Google successfully; it did not by itself prove account creation, logout, repeat sign-in or collision recovery.

Provider dependency evidence on 16 November 2026: primary Google attempts returned a provider error with valid state and PKCE before the pre-sign-up trigger. The Google client credentials passed a content-free token-endpoint validity diagnostic, while the `WanderWrap Production` project showed the People API disabled. `people.googleapis.com` was enabled and Google Cloud subsequently reported `Status: Enabled`. Re-run the human primary-domain flow before treating this as end-to-end evidence.

Google sign-in is authentication only. Google Calendar and Contacts are separate, just-in-time connections with separate consent, scopes and revoke controls.

## 3. Facebook sign-in branding

Only add Facebook if conversion evidence justifies another identity provider. In the Meta app dashboard:

- set the display name to **WanderWrap** and upload the approved logo;
- configure the public WanderWrap domain, privacy URL, terms URL, data-deletion instructions and support contact;
- use Cognito's exact Facebook callback/redirect configuration;
- request only `public_profile` and `email` for sign-in;
- complete Business Verification/App Review where Meta requires it;
- store the app secret only in an encrypted secret store.

Facebook login never grants access to friends, feeds, birthdays or messages. Any future Meta data connection is a separate product permission and review.

## 4. Session and account security gates

- Keep OAuth authorization code + PKCE S256. Never expose access or refresh tokens to browser JavaScript.
- Keep access and refresh tokens in `Secure`, `HttpOnly`, `SameSite=Lax` cookies. Rotate refresh tokens where supported and revoke on logout, password reset and suspected compromise.
- Bind OAuth state and PKCE verifier to short-lived, one-time cookies and reject mismatches.
- Use exact HTTPS callback and logout URLs. Do not use wildcards.
- Keep `PreventUserExistenceErrors` enabled and use neutral recovery messages.
- Enable Cognito threat protection/MFA appropriate to the plan. Require step-up authentication before payment methods, address changes, data export/deletion or enterprise administration.
- Rate-limit sign-up, recovery, login, lead and enquiry endpoints. Alert on credential stuffing, token replay, unusual country changes and repeated callback failures.
- Store the minimum user profile. Encrypt DynamoDB, enable point-in-time recovery and keep IAM access tenant-scoped and least-privilege.
- Never log tokens, passwords, raw recipient prose, pasted evidence, provider payloads or full IP addresses. Hash or truncate identifiers used for abuse controls.
- The web callback may log only content-free event classes (`auth_callback_invalid`, `auth_token_exchange_failed`, `auth_token_response_invalid`, `auth_callback_failed`, `auth_callback_succeeded`), boolean presence checks, token-endpoint HTTP status and an exception class. Never log the authorization code, state value, PKCE verifier, token response, claims or email. Use these events in Vercel runtime logs unless Cognito authentication-event delivery is explicitly enabled and cost-reviewed for the current user-pool tier.
- Give users an account security page with active sessions, connected sources, export, deletion and revoke controls before expanding social/contact integrations.
- Run cross-user and cross-tenant authorization tests on every saved Gift Brief, person, conversation and recommendation endpoint.
- For each new web domain, allowlist the exact origin in `WANDERWRAP_WEB_ORIGINS`, the exact callback in Cognito `WebCallbackUrls`, the exact logout URL and the core API origin list. The BFF must generate and exchange the code with the same request origin. Never use wildcard callbacks.
- Keep the resource indicator, resource-server identifier and custom scope owner identical to the exact API `/mcp` URL. Website-domain expansion does not change this API binding.

## 5. Guest-to-account migration

The landing prompt may start anonymously, but durable recipient data must not live in local storage. Create a short-lived opaque guest-session identifier in an HttpOnly cookie and store the encrypted conversation server-side. After successful authentication, perform one idempotent merge that:

1. verifies the guest cookie and authenticated subject;
2. transfers only the guest's Gift Brief/conversation records;
3. records an audit event and rotates the session identifier;
4. deletes or expires the guest binding;
5. prevents replay or merging the same guest session into another account.

Until this exists, do not place an account wall in front of recommendations if the redirect would lose the customer's work.

## 6. Cookies and regional privacy

The web app now uses an opt-in model globally. Essential cookies remain available for security and requested services; analytics and marketing remain off until a customer chooses them. UK/EEA visitors receive the active-consent explanation, California visitors receive the no-sale/no-sharing and GPC explanation, and other regions receive the same strict default. No optional script may be loaded merely because the interface records consent: every provider integration must read the stored choice before initialising.

Before paid launch, counsel must confirm the operating legal entity, postal address, controller contact, governing law, final retention periods, processor list, international-transfer mechanism and consumer cancellation/refund wording. The current legal pages intentionally flag items that cannot truthfully be invented from repository data.

# WanderWrap account security and OAuth branding

**Status:** required before inviting public account sign-ups
**Owner:** identity, privacy and platform operations
**Last reviewed:** 15 November 2026

This is the launch checklist for making sign-in look and behave like WanderWrap while keeping Amazon Cognito as the standards-based identity service behind it. It does not put provider secrets in the repository.

## 1. Customer-facing identity

Use `auth.wanderwrap.co.uk` as the Cognito custom domain. Do not send customers to the generated `wanderwrap-production-<account-id>.auth...amazoncognito.com` hostname after the custom domain is proven.

1. Request an ACM certificate for `auth.wanderwrap.co.uk` in **US East (N. Virginia), us-east-1**. Cognito requires the custom-domain certificate there even when the user pool is in London.
2. In the Cognito user pool, create the custom domain and select **Managed login** rather than Hosted UI (classic).
3. Add the DNS alias Cognito supplies for `auth.wanderwrap.co.uk` and wait for certificate/domain status to become active.
4. Set production `WANDERWRAP_OAUTH_BASE_URL=https://auth.wanderwrap.co.uk` and redeploy the web application.
5. In Cognito Managed login, create a style for the WanderWrap web app client. Upload the WanderWrap emblem for the form logo, header and favicon. Use the calm forest/ivory palette, accessible contrast, visible focus rings and the same border radius as the web app.
6. Test sign-up, sign-in, email verification, forgotten password, Google/Facebook return, logout, cancellation, expired state and account linking on the custom domain before removing the generated domain from customer links.

The managed-login editor controls logo, colours, background, form and external-provider buttons, but not arbitrary page copy. Keep legal and contextual explanations on WanderWrap immediately before redirecting.

## 2. Google sign-in branding

Create a dedicated Google OAuth web client for WanderWrap. In Google Auth Platform:

- set the product/app name to **WanderWrap**;
- upload the approved WanderWrap emblem and use a WanderWrap support email;
- add `wanderwrap.co.uk` as an authorised domain;
- publish `https://www.wanderwrap.co.uk/privacy` and `https://www.wanderwrap.co.uk/terms`;
- use Cognito's exact Google redirect URI, normally `https://auth.wanderwrap.co.uk/oauth2/idpresponse`;
- request only `openid email profile` for sign-in;
- complete Google's branding verification so the verified WanderWrap name/logo appears instead of an unverified domain label;
- store the Google client secret in AWS Secrets Manager or the encrypted deployment secret store, never CloudFormation parameters committed to Git.

In Cognito, add Google as an identity provider, map `email`, `email_verified`, `name`, `given_name`, `family_name` and `picture` only where the application uses them, and add Google to the web app client's `SupportedIdentityProviders`. Test first-time creation and an existing-email collision. Define and test an explicit account-linking procedure; never automatically merge accounts based only on an unverified email.

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
- Give users an account security page with active sessions, connected sources, export, deletion and revoke controls before expanding social/contact integrations.
- Run cross-user and cross-tenant authorization tests on every saved Gift Brief, person, conversation and recommendation endpoint.

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

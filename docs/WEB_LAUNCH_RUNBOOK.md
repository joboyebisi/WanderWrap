# WanderWrap web launch runbook

The current canonical public web app is `https://www.wanderwrap.co.uk`. Configure `https://wanderwrap.co.uk` to redirect to it. Keep the core API and provider secrets on AWS. Vercel hosts only the Next.js companion and its server-side backend-for-frontend routes.

## 1. Import the GitHub repository into Vercel

1. Open [Vercel — New Project](https://vercel.com/new) and import `joboyebisi/WanderWrap` from its `main` branch.
2. Set **Root Directory** to `apps/web`. Keep **Include source files outside the Root Directory** enabled so Vercel can use the repository lockfile/workspace.
3. Choose the **Next.js** framework preset. The build command is `npm run build`; no output-directory override is needed.
4. Add these Production environment variables:

| Name | Value |
|---|---|
| `WANDERWRAP_CORE_API_URL` | `https://3eaf282enj.execute-api.eu-west-2.amazonaws.com` |
| `NEXT_PUBLIC_WANDERWRAP_URL` | `https://www.wanderwrap.co.uk` |
| `WANDERWRAP_OAUTH_BASE_URL` | `https://wanderwrap-development-695912022574.auth.eu-west-2.amazoncognito.com` |
| `WANDERWRAP_WEB_CLIENT_ID` | `5c521h6hf7pmkuiug6s15jnvhk` |
| `WANDERWRAP_OAUTH_RESOURCE` | `https://3eaf282enj.execute-api.eu-west-2.amazonaws.com/mcp` |
| `WANDERWRAP_WEB_OAUTH_SCOPES` | `openid email wanderwrap/gifts.read wanderwrap/gifts.write` |

These values identify public endpoints/clients; they are not credentials. Do not add AWS keys, Cognito passwords or PayPal secrets to the Vercel project.

The public `/gift-finder` journey works without additional credentials and finishes with a normal Amazon marketplace search. The former `/route` URL permanently redirects to it. To upgrade that handoff to provider-authored product links, images, offer availability and price fields, add these as encrypted **Production** variables (never `NEXT_PUBLIC_*`):

| Name | Source |
|---|---|
| `AMAZON_CREATORS_CREDENTIAL_ID` | Creators API application credential |
| `AMAZON_CREATORS_CREDENTIAL_SECRET` | Creators API application secret |
| `AMAZON_CREATORS_CREDENTIAL_VERSION` | Credential version, for example `3.2` for the UK/EU token endpoint |
| `AMAZON_PARTNER_TAG_GB` | Approved UK Associates Store ID / tracking ID |

The Vercel server route exchanges these for a short-lived OAuth token; credentials and tokens are never returned to the browser. AWS Secrets Manager remains the preferred home when the catalogue call moves fully into the AWS core. Do not configure these values until Associates/Creators API access is approved.

After adding or changing an environment variable, redeploy Production. Cache-bypassed public testing on 2026-10-23 still found `WANDERWRAP_OAUTH_BASE_URL` unavailable to the deployed function after the variables were reported as added and redeployed. If signup returns `503`, verify the exact key spelling, **Production** scope, correct WanderWrap Vercel project, and that the tested production deployment was created after the variable was saved.

## 2. Attach the domain

1. In Vercel, open **Project → Settings → Domains** and add `wanderwrap.co.uk` and `www.wanderwrap.co.uk`.
2. In the domain registrar DNS panel, enter the exact A/CNAME records Vercel displays. Do not copy stale example records from documentation.
3. Make one hostname canonical and redirect the other in Vercel.
4. Wait for Vercel to show valid DNS and TLS before updating OAuth.

Public verification on 2026-10-23 confirmed both hostnames reach Vercel: `wanderwrap.co.uk` returns a permanent `308` redirect to the canonical `https://www.wanderwrap.co.uk/` hostname.

## 3. Update AWS after the domain is verified

Update `wanderwrap-development` with:

- `WebUrl=https://www.wanderwrap.co.uk`
- `AllowedOrigins=https://www.wanderwrap.co.uk,https://wanderwrap.co.uk`

This changes the Cognito callback/logout URLs and API CORS allow-list together. Do not change only one side: a mismatch will break PKCE or browser API calls.

## 4. Prove the customer journey

1. Visit `/gift-finder` while signed out and run the fictional-example flow: moment → selected evidence and permission → confirmation and adaptive questions → Gift Brief → four distinct directions → complete gift plan → Amazon handoff.
2. Confirm the Gift Brief shows only confirmed interests and visible constraints, and each direction shows a recipient lens, watch-out and trade-off.
3. Confirm the final card says `Amazon search handoff` when Creators API is not configured, or shows `LIVE AMAZON RESULT` cards when it is configured.
4. Confirm no purchase occurs and the external Amazon link opens only after the customer clicks it.
5. Visit `/api/auth/signup` and create a new test customer using an email you control.
6. Enter the Cognito email verification code, then sign in.
7. Confirm the callback returns to `/dashboard` and `/api/auth/session` reports an authenticated user.
8. Add a person, add one confirmed preference, request recommendations and save one for approval.
9. Open `/simulator`; run initialize → tools/list → recommend_gifts → route_gift and check the visible trace.
10. Sign out and confirm the protected dashboard and simulator require authentication again while `/gift-finder` remains publicly usable.

This proves the public preview and normal non-administrator customer flow. The Creators API badge proves catalogue response provenance only; it does not prove delivery to the eventual address, payment, purchase, or official Alexa+ onboarding.

Before the manual journey, run `npm run test:web:live -- https://www.wanderwrap.co.uk`. It verifies Vercel delivery, security headers, web health, signed-out behavior and the Cognito PKCE redirect without creating an account.

## 5. AWS deployment identity

`infrastructure/deployment-iam.yaml` bootstraps two roles:

- `WanderWrapGitHubDeploymentRole`, trusted only by `joboyebisi/WanderWrap` on `main` through GitHub OIDC;
- `WanderWrapCloudFormationExecutionRole`, passed only to CloudFormation for the app stack.

Deploy this IAM stack once with an administrator. Routine GitHub deployments then use short-lived OIDC credentials, not an IAM user's access keys. Human AWS work should use IAM Identity Center/SSO; never use the account root for routine deployment.

## 6. External accounts still required

- [Amazon Developer Console](https://developer.amazon.com/) for the Alexa+ add-on ID, exact redirect URI and Amazon Web Simulator access.
- [Amazon Creators API](https://affiliate-program.amazon.com/creatorsapi) for verified Amazon catalogue responses.
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) for sandbox client, webhook and test buyer/seller accounts.
- [Google Cloud Console](https://console.cloud.google.com/) only when calendar/contact import is ready for consent testing.
- [Telegram BotFather](https://t.me/BotFather) only when the signed webhook adapter is implemented.
- [Meta for Developers](https://developers.facebook.com/) only when Messenger permissions, review and deletion/revocation flows are implemented.

Google, Telegram and Meta credentials are not needed to launch the core account, web workspace or authenticated browser demo.

Alexa onboarding later supplies `AlexaRedirectUris` for the AWS stack and requires the generated Alexa Cognito client secret in Amazon’s secure account-linking configuration. This secret does not belong in Vercel because the web client is a separate public PKCE client.

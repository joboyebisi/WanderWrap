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

These values identify public endpoints/clients; they are not credentials. Do not add AWS keys, Cognito passwords, PayPal secrets or provider secrets to the Vercel project.

After adding or changing an environment variable, redeploy Production. Public testing on 2026-10-23 found `WANDERWRAP_OAUTH_BASE_URL` missing from the deployed functions, so signup/login returned `503` even though static pages were healthy.

## 2. Attach the domain

1. In Vercel, open **Project → Settings → Domains** and add `wanderwrap.co.uk` and `www.wanderwrap.co.uk`.
2. In the domain registrar DNS panel, enter the exact A/CNAME records Vercel displays. Do not copy stale example records from documentation.
3. Make one hostname canonical and redirect the other in Vercel.
4. Wait for Vercel to show valid DNS and TLS before updating OAuth.

Public verification on 2026-10-23 found `www.wanderwrap.co.uk` correctly served by Vercel, while the apex `wanderwrap.co.uk` still returned the registrar `/lander` page. Replace the apex A records with the exact values Vercel shows in the project, then configure one hostname to redirect permanently to the canonical hostname.

## 3. Update AWS after the domain is verified

Update `wanderwrap-development` with:

- `WebUrl=https://www.wanderwrap.co.uk`
- `AllowedOrigins=https://www.wanderwrap.co.uk,https://wanderwrap.co.uk`

This changes the Cognito callback/logout URLs and API CORS allow-list together. Do not change only one side: a mismatch will break PKCE or browser API calls.

## 4. Prove the customer journey

1. Visit `/api/auth/signup` and create a new test customer using an email you control.
2. Enter the Cognito email verification code, then sign in.
3. Confirm the callback returns to `/dashboard` and `/api/auth/session` reports an authenticated user.
4. Add a person, add one confirmed preference, request recommendations and save one for approval.
5. Open `/simulator`; run initialize → tools/list → recommend_gifts → route_gift and check the visible trace.
6. Sign out and confirm the protected dashboard and simulator require authentication again.

This proves the normal non-administrator customer flow. It does not prove Amazon Alexa+ onboarding, live catalogue inventory, delivery, payment or purchase.

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

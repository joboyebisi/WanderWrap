# Account workspace, regional commerce and administration

Last reviewed: 2026-11-16

## Product boundary

Signed-in shoppers can keep a durable profile, a stable human-readable handle with an account-derived tag, named Gift Briefs and saved product references. A Gift Brief is a reusable conversation result, not an order. A saved product is a stable Channel3 product reference plus a non-transactional display snapshot; its price, availability and merchant URL must be refreshed before display or handoff. Contacts, occasions, payment methods and autonomous purchasing remain explicitly unavailable.

The admin console is read-only and restricted to the Cognito `wanderwrap-admins` group. It lists account status, essential/lifecycle email gates, versioned GB/US/CA campaign definitions and the explicit autonomy boundary for campaign agents; every view writes a content-minimised audit event. Disabling users, merging identities, changing audiences, publishing/sending campaigns, replaying failures, exporting data and deleting accounts remain approval-gated provider/AWS runbook actions until step-up authentication, reason capture, dual control and recovery evidence exist.

## Durable data model

All customer records remain under `PK=USER#<Cognito subject>` in the encrypted, point-in-time-recoverable DynamoDB table:

- `PROFILE`: display name, derived `name#tag`, locale, home country and currency.
- `BRIEF#<id>`: name, structured Gift Brief, Channel3 conversation reference, market and stable product IDs.
- `SAVED#<product-id>`: stable product ID, optional brief ID and a title/image/merchant/category snapshot. Merchant URLs are deliberately not persisted.
- `AUDIT#<timestamp>#<id>`: content-minimised account and admin events.

Never place raw chat transcripts, provider responses, access tokens, precise IP location or payment data in these records. Cross-user access is prevented by deriving the partition key exclusively from the verified access-token subject.

## New conversation and return journeys

- A result page always exposes **New conversation**; it opens a fresh Gift Finder component state.
- After authentication, the current structured brief is idempotently saved using its conversation ID where available.
- A shopper can rename the brief inline and return to their account to see recent briefs.
- The heart control writes/removes a `SAVED#` record and the wishlist reads the same account-scoped API across devices.
- Product handoff still requires an explicit click and retains the retailer-price/stock/checkout disclosure.

## Regional market selection

Vercel's `x-vercel-ip-country` is an approximate default only. It is never an identity, fraud or legal-residency signal. Supported launch markets are GB/GBP, US/USD and CA/CAD. A signed-in profile choice overrides the detected default; unsupported/missing values fail safely to GB. Every Channel3 search and conversation turn receives the selected `country`, `currency` and `language` configuration. User attribution is passed through the SDK request headers, never placed in the search body.

US acceptance evidence must show current US offers denominated in USD and retailer handoff URLs usable in the US. Channel3 remains catalogue discovery and external merchant handoff; it is never described as a WanderWrap purchase, order or fulfilment event.

## Google discovery and measurement

- `/robots.txt` permits public editorial/product-discovery pages while excluding private account, wishlist, admin and API routes.
- `/sitemap.xml` lists canonical public routes with absolute URLs.
- Root layout emits application structured data and supports the Search Console verification meta value through `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- GA4 loads only after explicit analytics consent through `NEXT_PUBLIC_GA_MEASUREMENT_ID`. PostHog follows the same consent. Neither integration receives chat text, recipient details, email, raw Cognito subject or retailer URL.
- Search Console should use a DNS-verified Domain property for each root domain and submit the canonical sitemap. A sitemap is an indexing hint, not a ranking guarantee.

Operational setup: create one GA4 web data stream for the canonical production site; add additional production hostnames to the same stream only when cross-domain reporting is desired and consent/legal review is complete. Use the existing safe event vocabulary (`page_view`, auth starts, Gift Finder stages, saves and retailer handoff confirmations) rather than duplicating tags or enabling automatic form/session capture.

## Adding `wanderwrap.co` or `wanderwrap.com`

Do not add only DNS. The authorization request, Cognito app client and callback token exchange must bind to the same exact origin.

1. Provision TLS and canonical/redirect behaviour for the new root and `www` host.
2. Add each exact HTTPS web origin to `WANDERWRAP_WEB_ORIGINS` and the core API `AllowedOrigins` parameter.
3. Add each exact `<origin>/api/auth/callback` to `WebCallbackUrls` and each exact post-logout origin to `WebLogoutUrls`; no wildcards.
4. Keep the OAuth resource indicator and custom scopes owned by the exact API resource server identifier ending in `/mcp`. A web hostname change does not create a new API resource.
5. Google federation still returns to Cognito at the branded/fallback Cognito `/oauth2/idpresponse`; add a new Google redirect only if the Cognito auth domain itself changes.
6. Add the root domain to Google Auth Platform authorised domains, create/verify its Search Console Domain property, submit the sitemap and update canonical/redirect rules.
7. Test email and Google creation, cancellation, callback, refresh, logout, repeat login and account-collision recovery on every serving origin before traffic migration.

The web BFF validates the current request origin against `WANDERWRAP_WEB_ORIGINS` and uses that same origin for `redirect_uri`. This prevents a `.co.uk` authorization from being exchanged as `.com`, the mismatch class that previously produced an opaque provider error.

## Official references

- [Vercel request geolocation headers](https://vercel.com/docs/headers/request-headers)
- [Google Search sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google Search canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Search Console Domain properties](https://support.google.com/webmasters/answer/10431861)
- [Google consent mode](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 recommended events](https://support.google.com/analytics/answer/9267735)

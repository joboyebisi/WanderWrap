import type { Metadata } from 'next';
import { CookieSettingsButton } from '../cookie-consent';
import SiteHeader from '../site-header';

export const metadata: Metadata = { title: 'Cookie notice', description: 'WanderWrap cookie use and privacy choices.' };

export default function CookiesPage() {
  return <main className="legalPage"><SiteHeader/><div className="legalShell"><header><p className="eyebrow">TRUST CENTRE</p><h1>Cookie notice</h1><p>What is stored on your device, and what remains optional.</p><small>Last updated 15 November 2026</small></header><article>
    <h2>Our default</h2><p>WanderWrap applies the same privacy-protective default worldwide: optional cookies remain off until you make a clear choice. Rejecting optional cookies does not block the service.</p>
    <h2>Essential cookies and storage</h2><ul><li><strong>ww_access / ww_refresh:</strong> HttpOnly authentication cookies used to keep signed-in users secure.</li><li><strong>ww_oauth_state / ww_pkce_verifier:</strong> short-lived security cookies used during sign-in and removed after callback.</li><li><strong>ww_cookie_consent:</strong> remembers your cookie choice for up to six months.</li><li><strong>Same-tab Gift Finder prompt:</strong> session storage carries the first homepage message into Gift Finder once, then deletes it. It is not advertising storage.</li></ul>
    <h2>Optional categories</h2><p>With your analytics consent, WanderWrap uses PostHog’s EU service to measure page visits, referral source, key buttons, Gift Finder progress, failures and shortlist handoffs. We disable automatic form capture and session replay, and we do not send chat text, Gift Brief content, recipient details or retailer URLs. PostHog does not load before consent. Email preferences are stored with your account and do not require a marketing cookie; marketing cookies remain inactive.</p>
    <h2>Regional rights</h2><p>UK and EEA visitors must actively consent before non-essential storage is used. California visitors can opt out of applicable sale or sharing and use Global Privacy Control; WanderWrap currently does neither. Other visitors receive the same opt-in standard.</p>
    <h2>Change your choice</h2><p>You can reopen the preference panel at any time. Clearing browser cookies will also remove the saved choice.</p><CookieSettingsButton />
  </article></div></main>;
}

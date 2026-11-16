'use client';

import { useEffect, useState } from 'react';

type Region = 'uk' | 'eea' | 'california' | 'global';
type Preferences = { analytics: boolean; marketing: boolean };
const COOKIE = 'ww_cookie_consent';

export default function CookieConsent() {
  const [region, setRegion] = useState<Region>('global');
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({ analytics: false, marketing: false });

  useEffect(() => {
    setVisible(!document.cookie.split('; ').some(value => value.startsWith(`${COOKIE}=`)));
    fetch('/api/privacy/region', { cache: 'no-store' }).then(response => response.json()).then(value => setRegion(value.region || 'global')).catch(() => undefined);
    const open = () => { setVisible(true); setSettings(true); };
    window.addEventListener('wanderwrap:cookie-settings', open);
    return () => window.removeEventListener('wanderwrap:cookie-settings', open);
  }, []);

  function save(next: Preferences) {
    setPreferences(next);
    const value = encodeURIComponent(JSON.stringify({ version: 1, essential: true, ...next, updatedAt: new Date().toISOString() }));
    document.cookie = `${COOKIE}=${value}; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    window.dispatchEvent(new CustomEvent('wanderwrap:consent-updated', { detail: next }));
    setVisible(false); setSettings(false);
  }

  if (!visible) return null;
  const regional = region === 'uk' || region === 'eea'
    ? 'Optional cookies stay off unless you choose them.'
    : region === 'california'
      ? 'We do not sell or share personal information for cross-context behavioural advertising. Optional cookies stay off unless you choose them.'
      : 'Optional cookies stay off unless you choose them.';

  return <div className="cookieLayer" role="presentation">
    <section className="cookiePanel" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      {!settings ? <>
        <div><p className="eyebrow">YOUR PRIVACY CHOICES</p><h2 id="cookie-title">A quiet, clear cookie choice.</h2><p>WanderWrap uses essential cookies for secure sign-in, fraud prevention and preferences. {regional}</p><a href="/cookies">Read the cookie notice</a></div>
        <div className="cookieActions"><button className="cookieSecondary" onClick={() => save({ analytics: false, marketing: false })}>Reject optional</button><button className="cookieSecondary" onClick={() => setSettings(true)}>Manage choices</button><button className="cookiePrimary" onClick={() => save({ analytics: true, marketing: true })}>Accept optional</button></div>
      </> : <>
        <div><p className="eyebrow">COOKIE SETTINGS</p><h2 id="cookie-title">Choose what WanderWrap may use.</h2><p>You can change this choice at any time. The service works without optional cookies.</p></div>
        <div className="cookieCategories">
          <label><span><strong>Essential</strong><small>Secure sessions, account protection, load balancing and your privacy choice.</small></span><input type="checkbox" checked disabled aria-label="Essential cookies always active" /></label>
          <label><span><strong>Analytics</strong><small>Lets Google Analytics and PostHog measure pages, key actions and Gift Finder reliability. Chat text and recipient details are excluded.</small></span><input type="checkbox" checked={preferences.analytics} onChange={event => setPreferences(current => ({ ...current, analytics: event.target.checked }))} /></label>
          <label><span><strong>Marketing</strong><small>Would support campaign measurement. No advertising cookie is currently active.</small></span><input type="checkbox" checked={preferences.marketing} onChange={event => setPreferences(current => ({ ...current, marketing: event.target.checked }))} /></label>
        </div>
        <div className="cookieActions"><button className="cookieSecondary" onClick={() => save({ analytics: false, marketing: false })}>Reject optional</button><button className="cookiePrimary" onClick={() => save(preferences)}>Save choices</button></div>
      </>}
    </section>
  </div>;
}

export function CookieSettingsButton() {
  return <button className="cookieSettingsLink" type="button" onClick={() => window.dispatchEvent(new Event('wanderwrap:cookie-settings'))}>Cookie settings</button>;
}

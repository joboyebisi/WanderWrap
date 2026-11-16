'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import AccountMenu from '../account-menu';
import { captureProductEvent } from '../../product-analytics';
import { Offer, readReveal, RevealState, saveBriefLocally } from '../gift-finder-state';

type AuthState = 'checking' | 'guest' | 'authenticated';
type Departure = { offer: Offer };

export default function RecommendationWorkspace() {
  const [state, setState] = useState<RevealState | null>(null);
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [user, setUser] = useState<{ displayName?: string } | null>(null);
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const modalRef = useRef<HTMLButtonElement>(null);
  const gateRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reveal = readReveal();
    if (!reveal) { setStatus('missing'); return; }
    setState(reveal);
    setStatus('ready');
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(response => response.json())
      .then(session => {
        if (session.authenticated) {
          setUser(session.user || {});
          setAuthState('authenticated');
          saveBriefLocally(reveal.brief);
        } else setAuthState('guest');
      })
      .catch(() => setAuthState('guest'));
  }, []);

  useEffect(() => {
    if (!departure) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDeparture(null);
      if (event.key === 'Tab') trapFocus(event, modalRef.current?.closest<HTMLElement>('[role=dialog]'));
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [departure]);

  useEffect(() => {
    if (authState !== 'guest') return;
    if (window.matchMedia('(max-width: 650px)').matches) document.querySelector('.productGallery')?.scrollIntoView({ block: 'start' });
    const focusGate = () => { if (!document.querySelector('.cookieLayer')) gateRef.current?.querySelector<HTMLElement>('a[href]')?.focus(); };
    window.requestAnimationFrame(focusGate);
    const key = (event: KeyboardEvent) => { if (event.key === 'Tab') trapFocus(event, gateRef.current); };
    const focusIn = (event: FocusEvent) => { if (!document.querySelector('.cookieLayer') && !gateRef.current?.contains(event.target as Node)) focusGate(); };
    const observer = new MutationObserver(focusGate);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', focusIn);
    return () => { observer.disconnect(); document.removeEventListener('keydown', key); document.removeEventListener('focusin', focusIn); };
  }, [authState]);

  if (status === 'loading') return <div className="resultsState">Opening your gift space…</div>;
  if (status === 'missing' || !state) return <div className="resultsState"><span>🎁</span><h1>Your shortlist has expired.</h1><p>Start a fresh conversation so WanderWrap can research current prices and availability.</p><Link className="primary" href="/gift-finder">Talk to WanderWrap</Link></div>;

  const brief = state.brief;
  const locked = authState !== 'authenticated';
  return <>
    <div className={`resultsShell shell ${locked ? 'resultsAreLocked' : ''}`} inert={locked} aria-hidden={locked || undefined}>
      <header className="resultsHeader"><div><p className="eyebrow">CURATED FROM YOUR GIFT BRIEF</p><h1>Thoughtful options for {brief.recipient || 'your person'}.</h1><p>Not a generic product dump. Each option is here because it fits the moment, budget or clues you shared.</p></div>{!locked && <AccountMenu displayName={user?.displayName || 'Your gift space'} />}</header>
      <section className="resultsBrief"><div><span>👤</span><small>FOR</small><strong>{brief.recipient || 'Not specified'}</strong></div><div><span>🎉</span><small>MOMENT</small><strong>{brief.occasion || 'Not specified'}</strong></div><div><span>💷</span><small>BUDGET</small><strong>{brief.budget || 'Flexible'}</strong></div><div><span>💡</span><small>WHAT FEELS LIKE THEM</small><strong>{brief.preferences.join(', ') || 'Your conversation clues'}</strong></div><Link href="/gift-finder">✏️ Refine with WanderWrap</Link></section>
      <div className="resultsToolbar"><div><strong>{state.products.length} current options</strong><small>{formatDate(state.observedAt)}</small></div><span>Price and stock are checked by the shopping site</span></div>
      <section className="productGallery">{state.products.map((offer, index) => <article className="productCard" key={offer.id || offer.url || index}><div className="productImage">{offer.imageUrl ? <img src={offer.imageUrl} alt={offer.imageAlt || offer.title} /> : <span>🎁</span>}<button type="button" aria-label={saved.includes(offer.id || offer.title) ? 'Remove saved item' : 'Save item'} onClick={() => { const willSave = !saved.includes(offer.id || offer.title); setSaved(current => willSave ? [...current, offer.id || offer.title] : current.filter(id => id !== (offer.id || offer.title))); captureProductEvent(willSave ? 'gift_item_saved' : 'gift_item_unsaved', { position: index + 1, merchant: offer.merchant || 'unknown' }); }}>{saved.includes(offer.id || offer.title) ? '♥' : '♡'}</button></div><div className="productBody"><small>{offer.merchant || 'SHOPPING SITE'}</small><h2>{offer.title}</h2><p className="whyFit"><span>✦</span>{whyItFits(offer, state)}</p><div className="productMeta"><strong>{price(offer)}</strong><span>{availability(offer.availability)}</span></div><button type="button" onClick={() => { setDeparture({ offer }); captureProductEvent('retailer_handoff_opened', { position: index + 1, merchant: offer.merchant || 'unknown' }); }}>View at shopping site <span>↗</span></button></div></article>)}</section>
      <section className="conciergeBanner"><div><p className="eyebrow">ONE JOURNEY, COMING SOON</p><h2>Prefer WanderWrap to carry it through?</h2><p>Today, we take you to the shopping site to complete checkout. Join the full-service launch and we’ll let you know when WanderWrap can coordinate your approved purchase and delivery in one place—and surface partner savings when available.</p></div><a href="mailto:hello@wanderwrap.co.uk?subject=WanderWrap%20full-service%20launch">Join full-service early access</a></section>
      <p className="resultsDisclosure">{state.disclosure} Nothing has been ordered, reserved or paid for.</p>
    </div>

    {authState === 'guest' && <div className="revealGateLayer"><section ref={gateRef} className="revealGate" role="dialog" aria-modal="true" aria-labelledby="reveal-gate-title"><div className="revealGateHeading"><div className="agentAvatar">WW</div><div><p className="eyebrow">YOUR SHORTLIST IS READY</p><h2 id="reveal-gate-title">Save these picks to your gift space.</h2></div></div><p>Sign in to open the recommendations, save favourites and return without starting again.</p><div className="gateBenefits"><span>📝 Keep your brief</span><span>💝 Save and compare</span></div><a autoFocus className="googleAuthButton" href="/api/auth/login?provider=Google&returnTo=/gift-finder/recommendations" data-analytics-event="auth_started" data-analytics-method="google"><span>G</span> Continue with Google</a><a className="emailAuthButton" href="/api/auth/signup?returnTo=/gift-finder/recommendations" data-analytics-event="auth_started" data-analytics-method="email">Continue with email</a><a className="returningAuthLink" href="/api/auth/login?returnTo=/gift-finder/recommendations" data-analytics-event="auth_started" data-analytics-method="existing_account">Already have an account? Sign in</a><small>Signing in only verifies your identity. It does not connect contacts, messages or social feeds.</small></section></div>}

    {departure && <div className="retailerModal" onMouseDown={event => event.target === event.currentTarget && setDeparture(null)}><section role="dialog" aria-modal="true" aria-labelledby="retailer-title"><button ref={modalRef} autoFocus className="retailerClose" onClick={() => setDeparture(null)} aria-label="Close">×</button><p className="routeKicker">SHOPPING-SITE HANDOFF</p><h2 id="retailer-title">Continue to {departure.offer.merchant || 'the shopping site'}?</h2><p>For now, WanderWrap researches and explains the options; the shopping site completes checkout. At launch, our full-service experience will coordinate approved purchasing and delivery, with partner savings surfaced where available.</p><div className="retailerNotice"><strong>No order has been placed.</strong><span>The shopping site confirms final price, stock, delivery, returns and payment.</span></div><div className="retailerActions"><button onClick={() => setDeparture(null)}>Stay and compare</button><a href={departure.offer.url} target="_blank" rel="noopener noreferrer" onClick={() => captureProductEvent('retailer_handoff_confirmed', { merchant: departure.offer.merchant || 'unknown' })}>Continue to shopping site ↗</a></div></section></div>}
  </>;
}

function trapFocus(event: KeyboardEvent, container?: HTMLElement | null) { if (!container) return; const items = Array.from(container.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled])')); if (!items.length) return; const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
function whyItFits(offer: Offer, state: RevealState) { const clue = state.brief.preferences[0]; const category = offer.category ? `It matches the ${offer.category.toLowerCase()} direction` : 'It fits the direction WanderWrap researched'; return clue ? `${category}, informed by “${clue}”.` : `${category} and sits within the brief you confirmed.`; }
function price(offer: Offer) { if (typeof offer.price === 'object' && offer.price?.displayAmount) return offer.price.displayAmount; if (typeof offer.price === 'number') return new Intl.NumberFormat('en-GB', { style: 'currency', currency: offer.currency || 'GBP' }).format(offer.price); return 'Check price'; }
function availability(value?: string) { return value === 'InStock' ? 'In stock when checked' : (value || 'Confirm availability').replaceAll('_', ' '); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Checked recently' : `Checked ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date)}`; }

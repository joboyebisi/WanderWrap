'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Offer = {
  id?: string; title: string; url?: string; imageUrl?: string; imageAlt?: string;
  merchant?: string; availability?: string; price?: number | { displayAmount: string } | null; currency?: string | null;
};
type Message = { id: string; role: 'assistant' | 'user'; text: string };
type Turn = {
  conversationId: string; reply: string; suggestions: string[]; products: Offer[]; observedAt: string;
  stage: 'building_gift_brief' | 'recommendations_ready'; canCaptureLead: boolean; disclosure: string;
};
type RetailerDeparture = { url: string; title: string; merchant: string };

const STARTERS = [
  'My mum is turning 60 and loves gardening, but she already owns every obvious gardening gift.',
  'I need a thoughtful thank-you gift for a colleague I do not know very well.',
  'Help me surprise my partner with something personal under £80.'
];

export default function GiftFinderExperience() {
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'assistant', text: 'Tell me who you’re shopping for and what is happening. Share it naturally—I’ll ask only what I need to build the Gift Brief.' }]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [turnNumber, setTurnNumber] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [products, setProducts] = useState<Offer[]>([]);
  const [observedAt, setObservedAt] = useState('');
  const [disclosure, setDisclosure] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [departure, setDeparture] = useState<RetailerDeparture | null>(null);
  const [email, setEmail] = useState('');
  const [serviceConsent, setServiceConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadResult, setLeadResult] = useState<{ message: string; onboardingAvailable: boolean; onboardingUrl?: string } | null>(null);
  const sessionRef = useRef('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);
  useEffect(() => {
    if (!departure) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDeparture(null); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [departure]);

  function sessionId() {
    if (!sessionRef.current) sessionRef.current = crypto.randomUUID();
    return sessionRef.current;
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || busy || turnNumber >= 16) return;
    const nextTurn = turnNumber + 1;
    setMessages(current => [...current, { id: `user-${nextTurn}`, role: 'user', text: clean }]);
    setDraft(''); setBusy(true); setError(''); setSuggestions([]);
    try {
      const response = await fetch('/api/gift-finder/turn', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId(), message: clean, conversationId, turnNumber: nextTurn })
      });
      const result = await response.json() as Turn & { error?: string };
      if (!response.ok) throw new Error(result.error || 'The gift agent could not complete that turn.');
      setConversationId(result.conversationId); setTurnNumber(nextTurn); setSuggestions(result.suggestions || []);
      setMessages(current => [...current, { id: `assistant-${nextTurn}`, role: 'assistant', text: result.reply }]);
      if (result.products?.length) { setProducts(result.products); setObservedAt(result.observedAt); setDisclosure(result.disclosure); }
    } catch (value) { setError(value instanceof Error ? value.message : 'The gift agent stopped safely.'); }
    finally { setBusy(false); }
  }

  async function submitLead(event: FormEvent) {
    event.preventDefault(); setLeadBusy(true); setError('');
    try {
      const response = await fetch('/api/gift-finder/lead', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, serviceConsent, marketingConsent, valueReceived: products.length > 0, recommendationCount: products.length })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not save your email preference.');
      setLeadResult(result);
    } catch (value) { setError(value instanceof Error ? value.message : 'We could not save your email preference.'); }
    finally { setLeadBusy(false); }
  }

  function reset() {
    sessionRef.current = ''; setMessages([{ id: 'welcome', role: 'assistant', text: 'Tell me who you’re shopping for and what is happening. Share it naturally—I’ll ask only what I need to build the Gift Brief.' }]);
    setDraft(''); setConversationId(undefined); setTurnNumber(0); setSuggestions([]); setProducts([]); setObservedAt(''); setDisclosure(''); setError(''); setLeadResult(null); setEmail(''); setServiceConsent(false); setMarketingConsent(false);
  }

  return <section className="agenticFinder">
    <aside className="agentContext">
      <div className="agentIdentity"><span>✦</span><div><strong>WanderWrap Gift Agent</strong><small>Specialist gifting conversation</small></div><i>{busy ? 'Thinking' : 'Ready'}</i></div>
      <div className="contextBody">
        <p className="routeKicker">WHAT I’M CARRYING FORWARD</p>
        {messages.filter(message => message.role === 'user').length ? <ol>{messages.filter(message => message.role === 'user').slice(-5).map(message => <li key={message.id}>{message.text}</li>)}</ol> : <p className="emptyContext">Your answers will become the working Gift Brief. You can speak naturally instead of filling in a form.</p>}
      </div>
      <div className="trustStrip"><span>Context is carried across this gift session</span><span>Only details you choose influence results</span><span>No purchase without your action</span></div>
    </aside>

    <div className="giftChatPanel">
      <header><div><p className="routeKicker">CONVERSATIONAL GIFT FINDER</p><h2>Let’s find something that feels like them.</h2></div><button type="button" onClick={reset}>Start over</button></header>
      <div className="giftChatTranscript" aria-live="polite">
        {messages.map(message => <article className={message.role} key={message.id}><small>{message.role === 'user' ? 'YOU' : 'WANDERWRAP'}</small><p>{message.text}</p></article>)}
        {busy && <article className="assistant thinking"><small>WANDERWRAP</small><p><span /><span /><span /><em>Building the brief and deciding the next best step…</em></p></article>}
        <div ref={endRef} />
      </div>

      {!turnNumber && <div className="chatStarters">{STARTERS.map(starter => <button type="button" onClick={() => sendMessage(starter)} key={starter}>{starter}</button>)}</div>}
      {suggestions.length > 0 && <div className="chatSuggestions">{suggestions.map(suggestion => <button type="button" onClick={() => sendMessage(suggestion)} key={suggestion}>{suggestion}</button>)}</div>}
      <form className="giftComposer" onSubmit={event => { event.preventDefault(); sendMessage(draft); }}>
        <label htmlFor="gift-message">Your message</label>
        <textarea id="gift-message" rows={2} maxLength={1600} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(draft); } }} placeholder="Tell me about the person, the moment, or what the last suggestion missed…" />
        <div><small>Don’t paste private messages or full account exports.</small><button type="submit" disabled={busy || !draft.trim()}>{busy ? 'Thinking…' : 'Send →'}</button></div>
      </form>

      {products.length > 0 && <section className="agentResults">
        <div className="resultHeading"><div><p className="routeKicker">CURRENT RECOMMENDATIONS</p><h3>Options worth considering</h3></div>{observedAt && <small>Checked {formatObservedAt(observedAt)}</small>}</div>
        <div className="amazonOffers">{products.slice(0, 6).map(product => <button type="button" onClick={() => setDeparture({ url: product.url || '#', title: product.title, merchant: product.merchant || 'the retailer' })} key={product.id || product.url}>{product.imageUrl ? <img src={product.imageUrl} alt={product.imageAlt || product.title} /> : <span>🎁</span>}<div><small>{product.merchant || 'RETAILER'}</small><strong>{product.title}</strong><em>{offerPrice(product)} · {availability(product.availability)}</em><i>Review at retailer ↗</i></div></button>)}</div>
        <p className="handoffDisclosure">{disclosure} Nothing has been ordered.</p>
        <div className="resultFeedback"><span>Want me to refine these?</span>{['More personal', 'Less expensive', 'More unusual', 'Avoid physical clutter'].map(value => <button type="button" onClick={() => sendMessage(value)} key={value}>{value}</button>)}</div>

        <section className="leadCapture">
          {!leadResult ? <><div><p className="routeKicker">KEEP YOUR SHORTLIST</p><h3>We’ve done the useful part first.</h3><p>Leave your email and we’ll keep you connected to this Gift Finder journey and invite you to complete your WanderWrap account.</p></div>
            <form onSubmit={submitLead}><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" /></label>
              <label className="leadConsent"><input type="checkbox" checked={serviceConsent} onChange={event => setServiceConsent(event.target.checked)} required /><span>Email me about this shortlist and account onboarding.</span></label>
              <label className="leadConsent optional"><input type="checkbox" checked={marketingConsent} onChange={event => setMarketingConsent(event.target.checked)} /><span>Also send occasional WanderWrap product news. Optional.</span></label>
              <button type="submit" disabled={leadBusy}>{leadBusy ? 'Saving…' : 'Save my place →'}</button>
            </form></> : <div className="leadSuccess"><span>✓</span><div><h3>You’re on the list.</h3><p>{leadResult.message}</p>{leadResult.onboardingAvailable && leadResult.onboardingUrl && <a href={leadResult.onboardingUrl}>Create my WanderWrap account →</a>}</div></div>}
        </section>
      </section>}
      {error && <div className="chatError" role="alert">{error}</div>}
    </div>

    {departure && <div className="retailerModal" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDeparture(null); }}><section role="dialog" aria-modal="true" aria-labelledby="retailer-title"><button className="retailerClose" type="button" aria-label="Close retailer handoff" onClick={() => setDeparture(null)} autoFocus>×</button><p className="routeKicker">YOUR RETAILER HANDOFF</p><h2 id="retailer-title">Continue with {departure.merchant}?</h2><p>WanderWrap has helped you understand the brief and research current options. For now, you complete the purchase with the retailer.</p><div className="retailerNotice"><strong>No order has been placed.</strong><span>{departure.merchant} confirms the final price, availability, delivery, returns and payment for “{departure.title}”.</span></div><div className="retailerActions"><button type="button" onClick={() => setDeparture(null)}>Stay and compare</button><a href={departure.url} target="_blank" rel="noopener noreferrer">Continue to retailer ↗</a></div></section></div>}
  </section>;
}

function availability(value?: string) { return value?.replaceAll('_', ' ').toLowerCase() || 'confirm at retailer'; }
function offerPrice(offer: Offer) {
  if (typeof offer.price === 'object' && offer.price?.displayAmount) return offer.price.displayAmount;
  if (typeof offer.price === 'number') return new Intl.NumberFormat('en-GB', { style: 'currency', currency: offer.currency || 'GBP' }).format(offer.price);
  return 'See retailer for price';
}
function formatObservedAt(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'just now' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date); }

'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { LANDING_GIFT_PROMPT_KEY } from '../landing-gift-composer';
import { captureProductEvent } from '../product-analytics';
import { GiftBrief, Offer, saveReveal } from './gift-finder-state';

type Message = { id: string; role: 'assistant' | 'user'; text: string };
type Evaluation = { intent: 'continue' | 'search'; turnNumber: number; briefProgress: number; progressDelta: number; missingFieldCount: number; productCount: number; loopRisk: boolean };
type Turn = { conversationId: string; reply: string; suggestions: string[]; products: Offer[]; observedAt: string; stage: 'building_gift_brief' | 'recommendations_ready'; revealReady: boolean; disclosure: string; brief: GiftBrief; briefProgress: number; missingBriefFields: string[]; evaluation?: Evaluation };

const EMPTY: GiftBrief = { recipient: '', occasion: '', budget: '', timing: '', preferences: [], constraints: [] };
const STARTERS = ['🎂 Mum’s 60th—she loves gardening but owns the obvious things', '💛 A thoughtful thank-you for a colleague I don’t know well', '✨ Something personal for my partner, under £80'];

export default function GiftFinderExperience() {
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'assistant', text: 'Hi, I’m WanderWrap ✨ Tell me who you’re celebrating and what the moment is. I’ll turn the little details into a clear Gift Brief, then do the searching.' }]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [turnNumber, setTurnNumber] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [brief, setBrief] = useState<GiftBrief>(EMPTY);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState<'continue' | 'search' | false>(false);
  const [loopRisk, setLoopRisk] = useState(false);
  const [error, setError] = useState('');
  const sessionRef = useRef('');
  const consumed = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);
  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;
    const value = sessionStorage.getItem(LANDING_GIFT_PROMPT_KEY);
    if (value) { sessionStorage.removeItem(LANDING_GIFT_PROMPT_KEY); void sendMessage(value); }
  }, []);

  function sessionId() {
    if (!sessionRef.current) sessionRef.current = crypto.randomUUID();
    return sessionRef.current;
  }

  async function sendMessage(value: string, intent: 'continue' | 'search' = 'continue') {
    const clean = value.trim();
    if ((intent === 'continue' && !clean) || busy || (intent === 'continue' && turnNumber >= 16)) return;
    const next = intent === 'search' ? Math.min(turnNumber + 1, 16) : turnNumber + 1;
    const visibleMessage = clean || 'Find gifts with this Gift Brief';
    const startedAt = performance.now();
    setMessages(current => [...current, { id: `user-${intent}-${next}-${Date.now()}`, role: 'user', text: visibleMessage }]);
    setDraft(''); setBusy(intent); setError(''); setSuggestions([]);
    captureProductEvent(intent === 'search' ? 'gift_search_requested' : 'gift_agent_message_sent', { turn_number: next, brief_progress: progress });
    try {
      const response = await fetch('/api/gift-finder/turn', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: sessionId(), message: clean, conversationId, turnNumber: next, brief, intent }) });
      const result = await response.json() as Turn & { error?: string };
      if (!response.ok) throw new Error(result.error || 'WanderWrap could not complete that turn.');
      setConversationId(result.conversationId); setTurnNumber(next); setSuggestions(result.suggestions || []); setBrief(result.brief || brief); setProgress(result.briefProgress || 0); setLoopRisk(Boolean(result.evaluation?.loopRisk));
      setMessages(current => [...current, { id: `assistant-${next}-${Date.now()}`, role: 'assistant', text: result.reply }]);
      captureProductEvent('gift_agent_turn_completed', { intent, turn_number: next, brief_progress: result.briefProgress, progress_delta: result.evaluation?.progressDelta ?? 0, missing_field_count: result.missingBriefFields?.length ?? 0, product_count: result.products?.length ?? 0, loop_risk: Boolean(result.evaluation?.loopRisk), duration_ms: Math.round(performance.now() - startedAt), stage: result.stage });
      if (result.revealReady && result.products?.length) {
        saveReveal({ brief: result.brief, products: result.products, observedAt: result.observedAt, disclosure: result.disclosure, conversationId: result.conversationId, savedAt: new Date().toISOString() });
        captureProductEvent('gift_shortlist_prepared', { product_count: result.products.length, turn_number: next, search_trigger: intent });
        window.setTimeout(() => window.location.assign('/gift-finder/recommendations'), 650);
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : 'WanderWrap stopped safely. Please try again.');
      captureProductEvent('gift_agent_turn_failed', { intent, turn_number: next, duration_ms: Math.round(performance.now() - startedAt) });
    } finally { setBusy(false); }
  }

  function reset() {
    sessionRef.current = '';
    setMessages([{ id: 'welcome', role: 'assistant', text: 'Fresh start 🌿 Who are you shopping for, and what is the moment?' }]);
    setDraft(''); setConversationId(undefined); setTurnNumber(0); setSuggestions([]); setBrief(EMPTY); setProgress(0); setLoopRisk(false); setError('');
    captureProductEvent('gift_conversation_restarted');
  }

  const facts = [['👤', 'Person', brief.recipient], ['🎉', 'Moment', brief.occasion], ['💷', 'Budget', brief.budget], ['🗓️', 'Timing', brief.timing], ['💡', 'Clues', brief.preferences.join(', ')], ['🧭', 'Avoid', brief.constraints.join(', ')]];
  const canSearch = turnNumber > 0 && progress > 0 && !busy;

  return <section className="agenticFinder">
    <aside className="agentContext"><div className="agentIdentity"><span>WW</span><div><strong>Your Gift Brief</strong><small>{progress}/4 essentials understood</small></div><i>{busy ? busy === 'search' ? 'Searching' : 'Listening' : 'Live'}</i></div><div className="briefMeter"><i style={{ width: `${Math.min(100, progress * 25)}%` }} /></div><div className="contextBody"><p className="routeKicker">WHAT WANDERWRAP IS CARRYING FORWARD</p>{facts.map(([icon, label, value]) => <div className={value ? 'briefFact' : 'briefFact empty'} key={label}><span>{icon}</span><div><small>{label}</small><strong>{value || 'Still to learn'}</strong></div></div>)}</div><div className="trustStrip"><span>🔒 Only details you choose</span><span>✏️ Correct WanderWrap at any time</span><span>🛍️ No purchase without your action</span></div></aside>
    <div className="giftChatPanel"><header><div className="chatAgentTitle"><div className="agentAvatar">WW</div><div><p className="routeKicker">WANDERWRAP · PERSONAL GIFT SHOPPER</p><h2>Let’s make it feel like them.</h2></div></div><button type="button" onClick={reset}>Start over</button></header>
      <div className="giftChatTranscript" aria-live="polite">{messages.map(message => <article className={message.role} key={message.id}><small>{message.role === 'user' ? 'YOU' : 'WANDERWRAP ✦'}</small><p>{message.text}</p></article>)}{busy && <article className="assistant thinking"><small>WANDERWRAP ✦</small><p><span /><span /><span /><em>{busy === 'search' ? 'Searching current gifts with your brief…' : 'Listening for the detail that will make the difference…'}</em></p></article>}<div ref={endRef} /></div>
      {!turnNumber && <div className="chatStarters">{STARTERS.map(item => <button type="button" onClick={() => sendMessage(item.replace(/^\S+\s/, ''))} key={item}>{item}</button>)}</div>}
      {suggestions.length > 0 && <div className="chatSuggestions">{suggestions.map(item => <button type="button" onClick={() => sendMessage(item)} key={item}>{item}</button>)}</div>}
      {loopRisk && <div className="loopEscape" role="status"><span>✨</span><p><strong>We can search now.</strong><small>You can keep refining, or let WanderWrap work with what it already knows.</small></p></div>}
      <form className="giftComposer" onSubmit={(event: FormEvent) => { event.preventDefault(); void sendMessage(draft); }}><label htmlFor="gift-message">Message WanderWrap</label><textarea id="gift-message" rows={2} maxLength={1600} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(draft); } }} placeholder="Share a detail, a memory, a budget—or say what to avoid…" /><div><small>Share what you know; don’t paste private messages or account exports.</small><span className="composerButtons"><button className="searchNowButton" type="button" disabled={!canSearch} onClick={() => void sendMessage(draft, 'search')} title={progress ? 'Search using the Gift Brief so far' : 'Share one detail first'}>Find gifts now <b>✨</b></button><button className="sendMessageButton" type="submit" disabled={Boolean(busy) || !draft.trim()}>Send <span>↑</span></button></span></div></form>
      {error && <div className="chatError" role="alert">{error}</div>}
    </div>
  </section>;
}

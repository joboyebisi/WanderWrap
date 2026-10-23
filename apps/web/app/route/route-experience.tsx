'use client';

import { useMemo, useState } from 'react';

type Candidate = { id: string; value: string; confidence: number };
type Gift = { id: string; name: string; price: number; story: string; categories: string[] };
type Offer = { asin: string; title: string; detailPageUrl: string; imageUrl?: string | null; price?: { displayAmount?: string } | null; availability?: string };
type Handoff = { mode: string; selected: Gift; marketplace: string; url: string; offers: Offer[]; disclosure: string };
type AgentState = 'waiting' | 'working' | 'done';
type ChatMessage = { role: 'alexa' | 'user' | 'wanderwrap'; text: string };

const EXAMPLE = [
  '“I love pottery studios—making something imperfect by hand is the best kind of reset.”',
  '“I enjoy tea, a good novel, and nowhere to be on slow Sunday mornings.”',
  '“I like houseplants, especially the tiny ones that fit on the kitchen shelf.”'
].join('\n');

const AGENTS = [
  ['privacy', '🛡️', 'Privacy guard'], ['preference', '✨', 'Clue finder'], ['recommendation', '💡', 'Gift curator'],
  ['catalogue', '🛍️', 'Amazon scout'], ['routing', '🧭', 'Route planner'], ['approval', '✅', 'Approval guard']
] as const;

async function demoAction<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'That step stopped safely.');
  return value as T;
}

export default function GiftRoute() {
  const [stage, setStage] = useState(1);
  const [clues, setClues] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [agent, setAgent] = useState<Record<string, AgentState>>({});
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: 'alexa', text: 'Who are we surprising today?' },
    { role: 'user', text: 'My partner. I want it to feel personal without spoiling the surprise.' },
    { role: 'wanderwrap', text: 'Share a few selected clues you already know—or use our fictional example.' }
  ]);
  const steps = ['Clues', 'Confirm', 'Gift ideas', 'Amazon'];

  const progress = useMemo(() => `${Math.round(stage / 4 * 100)}%`, [stage]);
  function setAgents(keys: string[], state: AgentState) { setAgent(current => ({ ...current, ...Object.fromEntries(keys.map(key => [key, state])) })); }
  function append(text: string) { setChat(current => [...current, { role: 'wanderwrap', text }]); }

  async function analyse() {
    setBusy(true); setError(''); setAgents(['privacy', 'preference'], 'working');
    try {
      const snippets = clues.split(/\n+/).map(value => value.trim()).filter(Boolean);
      const result = await demoAction<{ candidates: Candidate[]; rejectedCount: number }>({ action: 'analyse', snippets, allowedToUse: allowed });
      setCandidates(result.candidates); setConfirmed(result.candidates.map(item => item.value)); setStage(2);
      setAgents(['privacy', 'preference'], 'done');
      append(`I found ${result.candidates.length} possible interests. They are suggestions—not facts—until you confirm them.${result.rejectedCount ? ` I safely discarded ${result.rejectedCount} sensitive or unusable excerpt.` : ''}`);
    } catch (value) { setError(value instanceof Error ? value.message : 'Analysis stopped safely.'); setAgents(['privacy', 'preference'], 'waiting'); }
    finally { setBusy(false); }
  }

  async function recommend() {
    setBusy(true); setError(''); setAgents(['recommendation'], 'working');
    try {
      const result = await demoAction<{ recommendations: Gift[] }>({ action: 'recommend', interests: confirmed, budget: 60 });
      setGifts(result.recommendations); setStage(3); setAgents(['recommendation'], 'done');
      append(`Lovely. I used only ${confirmed.join(', ')} and found ${result.recommendations.length} explainable ideas under £60.`);
    } catch (value) { setError(value instanceof Error ? value.message : 'Recommendations stopped safely.'); setAgents(['recommendation'], 'waiting'); }
    finally { setBusy(false); }
  }

  async function prepareHandoff(gift: Gift) {
    setBusy(true); setError(''); setAgents(['catalogue', 'routing', 'approval'], 'working');
    try {
      const result = await demoAction<Handoff>({ action: 'handoff', giftId: gift.id, destinationCountry: 'GB' });
      setHandoff(result); setStage(4); setAgents(['catalogue', 'routing', 'approval'], 'done');
      append(result.mode === 'amazon-creators-live'
        ? `Amazon returned live product links for ${gift.name}. You still choose whether to continue.`
        : `I prepared an Amazon.co.uk search for ${gift.name}. Amazon confirms the final product, price, delivery and checkout.`);
    } catch (value) { setError(value instanceof Error ? value.message : 'Handoff stopped safely.'); setAgents(['catalogue', 'routing', 'approval'], 'waiting'); }
    finally { setBusy(false); }
  }

  return <>
    <section className="routeProgress" aria-label="Journey progress">
      <div className="routeProgressBar"><i style={{ width: progress }} /></div>
      {steps.map((label, index) => <div className={`routeStep ${stage === index + 1 ? 'active' : ''} ${stage > index + 1 ? 'complete' : ''}`} key={label}><span>{stage > index + 1 ? '✓' : index + 1}</span><small>{label}</small></div>)}
    </section>

    <section className="routeExperience" aria-busy={busy}>
      <aside className="routeConversation">
        <div className="conversationTitle"><div className="alexaGlow">✦</div><div><strong>Alexa+ journey preview</strong><small>Browser simulation · public demo</small></div><span>LIVE</span></div>
        <div className="routeMessages">{chat.map((message, index) => <article className={message.role === 'user' ? 'fromYou' : ''} key={`${message.text}-${index}`}><small>{message.role === 'user' ? 'YOU' : message.role === 'alexa' ? 'ALEXA+' : 'WANDERWRAP'}</small><p>{message.text}</p></article>)}</div>
        <div className="trustStrip"><span>🔒 Raw clues not retained</span><span>🫶 You confirm every signal</span><span>🛑 No automatic purchase</span></div>
      </aside>

      <div className="routeWorkbench">
        {stage === 1 && <section className="routeCard">
          <p className="routeKicker">01 · THE CLUE ENVELOPE 💌</p><h2>What have they chosen to share?</h2><p className="routeLead">A couple of relevant excerpts is plenty. Please do not paste private messages or an account export.</p>
          <label className="routeLabel">Selected posts or remembered words<textarea rows={7} value={clues} onChange={event => setClues(event.target.value)} placeholder="One selected excerpt per line…" /></label>
          <button className="exampleButton" type="button" onClick={() => { setClues(EXAMPLE); append('I loaded the fictional example clues.'); }}>✨ Fill with a fictional example</button>
          <label className="consentCheck"><input type="checkbox" checked={allowed} onChange={event => setAllowed(event.target.checked)} /><span><strong>I’m allowed to use these excerpts</strong><small>Only for this private gift search.</small></span></label>
          <button className="routePrimary" type="button" disabled={busy || !clues.trim() || !allowed} onClick={analyse}>{busy ? 'Safely reading the clues…' : 'Find the thoughtful signals →'}</button>
        </section>}

        {stage === 2 && <section className="routeCard">
          <p className="routeKicker">02 · YOUR SAY, ALWAYS 🫶</p><h2>Which of these feels true?</h2><p className="routeLead">WanderWrap proposes; you decide. Unchecked interests never influence the shortlist.</p>
          <div className="interestCloud">{candidates.map(item => <label key={item.id} className={confirmed.includes(item.value) ? 'selected' : ''}><input type="checkbox" checked={confirmed.includes(item.value)} onChange={event => setConfirmed(current => event.target.checked ? [...new Set([...current, item.value])] : current.filter(value => value !== item.value))} /><span>{interestEmoji(item.value)} {title(item.value)}</span><small>{Math.round(item.confidence * 100)}% clue · needs you</small></label>)}</div>
          <div className="safeNotice">🛡️ The response contains labels only. Your pasted wording was not returned to downstream agents.</div>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(1)}>← Edit clues</button><button className="routePrimary" disabled={busy || !confirmed.length} onClick={recommend}>{busy ? 'Agents are coordinating…' : 'Confirm & create my shortlist →'}</button></div>
        </section>}

        {stage === 3 && <section className="routeCard routeIdeas">
          <p className="routeKicker">03 · SMALL, SPECIAL, EXPLAINED 🎀</p><h2>Ideas with a reason behind them.</h2><p className="routeLead">Choose the one that feels most like them. Guide prices and catalogue content remain demo data until Amazon says otherwise.</p>
          <div className="routeGiftGrid">{gifts.map((gift, index) => <button key={gift.id} onClick={() => prepareHandoff(gift)} disabled={busy}><span className="giftEmoji">{giftEmoji(gift.id)}</span><small>0{index + 1} · ABOUT £{gift.price}</small><strong>{gift.name}</strong><p>{gift.story}</p><em>Why it fits: {gift.categories.filter(value => confirmed.includes(value)).join(' + ') || confirmed[0]}</em><b>{busy ? 'Checking…' : 'Choose this gift →'}</b></button>)}</div>
        </section>}

        {stage === 4 && handoff && <section className="routeCard finalHandoff">
          <div className="celebration" aria-hidden="true">✨ 🎁 ✨</div><p className="routeKicker">04 · READY WHEN YOU ARE</p><h2>A thoughtful choice, wrapped for handoff.</h2>
          <div className="chosenGift"><span>{giftEmoji(handoff.selected.id)}</span><div><small>YOUR CHOICE</small><strong>{handoff.selected.name}</strong><p>{handoff.selected.story}</p></div></div>
          {handoff.offers.length > 0 && <div className="amazonOffers">{handoff.offers.slice(0, 3).map(offer => <a href={offer.detailPageUrl} target="_blank" rel="noopener noreferrer" key={offer.asin}>{offer.imageUrl ? <img src={offer.imageUrl} alt="" /> : <span>🛍️</span>}<div><small>LIVE AMAZON RESULT</small><strong>{offer.title}</strong><em>{offer.price?.displayAmount || 'See Amazon for price'} · {availability(offer.availability)}</em></div></a>)}</div>}
          <a className="amazonCta" href={handoff.url} target="_blank" rel="noopener noreferrer"><span>amazon</span><strong>{handoff.mode === 'amazon-creators-live' ? 'View the best match' : 'See matching gifts'} ↗</strong></a>
          <p className="handoffDisclosure">{handoff.disclosure} Nothing has been ordered.</p>
          <button className="routeSecondary restart" onClick={() => { setStage(1); setHandoff(null); setGifts([]); setCandidates([]); setConfirmed([]); setAgent({}); }}>↻ Surprise someone else</button>
        </section>}
        {error && <div className="routeError" role="alert">🛡️ {error}</div>}
      </div>
    </section>

    <section className="agentStudio"><div><p className="eyebrow">THE AGENT STUDIO</p><h2>Specialists, not a black box.</h2><p>Each agent gets one small job and the minimum information it needs.</p></div><div className="agentGrid">{AGENTS.map(([key, emoji, label]) => <article className={agent[key] || 'waiting'} key={key}><span>{emoji}</span><div><strong>{label}</strong><small>{agentCopy(key, agent[key] || 'waiting')}</small></div><i /></article>)}</div></section>
  </>;
}

function title(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function interestEmoji(value: string) { return ({ creative: '🎨', food: '🍵', books: '📚', gardening: '🌿', travel: '🧳', music: '🎵', tech: '✨' } as Record<string, string>)[value] || '💛'; }
function giftEmoji(id: string) { return ({ ceramic: '🏺', tasting: '🥐', journal: '📔', tea: '🫖', speaker: '🎶' } as Record<string, string>)[id] || '🎁'; }
function availability(value?: string) { return value?.replaceAll('_', ' ').toLowerCase() || 'availability on Amazon'; }
function agentCopy(key: string, state: AgentState) {
  if (state === 'working') return 'Working now…';
  if (state === 'done') return ({ privacy: 'Permission checked', preference: 'Safe labels proposed', recommendation: 'Shortlist explained', catalogue: 'Amazon link prepared', routing: 'UK route selected', approval: 'Your click required' } as Record<string, string>)[key];
  return ({ privacy: 'Waiting for permission', preference: 'Waiting for clues', recommendation: 'Waiting for confirmation', catalogue: 'Waiting for a gift', routing: 'Waiting for provider evidence', approval: 'No external action' } as Record<string, string>)[key];
}

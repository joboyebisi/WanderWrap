'use client';

import { useState } from 'react';

type Candidate = { id: string; value: string; confidence: number };
type AgentState = 'waiting' | 'working' | 'done';
type Offer = { asin: string; title: string; detailPageUrl: string; imageUrl?: string; availability?: string; price?: { displayAmount: string } };
type Gift = {
  id: string; name: string; price: number; categories: string[]; story: string;
  direction?: string; giftType?: string; confidence?: number; feasibility?: string;
  risk?: string; why?: string; tradeoff?: string;
};
type Handoff = { mode: string; selected: Gift; marketplace: string; url: string; offers: Offer[]; disclosure: string };
type ChatMessage = { role: 'alexa' | 'user' | 'wanderwrap'; text: string };

const EXAMPLE = `“I love pottery studios—making something imperfect by hand is the best kind of reset.”\n“I enjoy tea, a good novel, and nowhere to be on slow Sunday mornings.”\n“I like houseplants, especially the tiny ones that fit on the kitchen shelf.”`;
const STEPS = ['Moment', 'Evidence', 'Confirm', 'Gift brief', 'Directions', 'Gift plan', 'Amazon'];
const AGENTS: Array<[string, string, string]> = [
  ['moment', '💛', 'Moment planner'], ['privacy', '🛡️', 'Privacy guard'], ['preference', '✨', 'Clue finder'],
  ['constraints', '🚧', 'Constraint guard'], ['recommendation', '💡', 'Gift curator'], ['recipient', '🪞', 'Recipient lens'],
  ['catalogue', '🛍️', 'Amazon scout'], ['routing', '🧭', 'Route planner'], ['storyteller', '✍️', 'Storyteller'],
  ['approval', '✅', 'Approval guard']
];

async function demoAction<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'The demo stopped safely.');
  return body as T;
}

export default function GiftFinderExperience() {
  const [stage, setStage] = useState(1);
  const [recipient, setRecipient] = useState('My partner');
  const [relationship, setRelationship] = useState('Partner');
  const [occasion, setOccasion] = useState('Just because');
  const [meaning, setMeaning] = useState('I notice you');
  const [budget, setBudget] = useState(60);
  const [deadline, setDeadline] = useState('This week');
  const [clues, setClues] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [format, setFormat] = useState('Flexible');
  const [style, setStyle] = useState('Thoughtful surprise');
  const [recipientValue, setRecipientValue] = useState('A calming ritual');
  const [avoidClutter, setAvoidClutter] = useState(true);
  const [avoid, setAvoid] = useState('Subscriptions and high-maintenance gifts');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [agent, setAgent] = useState<Record<string, AgentState>>({});
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: 'alexa', text: 'Who are we surprising today?' },
    { role: 'user', text: 'My partner. I want it to feel personal without spoiling the surprise.' },
    { role: 'wanderwrap', text: 'Let’s understand the moment first, then use only the clues you choose.' }
  ]);

  const append = (text: string, role: ChatMessage['role'] = 'wanderwrap') => setChat(current => [...current, { role, text }]);
  const setAgents = (keys: string[], value: AgentState) => setAgent(current => ({ ...current, ...Object.fromEntries(keys.map(key => [key, value])) }));
  const brief = { recipient, relationship, occasion, meaning, budget, deadline, format, style, recipientValue, avoidClutter, avoid };

  function beginEvidence() {
    setAgents(['moment'], 'done');
    append(`For ${recipient.toLowerCase()}, this ${occasion.toLowerCase()} gift should say “${meaning}”. I’ll keep it under £${budget} and useful ${deadline.toLowerCase()}.`);
    setStage(2); setError('');
  }

  async function analyse() {
    setBusy(true); setError(''); setAgents(['privacy', 'preference'], 'working');
    try {
      const snippets = clues.split(/\n+/).map(value => value.trim()).filter(Boolean);
      const result = await demoAction<{ candidates: Candidate[]; rejectedCount: number }>({ action: 'analyse', snippets, allowedToUse: allowed });
      setCandidates(result.candidates); setConfirmed(result.candidates.map(item => item.value)); setStage(3); setAgents(['privacy', 'preference'], 'done');
      append(`I found ${result.candidates.length} possible interests. They remain suggestions until you confirm them.${result.rejectedCount ? ` I safely discarded ${result.rejectedCount} unusable excerpt.` : ''}`);
    } catch (value) { setError(value instanceof Error ? value.message : 'Clue analysis stopped safely.'); setAgents(['privacy', 'preference'], 'waiting'); }
    finally { setBusy(false); }
  }

  function confirmPreferences() {
    setAgents(['constraints'], 'done');
    append(`You confirmed ${confirmed.join(', ')}. I’ll optimise for ${recipientValue.toLowerCase()}, keep the choice ${style.toLowerCase()}, and avoid ${avoid.toLowerCase()}.`);
    setStage(4); setError('');
  }

  async function createDirections() {
    setBusy(true); setError(''); setAgents(['recommendation', 'recipient'], 'working');
    try {
      const result = await demoAction<{ recommendations: Gift[] }>({ action: 'recommend', interests: confirmed, budget, brief });
      setGifts(result.recommendations); setStage(5); setAgents(['recommendation', 'recipient'], 'done');
      append(`The agents compared relevance, effort, usefulness and risk—not just keywords. Here are ${result.recommendations.length} genuinely different directions.`);
    } catch (value) { setError(value instanceof Error ? value.message : 'Recommendations stopped safely.'); setAgents(['recommendation', 'recipient'], 'waiting'); }
    finally { setBusy(false); }
  }

  function chooseGift(gift: Gift) {
    setSelectedGift(gift); setStage(6); setAgents(['storyteller'], 'done');
    append(`You chose ${gift.name}. I turned it into a complete gift plan before asking Amazon for a matching product.`);
  }

  async function prepareHandoff() {
    if (!selectedGift) return;
    setBusy(true); setError(''); setAgents(['catalogue', 'routing', 'approval'], 'working');
    try {
      const result = await demoAction<Handoff>({ action: 'handoff', giftId: selectedGift.id, destinationCountry: 'GB' });
      setHandoff(result); setStage(7); setAgents(['catalogue', 'routing', 'approval'], 'done');
      append(result.mode === 'amazon-creators-live'
        ? `Amazon returned live product links for ${selectedGift.name}. You still choose whether to continue.`
        : `I prepared an Amazon.co.uk search for ${selectedGift.name}. Amazon confirms the product, price, delivery and checkout.`);
    } catch (value) { setError(value instanceof Error ? value.message : 'The handoff stopped safely.'); setAgents(['catalogue', 'routing', 'approval'], 'waiting'); }
    finally { setBusy(false); }
  }

  function reset() {
    setStage(1); setClues(''); setAllowed(false); setCandidates([]); setConfirmed([]); setGifts([]); setSelectedGift(null); setHandoff(null); setAgent({}); setError('');
  }

  return <>
    <div className="routeProgress" aria-label="Journey progress">
      <div className="routeProgressBar"><i style={{ width: `${((stage - 1) / (STEPS.length - 1)) * 100}%` }} /></div>
      {STEPS.map((label, index) => <div className={`routeStep ${stage === index + 1 ? 'active' : ''} ${stage > index + 1 ? 'complete' : ''}`} key={label}><span>{stage > index + 1 ? '✓' : index + 1}</span><small>{label}</small></div>)}
    </div>

    <section className="routeExperience">
      <aside className="routeConversation">
        <div className="conversationTitle"><div className="alexaGlow">✦</div><div><strong>Alexa+ journey preview</strong><small>Browser simulation · public demo</small></div><span>LIVE</span></div>
        <div className="routeMessages">{chat.map((message, index) => <article className={message.role === 'user' ? 'fromYou' : ''} key={`${message.text}-${index}`}><small>{message.role === 'user' ? 'YOU' : message.role === 'alexa' ? 'ALEXA+' : 'WANDERWRAP'}</small><p>{message.text}</p></article>)}</div>
        <div className="trustStrip"><span>🔒 Selected evidence only</span><span>🫶 You confirm every signal</span><span>🛑 No automatic purchase</span></div>
      </aside>

      <div className="routeWorkbench">
        {stage === 1 && <section className="routeCard">
          <p className="routeKicker">01 · THE MOMENT 💛</p><h2>What should this gift say?</h2><p className="routeLead">The same hobby can lead to very different gifts. Start with the relationship, occasion and feeling you want to create.</p>
          <div className="briefFormGrid">
            <label>Who are they?<input value={recipient} onChange={event => setRecipient(event.target.value)} /></label>
            <label>Relationship<select value={relationship} onChange={event => setRelationship(event.target.value)}><option>Partner</option><option>Friend</option><option>Parent</option><option>Sibling</option><option>Colleague</option></select></label>
            <label>Occasion<select value={occasion} onChange={event => setOccasion(event.target.value)}><option>Just because</option><option>Birthday</option><option>Anniversary</option><option>Thank you</option><option>Celebration</option></select></label>
            <label>Budget<input type="number" min="10" max="500" value={budget} onChange={event => setBudget(Number(event.target.value))} /></label>
          </div>
          <fieldset className="choiceField"><legend>The message behind it</legend><ChoiceButtons value={meaning} onChange={setMeaning} options={['I notice you', 'You deserve a rest', 'Let’s make a memory', 'I’m proud of you']} /></fieldset>
          <fieldset className="choiceField"><legend>When should it be useful?</legend><ChoiceButtons value={deadline} onChange={setDeadline} options={['This week', 'Within two weeks', 'No rush']} /></fieldset>
          <div className="routeActions"><button className="routeSecondary" onClick={() => { setRecipient('My partner'); setRelationship('Partner'); setOccasion('Just because'); setMeaning('I notice you'); setBudget(60); setDeadline('This week'); }}>✨ Use demo story</button><button className="routePrimary" disabled={!recipient.trim() || budget < 10} onClick={beginEvidence}>Build the moment →</button></div>
        </section>}

        {stage === 2 && <section className="routeCard">
          <p className="routeKicker">02 · THE EVIDENCE ENVELOPE 💌</p><h2>What have they chosen to share?</h2><p className="routeLead">Use a remembered comment, known hobby, requested item or a few selected public excerpts. Do not paste private messages or an account export.</p>
          <div className="evidenceTypes"><span>💬 Remembered words</span><span>🎯 Known hobby</span><span>⭐ Requested item</span><span>🔗 Selected public post</span></div>
          <label className="routeLabel">Selected evidence<textarea rows={6} value={clues} onChange={event => setClues(event.target.value)} placeholder="One selected clue per line…" /></label>
          <button className="exampleButton" type="button" onClick={() => { setClues(EXAMPLE); append('I loaded the fictional example clues.'); }}>✨ Fill with a fictional example</button>
          <label className="consentCheck"><input type="checkbox" checked={allowed} onChange={event => setAllowed(event.target.checked)} /><span><strong>I’m allowed to use these excerpts</strong><small>Only for this private gift search.</small></span></label>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(1)}>← Edit the moment</button><button className="routePrimary" type="button" disabled={busy || !clues.trim() || !allowed} onClick={analyse}>{busy ? 'Safely reading the clues…' : 'Find thoughtful signals →'}</button></div>
        </section>}

        {stage === 3 && <section className="routeCard">
          <p className="routeKicker">03 · CONFIRM & CLARIFY 🫶</p><h2>What feels true—and what matters most?</h2><p className="routeLead">WanderWrap proposes; you decide. Then two focused questions resolve the uncertainty that keywords cannot.</p>
          <div className="interestCloud">{candidates.map(item => <label key={item.id} className={confirmed.includes(item.value) ? 'selected' : ''}><input type="checkbox" checked={confirmed.includes(item.value)} onChange={event => setConfirmed(current => event.target.checked ? [...new Set([...current, item.value])] : current.filter(value => value !== item.value))} /><span>{interestEmoji(item.value)} {title(item.value)}</span><small>{Math.round(item.confidence * 100)}% clue · needs you</small></label>)}</div>
          <fieldset className="choiceField compact"><legend>Would they prefer…</legend><ChoiceButtons value={recipientValue} onChange={setRecipientValue} options={['A calming ritual', 'A shared experience', 'Something useful']} /></fieldset>
          <fieldset className="choiceField compact"><legend>How adventurous?</legend><ChoiceButtons value={style} onChange={setStyle} options={['Safe favourite', 'Thoughtful surprise', 'Delightful wildcard']} /></fieldset>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(2)}>← Edit evidence</button><button className="routePrimary" disabled={!confirmed.length} onClick={confirmPreferences}>Create the Gift Brief →</button></div>
        </section>}

        {stage === 4 && <section className="routeCard">
          <p className="routeKicker">04 · THE GIFT BRIEF 📋</p><h2>Understanding before shopping.</h2><p className="routeLead">This is the shared plan every specialist uses. You can see exactly what is known, assumed and still uncertain.</p>
          <div className="giftBrief">
            <BriefRow icon="💛" label="Moment" value={`${relationship} · ${occasion} · “${meaning}”`} />
            <BriefRow icon="✨" label="Confirmed interests" value={confirmed.map(title).join(', ')} />
            <BriefRow icon="🎯" label="Recipient value" value={`${recipientValue} · ${style}`} />
            <BriefRow icon="📦" label="Practical fit" value={`Up to £${budget} · UK · ${deadline}`} />
            <div className="briefEditable"><label><input type="checkbox" checked={avoidClutter} onChange={event => setAvoidClutter(event.target.checked)} /> Prefer low-clutter ideas</label><label>Anything to avoid?<input value={avoid} onChange={event => setAvoid(event.target.value)} /></label></div>
          </div>
          <div className="confidencePanel"><span>86%</span><div><strong>Strong enough to recommend</strong><small>High confidence in interests; Amazon availability remains unknown until handoff.</small></div></div>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(3)}>← Refine answers</button><button className="routePrimary" disabled={busy} onClick={createDirections}>{busy ? 'Agents are comparing…' : 'Explore gift directions →'}</button></div>
        </section>}

        {stage === 5 && <section className="routeCard routeIdeas">
          <p className="routeKicker">05 · DISTINCT DIRECTIONS 🎀</p><h2>Four ways to make them feel seen.</h2><p className="routeLead">Not four versions of the same product. Compare emotional fit, usefulness, effort and risk before choosing a direction.</p>
          <div className="directionGrid">{gifts.map(gift => <button key={gift.id} onClick={() => chooseGift(gift)}>
            <div className="directionTop"><span className="giftEmoji">{giftEmoji(gift.id)}</span><span className="confidenceBadge">{gift.confidence || 80}% fit</span></div>
            <small>{gift.direction || 'THOUGHTFUL DIRECTION'} · {gift.giftType || 'GIFT'}</small><strong>{gift.name}</strong><p>{gift.why || gift.story}</p>
            <div className="tradeoff"><b>Recipient lens</b><span>{gift.feasibility || 'Easy to enjoy'}</span></div><div className="riskLine"><b>Watch-out</b><span>{gift.risk || 'Confirm the final details'}</span></div>
            <em>About £{gift.price} · {gift.tradeoff || 'Balanced fit'}</em><i>Choose this direction →</i>
          </button>)}</div>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(4)}>← Edit Gift Brief</button></div>
        </section>}

        {stage === 6 && selectedGift && <section className="routeCard giftPlanCard">
          <p className="routeKicker">06 · THE COMPLETE GIFT PLAN ✍️</p><h2>More than a shopping link.</h2><p className="routeLead">WanderWrap prepares the meaning, practical checks and presentation before asking a retailer for products.</p>
          <div className="chosenGift planChoice"><span>{giftEmoji(selectedGift.id)}</span><div><small>{selectedGift.direction || 'YOUR DIRECTION'}</small><strong>{selectedGift.name}</strong><p>{selectedGift.story}</p></div></div>
          <div className="planGrid">
            <article><span>🪞</span><div><small>RECIPIENT LENS</small><strong>{selectedGift.feasibility || 'Easy to enjoy'}</strong><p>{selectedGift.risk}</p></div></article>
            <article><span>📦</span><div><small>DELIVERY CHECK</small><strong>{deadline} · UK</strong><p>Amazon must confirm stock, final price and arrival.</p></div></article>
            <article><span>✍️</span><div><small>GIFT NOTE</small><strong>“A little something for your slow Sundays.”</strong><p>Editable before anything is shared.</p></div></article>
            <article><span>🔐</span><div><small>APPROVAL</small><strong>Your click is required</strong><p>No order, message or address request has happened.</p></div></article>
          </div>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(5)}>← Compare directions</button><button className="routePrimary" disabled={busy} onClick={prepareHandoff}>{busy ? 'Checking the UK route…' : 'Prepare Amazon matches →'}</button></div>
        </section>}

        {stage === 7 && handoff && <section className="routeCard finalHandoff">
          <div className="celebration" aria-hidden="true">✨ 🎁 ✨</div><p className="routeKicker">07 · READY WHEN YOU ARE</p><h2>A thoughtful choice, wrapped for handoff.</h2>
          <div className="chosenGift"><span>{giftEmoji(handoff.selected.id)}</span><div><small>YOUR GIFT PLAN</small><strong>{handoff.selected.name}</strong><p>{meaning} · {recipientValue} · {deadline}</p></div></div>
          {handoff.offers.length > 0 && <div className="amazonOffers">{handoff.offers.slice(0, 3).map(offer => <a href={offer.detailPageUrl} target="_blank" rel="noopener noreferrer" key={offer.asin}>{offer.imageUrl ? <img src={offer.imageUrl} alt="" /> : <span>🛍️</span>}<div><small>LIVE AMAZON RESULT</small><strong>{offer.title}</strong><em>{offer.price?.displayAmount || 'See Amazon for price'} · {availability(offer.availability)}</em></div></a>)}</div>}
          <a className="amazonCta" href={handoff.url} target="_blank" rel="noopener noreferrer"><span>amazon</span><strong>{handoff.mode === 'amazon-creators-live' ? 'View the best match' : 'See matching gifts'} ↗</strong></a>
          <p className="handoffDisclosure">{handoff.disclosure} Nothing has been ordered.</p>
          <button className="routeSecondary restart" onClick={reset}>↻ Surprise someone else</button>
        </section>}
        {error && <div className="routeError" role="alert">🛡️ {error}</div>}
      </div>
    </section>

    <section className="agentStudio"><div><p className="eyebrow">THE AGENT STUDIO</p><h2>Every specialist leaves evidence.</h2><p>Status lights now correspond to visible work in the Gift Brief, recommendation trade-offs and final plan.</p></div><div className="agentGrid">{AGENTS.map(([key, emoji, label]) => <article className={agent[key] || 'waiting'} key={key}><span>{emoji}</span><div><strong>{label}</strong><small>{agentCopy(key, agent[key] || 'waiting')}</small></div><i /></article>)}</div></section>
  </>;
}

function ChoiceButtons({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="choiceButtons">{options.map(option => <button type="button" className={value === option ? 'selected' : ''} onClick={() => onChange(option)} key={option}>{option}</button>)}</div>;
}
function BriefRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="briefRow"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div><i>Confirmed</i></div>;
}
function title(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function interestEmoji(value: string) { return ({ creative: '🎨', food: '🍵', books: '📚', gardening: '🌿', travel: '🧳', music: '🎵', tech: '✨' } as Record<string, string>)[value] || '💛'; }
function giftEmoji(id: string) { return ({ ceramic: '🏺', tasting: '🥐', journal: '📔', tea: '🫖', speaker: '🎶' } as Record<string, string>)[id] || '🎁'; }
function availability(value?: string) { return value?.replaceAll('_', ' ').toLowerCase() || 'availability on Amazon'; }
function agentCopy(key: string, state: AgentState) {
  if (state === 'working') return 'Working now…';
  if (state === 'done') return ({ moment: 'Meaning and timing set', privacy: 'Permission checked', preference: 'Safe labels proposed', constraints: 'Trade-offs captured', recommendation: 'Directions compared', recipient: 'Usefulness challenged', catalogue: 'Amazon link prepared', routing: 'UK route selected', storyteller: 'Gift plan written', approval: 'Your click required' } as Record<string, string>)[key];
  return ({ moment: 'Waiting for the moment', privacy: 'Waiting for permission', preference: 'Waiting for evidence', constraints: 'Waiting for priorities', recommendation: 'Waiting for the brief', recipient: 'Waiting to challenge', catalogue: 'Waiting for a gift', routing: 'Waiting for provider evidence', storyteller: 'Waiting for a choice', approval: 'No external action' } as Record<string, string>)[key];
}

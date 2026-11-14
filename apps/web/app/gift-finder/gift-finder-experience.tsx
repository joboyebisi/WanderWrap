'use client';

import { useEffect, useMemo, useState } from 'react';

type Candidate = { id: string; value: string; confidence: number };
type Offer = {
  id?: string; asin?: string; title: string; url?: string; detailPageUrl?: string; imageUrl?: string;
  imageAlt?: string; merchant?: string; availability?: string; price?: number | { displayAmount: string } | null; currency?: string | null;
};
type Discovery = { mode: string; provider?: string; marketplace: string; url: string; offers: Offer[]; disclosure: string; observedAt?: string };
type RetailerDeparture = { url: string; title: string; merchant: string };

const STEPS = ['About them', 'Preferences', 'Gift Brief', 'Recommendations'];
const INTERESTS = ['Food & drink', 'Books', 'Wellness', 'Home & design', 'Creative hobbies', 'Travel', 'Music', 'Technology', 'Outdoors'];

async function demoAction<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Gift discovery stopped safely.');
  return body as T;
}

export default function GiftFinderExperience() {
  const [stage, setStage] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState('Partner');
  const [occasion, setOccasion] = useState('Just because');
  const [meaning, setMeaning] = useState('I notice you');
  const [budget, setBudget] = useState(60);
  const [deadline, setDeadline] = useState('This week');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [clues, setClues] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [format, setFormat] = useState('Flexible');
  const [style, setStyle] = useState('Thoughtful surprise');
  const [avoid, setAvoid] = useState('');
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [departure, setDeparture] = useState<RetailerDeparture | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const interests = useMemo(() => [...new Set([...selectedInterests, ...candidates.map(item => item.value)])], [selectedInterests, candidates]);
  const brief = { recipient: recipient.trim() || 'Someone special', relationship, occasion, meaning, budget, deadline, interests, notes, format, style, avoid, destinationCountry: 'GB' };

  useEffect(() => {
    if (!departure) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDeparture(null); };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = previousOverflow; };
  }, [departure]);

  function nextFromMoment() {
    if (!recipient.trim()) { setError('Tell us who the gift is for. A first name or nickname is enough.'); return; }
    setError(''); setStage(2);
  }

  function toggleInterest(value: string) {
    setSelectedInterests(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  }

  async function analyseOptionalClues() {
    if (!clues.trim()) { setError('Add a selected clue first, or continue without one.'); return; }
    setBusy(true); setError('');
    try {
      const snippets = clues.split(/\n+/).map(value => value.trim()).filter(Boolean);
      const result = await demoAction<{ candidates: Candidate[] }>({ action: 'analyse', snippets, allowedToUse: allowed });
      setCandidates(result.candidates);
    } catch (value) { setError(value instanceof Error ? value.message : 'Clue analysis stopped safely.'); }
    finally { setBusy(false); }
  }

  function reviewBrief() {
    if (!interests.length && !notes.trim()) { setError('Add one interest or a short note about what they enjoy.'); return; }
    setError(''); setStage(3);
  }

  async function findGifts() {
    setBusy(true); setError('');
    try {
      const result = await demoAction<Discovery>({ action: 'discover', brief });
      setDiscovery(result); setStage(4);
    } catch (value) { setError(value instanceof Error ? value.message : 'We could not reach the catalogue just now. Your Gift Brief is still here—please try again.'); }
    finally { setBusy(false); }
  }

  function reset() {
    setStage(1); setRecipient(''); setRelationship('Partner'); setOccasion('Just because'); setMeaning('I notice you'); setBudget(60);
    setDeadline('This week'); setSelectedInterests([]); setNotes(''); setClues(''); setAllowed(false); setCandidates([]);
    setFormat('Flexible'); setStyle('Thoughtful surprise'); setAvoid(''); setDiscovery(null); setDeparture(null); setError('');
  }

  function prepareRetailerDeparture(offer?: Offer) {
    if (!discovery) return;
    setDeparture({
      url: offer?.url || offer?.detailPageUrl || discovery.url,
      title: offer?.title || `Gifts for ${brief.recipient}`,
      merchant: offer?.merchant || discovery.provider || 'the retailer'
    });
  }

  return <>
    <div className="routeProgress" aria-label="Gift Finder progress">
      <div className="routeProgressBar"><i style={{ width: `${((stage - 1) / (STEPS.length - 1)) * 100}%` }} /></div>
      {STEPS.map((label, index) => <div className={`routeStep ${stage === index + 1 ? 'active' : ''} ${stage > index + 1 ? 'complete' : ''}`} key={label}><span>{stage > index + 1 ? '✓' : index + 1}</span><small>{label}</small></div>)}
    </div>

    <section className="routeExperience">
      <aside className="routeConversation giftBriefRail">
        <div className="conversationTitle"><div className="briefMark">✦</div><div><strong>Your Gift Brief</strong><small>Built with you, refined by our agents</small></div></div>
        <div className="briefRailBody">
          <p className="briefRailIntro">Tell us what matters. WanderWrap turns it into a clear brief before searching current products.</p>
          <BriefRailRow label="For" value={brief.recipient} />
          <BriefRailRow label="Moment" value={`${occasion} · ${deadline}`} />
          <BriefRailRow label="It should say" value={meaning} />
          <BriefRailRow label="Budget" value={`Up to £${budget}`} />
          <BriefRailRow label="What they enjoy" value={interests.length ? interests.join(', ') : 'Add in the next step'} muted={!interests.length} />
          <BriefRailRow label="Style" value={`${style} · ${format}`} />
        </div>
        <div className="trustStrip"><span>Only the details you choose</span><span>You review the brief before search</span><span>No automatic purchase</span></div>
      </aside>

      <div className="routeWorkbench">
        {stage === 1 && <section className="routeCard">
          <p className="routeKicker">01 · THE PERSON AND MOMENT</p><h2>Who are you celebrating?</h2><p className="routeLead">Start with enough context to make the gift feel personal. You can keep names informal.</p>
          <div className="briefFormGrid">
            <label>First name or nickname<input value={recipient} onChange={event => setRecipient(event.target.value)} placeholder="e.g. Maya" autoComplete="off" /></label>
            <label>Your relationship<select value={relationship} onChange={event => setRelationship(event.target.value)}><option>Partner</option><option>Friend</option><option>Parent</option><option>Sibling</option><option>Colleague</option><option>Client</option><option>Other</option></select></label>
            <label>Occasion<select value={occasion} onChange={event => setOccasion(event.target.value)}><option>Just because</option><option>Birthday</option><option>Anniversary</option><option>Thank you</option><option>Congratulations</option><option>New home</option><option>Work milestone</option></select></label>
            <label>When do you need it?<select value={deadline} onChange={event => setDeadline(event.target.value)}><option>This week</option><option>Within two weeks</option><option>This month</option><option>No rush</option></select></label>
            <label>Budget, up to £<input type="number" min="10" max="5000" value={budget} onChange={event => setBudget(Math.max(10, Number(event.target.value) || 10))} /></label>
          </div>
          <fieldset className="choiceField"><legend>What should the gift say?</legend><ChoiceButtons value={meaning} onChange={setMeaning} options={['I notice you', 'You deserve this', 'Let’s celebrate', 'I’m thinking of you']} /></fieldset>
          <div className="routeActions"><span /><button className="routePrimary" onClick={nextFromMoment}>Tell us about them →</button></div>
        </section>}

        {stage === 2 && <section className="routeCard">
          <p className="routeKicker">02 · WHAT MAKES THEM THEM</p><h2>What do they genuinely enjoy?</h2><p className="routeLead">Choose a few interests and add the details a generic search would miss. Selected excerpts are optional.</p>
          <div className="preferencePicker">{INTERESTS.map(item => <button type="button" className={selectedInterests.includes(item) ? 'selected' : ''} aria-pressed={selectedInterests.includes(item)} onClick={() => toggleInterest(item)} key={item}>{item}</button>)}</div>
          <label className="routeLabel">Anything else that would help?<textarea rows={3} value={notes} onChange={event => setNotes(event.target.value)} placeholder="They love quiet Sunday mornings, have a small flat, and prefer useful things over novelty…" maxLength={800} /></label>
          <details className="optionalEvidence"><summary>Add a selected post or excerpt <span>Optional</span></summary>
            <p>Paste only a short excerpt you are allowed to use—not private messages or a full account export. We use it to suggest interests for you to review.</p>
            <label className="routeLabel">Selected excerpt<textarea rows={3} value={clues} onChange={event => setClues(event.target.value)} maxLength={1200} /></label>
            <label className="consentCheck"><input type="checkbox" checked={allowed} onChange={event => setAllowed(event.target.checked)} /><span><strong>I’m allowed to use this excerpt</strong><small>It will be processed transiently to propose gift-relevant interests.</small></span></label>
            <button className="routeSecondary" type="button" disabled={busy || !allowed} onClick={analyseOptionalClues}>{busy ? 'Reviewing clue…' : 'Suggest interests from this clue'}</button>
            {candidates.length > 0 && <div className="suggestedInterests"><small>Suggested from your excerpt—remove any that do not fit</small>{candidates.map(candidate => <button type="button" key={candidate.id} onClick={() => setCandidates(current => current.filter(item => item.id !== candidate.id))}>{candidate.value} ×</button>)}</div>}
          </details>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(1)}>← Back</button><button className="routePrimary" onClick={reviewBrief}>Review Gift Brief →</button></div>
        </section>}

        {stage === 3 && <section className="routeCard">
          <p className="routeKicker">03 · REVIEW YOUR GIFT BRIEF</p><h2>One clear brief for our gift agents.</h2><p className="routeLead">Check the details before they influence recommendations. You can go back and change anything.</p>
          <div className="giftBrief">
            <BriefRow label="Recipient" value={`${brief.recipient} · ${relationship}`} />
            <BriefRow label="Moment" value={`${occasion} · ${deadline} · ${meaning}`} />
            <BriefRow label="Confirmed interests" value={interests.join(', ') || 'None added'} />
            {notes && <BriefRow label="What you told us" value={notes} />}
            <BriefRow label="Budget" value={`Up to £${budget} · United Kingdom`} />
          </div>
          <div className="briefFormGrid briefRefinements">
            <label>Gift style<select value={style} onChange={event => setStyle(event.target.value)}><option>Thoughtful surprise</option><option>Quiet luxury</option><option>Playful and unexpected</option><option>Practical and lasting</option><option>Shared experience</option></select></label>
            <label>Format<select value={format} onChange={event => setFormat(event.target.value)}><option>Flexible</option><option>Physical gift</option><option>Experience</option><option>Consumable</option></select></label>
            <label className="spanTwo">Anything to avoid?<input value={avoid} onChange={event => setAvoid(event.target.value)} placeholder="e.g. subscriptions, alcohol, clutter, strong scents" maxLength={240} /></label>
          </div>
          <div className="emailPreview"><div><strong>Want to keep this brief?</strong><span>Email delivery will be added once verified saving and unsubscribe controls are live. It will never block recommendations.</span></div><span>Coming next</span></div>
          <div className="routeActions"><button className="routeSecondary" onClick={() => setStage(2)}>← Edit details</button><button className="routePrimary" disabled={busy} onClick={findGifts}>{busy ? 'Our agents are researching…' : 'Find gifts with our agents →'}</button></div>
        </section>}

        {stage === 4 && discovery && <section className="routeCard finalHandoff">
          <p className="routeKicker">04 · CURRENT RECOMMENDATIONS</p><h2>Thoughtful options for {brief.recipient}.</h2>
          <p className="routeLead">Our catalogue agent searched from your Gift Brief—not a generic keyword. Compare the current matches, then choose whether to visit a retailer.</p>
          <div className="catalogueProof"><span>{discovery.mode === 'channel3-live-discovery' ? 'Curated with Channel3' : 'Retailer handoff'}</span>{discovery.observedAt && <small>Checked {formatObservedAt(discovery.observedAt)}</small>}</div>
          {discovery.offers.length > 0 ? <div className="amazonOffers">{discovery.offers.slice(0, 6).map(offer => <button type="button" onClick={() => prepareRetailerDeparture(offer)} key={offer.id || offer.asin || offer.url}>{offer.imageUrl ? <img src={offer.imageUrl} alt={offer.imageAlt || offer.title} /> : <span>🎁</span>}<div><small>{offer.merchant || discovery.provider || 'RETAILER'}</small><strong>{offer.title}</strong><em>{offerPrice(offer)} · {availability(offer.availability)}</em><i>Review at retailer ↗</i></div></button>)}</div> : <button className="amazonCta" type="button" onClick={() => prepareRetailerDeparture()}><span>{discovery.provider || 'retailer'}</span><strong>See matching gifts ↗</strong></button>}
          <p className="handoffDisclosure">{discovery.disclosure} Nothing has been ordered.</p>
          <div className="routeActions resultActions"><button className="routeSecondary" onClick={() => setStage(3)}>← Refine brief</button><button className="routeSecondary" onClick={reset}>Start another Gift Brief</button></div>
        </section>}
        {error && <div className="routeError" role="alert">{error}</div>}
      </div>
    </section>

    {departure && <div className="retailerModal" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDeparture(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="retailer-title" aria-describedby="retailer-description">
        <button className="retailerClose" type="button" aria-label="Close retailer handoff" onClick={() => setDeparture(null)} autoFocus>×</button>
        <p className="routeKicker">YOUR RETAILER HANDOFF</p><h2 id="retailer-title">Continue with {departure.merchant}?</h2>
        <p id="retailer-description">For now, WanderWrap builds the Gift Brief and researches current options; you complete the purchase with the retailer. As the full experience launches, WanderWrap will bring approved purchasing, recipient choices and delivery progress into one place.</p>
        <div className="retailerNotice"><strong>No order has been placed.</strong><span>{departure.merchant} will confirm the final price, availability, delivery, returns and payment for “{departure.title}”.</span></div>
        <div className="retailerActions"><button type="button" onClick={() => setDeparture(null)}>Stay and compare</button><a href={departure.url} target="_blank" rel="noopener noreferrer" onClick={() => setDeparture(null)}>Continue to retailer ↗</a></div>
      </section>
    </div>}
  </>;
}

function ChoiceButtons({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="choiceButtons">{options.map(option => <button type="button" className={value === option ? 'selected' : ''} onClick={() => onChange(option)} key={option}>{option}</button>)}</div>;
}
function BriefRailRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) { return <div className={`briefRailRow ${muted ? 'muted' : ''}`}><small>{label}</small><strong>{value}</strong></div>; }
function BriefRow({ label, value }: { label: string; value: string }) { return <div className="briefRow"><div><small>{label}</small><strong>{value}</strong></div><i>Confirmed</i></div>; }
function availability(value?: string) { return value?.replaceAll('_', ' ').toLowerCase() || 'confirm at retailer'; }
function offerPrice(offer: Offer) {
  if (typeof offer.price === 'object' && offer.price?.displayAmount) return offer.price.displayAmount;
  if (typeof offer.price === 'number') return new Intl.NumberFormat('en-GB', { style: 'currency', currency: offer.currency || 'GBP' }).format(offer.price);
  return 'See retailer for price';
}
function formatObservedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'just now' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

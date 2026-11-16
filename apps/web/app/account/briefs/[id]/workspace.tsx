'use client';

import { useEffect, useState } from 'react';
import { LANDING_GIFT_PROMPT_KEY } from '../../../landing-gift-composer';
type Brief = { name: string; country: string; currency: string; productIds: string[]; brief: { recipient: string; occasion: string; budget: string; timing: string; preferences: string[]; constraints: string[] } };
export default function BriefWorkspace({ id }: { id: string }) {
  const [item, setItem] = useState<Brief | null | undefined>(undefined);
  useEffect(() => { void fetch(`/api/core/briefs/${encodeURIComponent(id)}`, { cache: 'no-store' }).then(async response => setItem(response.ok ? await response.json() : null)); }, [id]);
  if (item === undefined) return <section className="shell savedBriefPage"><p>Opening your Gift Brief…</p></section>;
  if (!item) return <section className="shell savedBriefPage"><h1>Gift Brief not found.</h1></section>;
  const research = () => { const brief = item.brief; sessionStorage.setItem(LANDING_GIFT_PROMPT_KEY, `Please research fresh gifts using this saved brief: for ${brief.recipient || 'someone special'}; occasion ${brief.occasion || 'not fixed'}; budget ${brief.budget || 'flexible'}; needed ${brief.timing || 'with no fixed deadline'}; interests ${brief.preferences.join(', ') || 'to explore'}; avoid ${brief.constraints.join(', ') || 'nothing specified'}.`); location.assign('/gift-finder'); };
  return <section className="shell savedBriefPage"><p className="eyebrow">SAVED GIFT BRIEF</p><h1>{item.name}</h1><p>{item.country} · {item.currency} · {item.productIds?.length || 0} products in the original shortlist</p><div className="savedBriefFacts">{[['For',item.brief.recipient],['Moment',item.brief.occasion],['Budget',item.brief.budget],['Timing',item.brief.timing],['Clues',item.brief.preferences.join(', ')],['Avoid',item.brief.constraints.join(', ')]].map(([label,value]) => <div key={label}><small>{label}</small><strong>{value || 'Not specified'}</strong></div>)}</div><button type="button" onClick={research}>Research fresh gifts with this brief ✨</button><small>Fresh research is intentional: retailer price, stock and offer links can change.</small></section>;
}

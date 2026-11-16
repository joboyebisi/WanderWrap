'use client';

import { captureProductEvent } from '../../product-analytics';
import { LANDING_GIFT_PROMPT_KEY } from '../../landing-gift-composer';

export default function GiftIdeaStart({ prompt, slug }: { prompt: string; slug: string }) {
  return <button type="button" onClick={() => {
    sessionStorage.setItem(LANDING_GIFT_PROMPT_KEY, prompt.slice(0, 1600));
    captureProductEvent('gift_idea_started', { idea_slug: slug });
    location.assign('/gift-finder');
  }}>Use this direction <span>→</span></button>;
}

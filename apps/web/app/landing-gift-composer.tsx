'use client';

import { FormEvent, useState } from 'react';
import { captureProductEvent } from './product-analytics';

export const LANDING_GIFT_PROMPT_KEY = 'wanderwrap:gift-finder:first-prompt';

export default function LandingGiftComposer() {
  const [prompt, setPrompt] = useState('');

  function beginGiftFinder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = prompt.trim();
    if (!message) return;

    // Keep recipient context out of URLs and analytics. The Gift Finder
    // consumes this once in the same tab and immediately removes it.
    window.sessionStorage.setItem(LANDING_GIFT_PROMPT_KEY, message.slice(0, 1600));
    captureProductEvent('landing_gift_prompt_started', { prompt_length_band: message.length < 80 ? 'short' : message.length < 240 ? 'medium' : 'long' });
    window.location.assign('/gift-finder');
  }

  return (
    <form className="landingGiftComposer" onSubmit={beginGiftFinder}>
      <div className="landingAgentCue"><span>WW</span><p><strong>Ask WanderWrap, your personal gift shopper</strong><small>Start with a person, a moment, or the one detail that matters.</small></p><em>AI AGENT</em></div>
      <label htmlFor="landing-gift-prompt">Who are you shopping for?</label>
      <textarea
        id="landing-gift-prompt"
        rows={2}
        maxLength={1600}
        value={prompt}
        onChange={event => setPrompt(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="Tell us about the person, the occasion and what would make the gift feel like them…"
      />
      <div className="landingComposerActions">
        <small>Start as a guest · Share only what you choose</small>
        <button type="submit" disabled={!prompt.trim()} aria-label="Start the Gift Finder conversation">
          <span>Start finding</span><b aria-hidden="true">→</b>
        </button>
      </div>
    </form>
  );
}

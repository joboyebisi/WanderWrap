'use client';

import { FormEvent, useState } from 'react';
import { captureProductEvent } from './product-analytics';

export const LANDING_GIFT_PROMPT_KEY = 'wanderwrap:gift-finder:first-prompt';

const STARTER_PROMPTS = [
  {
    label: 'Birthday for someone who has everything',
    prompt: 'Help me find a thoughtful birthday gift for someone who seems to have everything.',
  },
  {
    label: 'A thoughtful gift for my partner',
    prompt: 'Help me find a thoughtful gift for my partner, with a budget of up to £75.',
  },
  {
    label: 'A thank-you gift under £40',
    prompt: 'Help me find a thank-you gift for a friend, with a budget of up to £40.',
  },
  {
    label: 'Last-minute, but still personal',
    prompt: 'I need a last-minute gift that still feels personal.',
  },
] as const;

export default function LandingGiftComposer() {
  const [prompt, setPrompt] = useState('');

  function storePromptAndOpenGiftFinder(message: string, entry: 'typed' | 'starter') {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Keep recipient context out of URLs and analytics. The Gift Finder
    // consumes this once in the same tab and immediately removes it.
    window.sessionStorage.setItem(LANDING_GIFT_PROMPT_KEY, trimmedMessage.slice(0, 1600));
    captureProductEvent('landing_gift_prompt_started', {
      prompt_entry: entry,
      prompt_length_band: trimmedMessage.length < 80 ? 'short' : trimmedMessage.length < 240 ? 'medium' : 'long',
    });
    window.location.assign('/gift-finder');
  }

  function beginGiftFinder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = prompt.trim();
    if (!message) return;
    storePromptAndOpenGiftFinder(message, 'typed');
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
      <div className="landingStarterPrompts" aria-label="Popular ways to start">
        <small>Or try a popular starting point</small>
        <div>
          {STARTER_PROMPTS.map(starter => (
            <button
              key={starter.label}
              type="button"
              className="landingStarterPrompt"
              onClick={() => storePromptAndOpenGiftFinder(starter.prompt, 'starter')}
              aria-label={`Start with: ${starter.label}`}
            >
              {starter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="landingComposerActions">
        <small>Start as a guest · Share only what you choose</small>
        <button type="submit" disabled={!prompt.trim()} aria-label="Start the Gift Finder conversation">
          <span>Start finding</span><b aria-hidden="true">→</b>
        </button>
      </div>
    </form>
  );
}

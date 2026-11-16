const EMPTY_BRIEF = Object.freeze({ recipient: '', occasion: '', budget: '', timing: '', preferences: [], constraints: [] });

export function normalizeGiftBrief(value = {}) {
  return {
    recipient: clean(value.recipient, 100), occasion: clean(value.occasion, 120), budget: clean(value.budget, 60), timing: clean(value.timing, 80),
    preferences: list(value.preferences, 8, 100), constraints: list(value.constraints, 8, 100)
  };
}

export function advanceGiftBrief(previous = EMPTY_BRIEF, message = '', turnNumber = 1) {
  const brief = normalizeGiftBrief(previous);
  const text = clean(message, 1600);
  const previouslyMissing = missingFields(brief);
  if (!brief.recipient) brief.recipient = match(text, /(?:my|for (?:my|a|an|the))\s+(mum|mom|dad|father|mother|partner|wife|husband|boyfriend|girlfriend|sister|brother|friend|colleague|coworker|boss|teacher|client|neighbour|neighbor|daughter|son|grandmother|grandfather|aunt|uncle)/i) || match(text, /\b(mum|mom|dad|partner|wife|husband|sister|brother|friend|colleague|daughter|son)['’]s\b/i) || match(text, /(?:shopping|gift|present)\s+for\s+(?:my\s+)?([^,.!?]{2,45})/i);
  if (!brief.occasion) brief.occasion = match(text, /(?:for (?:her|his|their|a|the)\s+)?(birthday|anniversary|wedding|christmas|graduation|retirement|housewarming|baby shower|thank[- ]?you|new job|promotion|valentine(?:'s)? day|mother(?:'s)? day|father(?:'s)? day)/i) || (/\b\d{1,3}(?:st|nd|rd|th)\b/i.test(text) ? 'birthday' : '');
  if (!brief.budget) brief.budget = match(text, /((?:under|up to|around|about|between|budget(?: is| of)?)\s*(?:£|\$|€)?\s*\d+(?:\s*(?:-|to)\s*(?:£|\$|€)?\d+)?)/i) || match(text, /((?:£|\$|€)\s*\d+(?:\s*(?:-|to)\s*(?:£|\$|€)?\d+)?)/i) || match(text, /\b((?:my\s+)?budget\s+is\s+(?:flexible|open)|no fixed budget)\b/i);
  if (!brief.timing) brief.timing = extractTiming(text);

  const likes = [...text.matchAll(/(?:loves?|likes?|enjoys?|into|interested in|passionate about)\s+([^.!?;]{2,100})/gi)].map(item => item[1].split(/\s+(?:but|and (?:my|the) budget|with a budget|under [£$€]?\d+)/i)[0]);
  brief.preferences = list([...brief.preferences, ...likes], 8, 100);
  const limits = [...text.matchAll(/(?:doesn['’]t like|dislikes?|avoid|allergic to|already (?:has|owns)|no\s+)\s*([^.!?;]{2,100})/gi)].map(item => item[1]);
  brief.constraints = list([...brief.constraints, ...limits], 8, 100);

  // Guided answers are often fragments ("about 60", "my mentor", "a keen
  // reader"). Use the question context so a useful answer is not discarded.
  const expected = previouslyMissing[0];
  const usefulFragment = text && !/^(?:not sure|unsure|i don['’]t know|don['’]t know|no idea|anything|whatever)$/i.test(text);
  if (usefulFragment && expected === 'a comfortable budget' && !brief.budget && (/\d/.test(text) || /\b(?:flexible|open|no fixed budget)\b/i.test(text))) brief.budget = text.slice(0, 60);
  if (usefulFragment && expected === 'who the gift is for' && !brief.recipient && text.length <= 100) brief.recipient = text;
  if (usefulFragment && expected === 'the occasion' && !brief.occasion && text.length <= 120) brief.occasion = text;
  if (usefulFragment && expected === 'when it needs to be ready' && !brief.timing && text.length <= 80) brief.timing = text;
  if (usefulFragment && expected === 'one interest, dislike or useful clue' && !(brief.preferences.length || brief.constraints.length) && text.length <= 160) brief.preferences = [text];

  const score = [brief.recipient, brief.occasion, brief.budget, brief.preferences.length || brief.constraints.length].filter(Boolean).length;
  const missing = missingFields(brief);
  return { brief, score, missing, readyToReveal: score >= 4 && Boolean(brief.timing) && Number(turnNumber) >= 2, nextQuestion: questionFor(missing[0]) };
}

function missingFields(brief) {
  return [!brief.recipient && 'who the gift is for', !brief.occasion && 'the occasion', !brief.budget && 'a comfortable budget', !brief.timing && 'when it needs to be ready', !(brief.preferences.length || brief.constraints.length) && 'one interest, dislike or useful clue'].filter(Boolean);
}

function questionFor(item) {
  const questions = {
    'who the gift is for': 'Who are we celebrating, and what is your relationship to them?',
    'the occasion': 'What is the moment—birthday, thank-you, anniversary, or something else?',
    'a comfortable budget': 'What budget would feel comfortable? A range is perfect.',
    'when it needs to be ready': 'When should the gift be ready—this weekend, next week, or is there no fixed date?',
    'one interest, dislike or useful clue': 'What feels most like them—and is there anything they already own or would rather avoid?'
  };
  return questions[item] || 'One last check: is there anything practical I should respect, such as timing, delivery, allergies or avoiding clutter?';
}

function clean(value, max) { return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function match(text, pattern) { const value = text.match(pattern)?.[1]; return value ? clean(value, 120) : ''; }
function list(values, maxItems, maxLength) { return [...new Set((Array.isArray(values) ? values : []).map(value => clean(value, maxLength)).filter(Boolean))].slice(0, maxItems); }

function extractTiming(text) {
  const needed = match(text, /\b((?:need(?:ed)?(?:\s+it)?|ready|arriv(?:e|ing))\s+(?:today|tonight|tomorrow|this\s+(?:weekend|week|month)|next\s+(?:weekend|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)))\b/i);
  if (needed) return needed;
  const relative = match(text, /\b((?:needed?\s+|arriv(?:e|ing)\s+)?(?:by|before|for|on)\s+(?:(?:the\s+)?(?:end|start)\s+of\s+)?(?:today|tonight|tomorrow|this\s+(?:weekend|week|month)|next\s+(?:weekend|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:of\s+)?[a-z]+)?(?:\s+\d{4})?))\b/i);
  if (relative) return relative;
  return match(text, /\b((?:in|within)\s+(?:(?:a|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+)?(?:hours?|days?|weeks?|months?))\b/i)
    || match(text, /\b(asap|as soon as possible|last[- ]minute|no fixed date|no rush|whenever)\b/i);
}

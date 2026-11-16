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
  if (!brief.recipient) brief.recipient = match(text, /(?:my|for (?:my|a|an|the))\s+(mum|mom|dad|father|mother|partner|wife|husband|boyfriend|girlfriend|sister|brother|friend|colleague|coworker|boss|teacher|client|neighbour|neighbor|daughter|son|grandmother|grandfather|aunt|uncle)/i) || match(text, /\b(mum|mom|dad|partner|wife|husband|sister|brother|friend|colleague|daughter|son)['’]s\b/i) || match(text, /(?:shopping|gift|present)\s+for\s+(?:my\s+)?([^,.!?]{2,45})/i);
  if (!brief.occasion) brief.occasion = match(text, /(?:for (?:her|his|their|a|the)\s+)?(birthday|anniversary|wedding|christmas|graduation|retirement|housewarming|baby shower|thank[- ]?you|new job|promotion|valentine(?:'s)? day|mother(?:'s)? day|father(?:'s)? day)/i) || (/\b\d{1,3}(?:st|nd|rd|th)\b/i.test(text) ? 'birthday' : '');
  if (!brief.budget) brief.budget = match(text, /((?:under|up to|around|about|between|budget(?: is| of)?)\s*(?:£|\$|€)?\s*\d+(?:\s*(?:-|to)\s*(?:£|\$|€)?\d+)?)/i) || match(text, /((?:£|\$|€)\s*\d+(?:\s*(?:-|to)\s*(?:£|\$|€)?\d+)?)/i);
  if (!brief.timing) brief.timing = match(text, /((?:by|before|on|this|next)\s+(?:today|tomorrow|weekend|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?:st|nd|rd|th)?(?:\s+[a-z]+)?))/i);

  const likes = [...text.matchAll(/(?:loves?|likes?|enjoys?|into|interested in|passionate about)\s+([^.!?;]{2,100})/gi)].map(item => item[1].split(/\s+(?:but|and (?:my|the) budget|with a budget|under [£$€]?\d+)/i)[0]);
  brief.preferences = list([...brief.preferences, ...likes], 8, 100);
  const limits = [...text.matchAll(/(?:doesn['’]t like|dislikes?|avoid|allergic to|already (?:has|owns)|no\s+)\s*([^.!?;]{2,100})/gi)].map(item => item[1]);
  brief.constraints = list([...brief.constraints, ...limits], 8, 100);

  const score = [brief.recipient, brief.occasion, brief.budget, brief.preferences.length || brief.constraints.length].filter(Boolean).length;
  const missing = [!brief.recipient && 'who the gift is for', !brief.occasion && 'the occasion', !brief.budget && 'a comfortable budget', !(brief.preferences.length || brief.constraints.length) && 'one interest, dislike or useful clue'].filter(Boolean);
  return { brief, score, missing, readyToReveal: score >= 4 && Number(turnNumber) >= 2, nextQuestion: questionFor(missing[0]) };
}

function questionFor(item) {
  const questions = {
    'who the gift is for': 'Who are we celebrating, and what is your relationship to them?',
    'the occasion': 'What is the moment—birthday, thank-you, anniversary, or something else?',
    'a comfortable budget': 'What budget would feel comfortable? A range is perfect.',
    'one interest, dislike or useful clue': 'What feels most like them—and is there anything they already own or would rather avoid?'
  };
  return questions[item] || 'One last check: is there anything practical I should respect, such as timing, delivery, allergies or avoiding clutter?';
}

function clean(value, max) { return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function match(text, pattern) { const value = text.match(pattern)?.[1]; return value ? clean(value, 120) : ''; }
function list(values, maxItems, maxLength) { return [...new Set((Array.isArray(values) ? values : []).map(value => clean(value, maxLength)).filter(Boolean))].slice(0, maxItems); }

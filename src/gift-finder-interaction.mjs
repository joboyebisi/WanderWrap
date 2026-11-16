export const WANDERWRAP_PERSONA = Object.freeze({
  name: 'WanderWrap',
  role: 'personal gift shopper',
  traits: Object.freeze(['warm', 'observant', 'practical', 'lightly playful']),
  boundaries: Object.freeze(['one question per turn', 'never invent recipient facts', 'never imply a purchase'])
});

export function buildGiftFinderInteraction(briefState, providerSuggestions = [], turnNumber = 1, now = new Date()) {
  const contextual = templatesFor(briefState.missing[0], briefState.brief, now);
  const provider = Array.isArray(providerSuggestions)
    ? providerSuggestions.filter(message => typeof message === 'string').map((message, index) => quickReply(`provider-${index}`, '↗', message, message)).filter(item => item.message.length <= 160)
    : [];
  const acknowledgements = ['Got it—I’m carrying that forward.', 'That helps. I’ve added it to the brief.', 'Lovely—that gives the search more shape.'];
  return {
    persona: WANDERWRAP_PERSONA,
    acknowledgement: acknowledgements[Math.max(0, Number(turnNumber) - 1) % acknowledgements.length],
    quickReplies: uniqueReplies([...contextual, ...provider]).slice(0, 4)
  };
}

function templatesFor(field, brief, now) {
  const recipient = safeSubject(brief.recipient);
  const templates = {
    'who the gift is for': [
      quickReply('recipient-partner', '♥', 'My partner', 'It is for my partner.'),
      quickReply('recipient-family', '⌂', 'A family member', 'It is for a family member.'),
      quickReply('recipient-friend', '☺', 'A friend', 'It is for a friend.'),
      quickReply('recipient-colleague', '◇', 'A colleague', 'It is for a colleague.')
    ],
    'the occasion': seasonalOccasions(recipient, now),
    'a comfortable budget': [
      quickReply('budget-30', '£', 'Under £30', 'My budget is under £30.'),
      quickReply('budget-60', '£', 'Around £60', 'My budget is around £60.'),
      quickReply('budget-100', '£', 'Up to £100', 'My budget is up to £100.'),
      quickReply('budget-flexible', '↔', 'Flexible', 'My budget is flexible; show me good value.')
    ],
    'when it needs to be ready': [
      quickReply('timing-weekend', '◷', 'This weekend', 'I need it by this weekend.'),
      quickReply('timing-week', '□', 'Next week', 'I need it by next week.'),
      quickReply('timing-month', '▦', 'This month', 'I need it by the end of this month.'),
      quickReply('timing-open', '∞', 'No fixed date', 'There is no fixed date; there is no rush.')
    ],
    'one interest, dislike or useful clue': [
      quickReply('clue-personal', '✦', 'Something personal', `${subject(brief.recipient)} would value something personal or meaningful.`),
      quickReply('clue-experience', '◎', 'An experience', `${subject(brief.recipient)} would enjoy an experience.`),
      quickReply('clue-practical', '✓', 'Useful, not clutter', `${subject(brief.recipient)} prefers something useful and not more clutter.`),
      quickReply('clue-surprise', '?', 'Help me explore', `I am not sure yet; help me explore a few directions for ${subject(brief.recipient).toLowerCase()}.`)
    ]
  };
  return templates[field] || [];
}

function quickReply(id, icon, label, message) { return { id, icon, label, message }; }
function uniqueReplies(items) { return [...new Map(items.map(item => [item.message.toLowerCase(), item])).values()]; }
function subject(value) { const clean = String(value || '').trim(); return clean ? clean.replace(/^my\s+/i, 'My ') : 'They'; }
function safeSubject(value) { const clean = String(value || '').trim(); return clean ? ` for ${clean}` : ''; }

function seasonalOccasions(recipient, now) {
  const month = now instanceof Date && !Number.isNaN(now.valueOf()) ? now.getUTCMonth() : -1;
  if (month === 10 || month === 11) return [
    quickReply('occasion-christmas', '🎄', 'Christmas', `It is a Christmas gift${recipient}.`),
    quickReply('occasion-thanksgiving', '🍂', 'Thanksgiving', `It is a Thanksgiving gift${recipient}.`),
    quickReply('occasion-birthday', '🎂', 'Birthday', `It is a birthday gift${recipient}.`),
    quickReply('occasion-other', '✦', 'Something else', `It is for another occasion${recipient}.`)
  ];
  return [
    quickReply('occasion-birthday', '🎂', 'Birthday', `It is a birthday gift${recipient}.`),
    quickReply('occasion-thanks', '✦', 'A thank-you', `It is a thank-you gift${recipient}.`),
    quickReply('occasion-milestone', '★', 'A milestone', `It is for a milestone${recipient}.`),
    quickReply('occasion-just-because', '☀', 'Just because', `It is a just-because gift${recipient}.`)
  ];
}

const protocolVersion = '2025-11-25';
const $ = selector => document.querySelector(selector);
const conversation = $('#conversation');
const trace = $('#trace');
const stages = [...document.querySelectorAll('.journeyRail button')];
const agentRail = $('#agentRail');
const state = { candidates: [], recommendations: [], calls: [], budget: 60 };

$('#surface').addEventListener('change', event => {
  document.body.classList.toggle('deviceVoice', event.target.value === 'voice');
});

$('#loadExample').addEventListener('click', () => {
  $('#clues').value = [
    'X: “I love pottery studios—making something imperfect by hand is the best kind of reset.”',
    'Instagram caption: “I enjoy tea, a good novel, and nowhere to be on slow Sunday mornings.”',
    'Remembered quote: “I like houseplants, especially the tiny ones that fit on the kitchen shelf.”'
  ].join('\n');
  addMessage('alexa', 'WanderWrap', 'I loaded three example excerpts. Review them, tick the permission box, then ask the privacy agent to find safe clues.');
});

$('#analyseClues').addEventListener('click', analyseClues);
$('#backToClues').addEventListener('click', () => showStage('clues'));
$('#confirmClues').addEventListener('click', confirmAndRecommend);

$('#promptForm').addEventListener('submit', event => {
  event.preventDefault();
  const value = $('#prompt').value.trim();
  if (!value) return;
  addMessage('user', 'You', value);
  const budget = value.match(/(?:GBP|£|under)\s*(\d+)/i)?.[1];
  if (budget) state.budget = Number(budget);
  addMessage('alexa', 'WanderWrap', `Got it. I will keep the budget at GBP ${state.budget}, use only confirmed clues, and stop before any external purchase.`);
});

async function analyseClues() {
  const raw = $('#clues').value.split(/\n+/).map(value => value.trim()).filter(Boolean);
  if (!$('#permission').checked) return showInlineError('Please confirm you are allowed to use these selected excerpts.');
  if (!raw.length) return showInlineError('Paste at least one selected excerpt first.');
  setAgent('privacy', 'running', 'Checking permission and sensitive topics');
  addMessage('user', 'You', `Use these ${raw.length} selected excerpts only for this private gift search.`);
  addMessage('alexa', 'WanderWrap', 'I will process them transiently, discard sensitive content, and return candidates for your confirmation.');
  try {
    await mcp('initialize', { protocolVersion, capabilities: {}, clientInfo: { name: 'wanderwrap-interactive-demo', version: '2.0.0' } }, 'MCP gateway connected');
    await mcp('tools/list', undefined, 'Least-privilege tools discovered');
    setAgent('privacy', 'done', 'Permission confirmed · raw text transient');
    setAgent('preference', 'running', 'Extracting explicit, non-sensitive interests');
    const analysed = await mcp('tools/call', {
      name: 'analyse_gift_clues',
      arguments: { allowedToUse: true, snippets: raw.slice(0, 8).map((text, index) => ({ id: `selected-${index + 1}`, text, source: 'manual_export' })) }
    }, 'Preference candidates proposed');
    state.candidates = analysed.result.structuredContent.candidates || [];
    renderCandidates(state.candidates, analysed.result.structuredContent.rejected || []);
    setAgent('preference', 'done', `${state.candidates.length} candidates · confirmation required`);
    showStage('consent');
    addMessage('alexa', 'WanderWrap', analysed.result.structuredContent.voiceSummary);
  } catch (error) {
    setAgent('privacy', 'blocked', 'Stopped safely');
    setAgent('preference', 'blocked', 'No clue data retained');
    showInlineError(error.message);
  }
}

async function confirmAndRecommend() {
  const selected = [...document.querySelectorAll('[name="candidate"]:checked')]
    .map(input => state.candidates.find(candidate => candidate.id === input.value)).filter(Boolean);
  if (!selected.length) return showInlineError('Confirm at least one clue, or go back and add a better excerpt.');
  showStage('ideas');
  setAgent('recommendation', 'running', 'Ranking against confirmed evidence');
  addMessage('user', 'You', `Use ${selected.map(item => item.value).join(', ')}. Those clues match what I know about my partner.`);
  try {
    const response = await mcp('tools/call', {
      name: 'recommend_gifts',
      arguments: { recipient: { name: 'my partner', budget: state.budget, signals: selected.map(item => ({ id: item.id, value: item.value, source: 'stated', confirmed: true, confidence: item.confidence })) } }
    }, 'Recommendation agent returned an evidence ledger');
    state.recommendations = response.result.structuredContent.recommendations || [];
    renderGifts(state.recommendations);
    setAgent('recommendation', 'done', `${state.recommendations.length} explainable ideas`);
    setAgent('catalogue', 'running', 'Waiting for you to select an idea');
    addMessage('alexa', 'WanderWrap', `${response.result.structuredContent.voiceSummary} Choose a card and I will check the safest fulfilment route.`);
  } catch (error) {
    setAgent('recommendation', 'blocked', 'Stopped safely');
    showInlineError(error.message);
  }
}

function renderCandidates(candidates, rejected) {
  $('#candidateList').innerHTML = candidates.length ? candidates.map(candidate => `
    <label class="candidate">
      <input type="checkbox" name="candidate" value="${escapeText(candidate.id)}" checked>
      <span><b>${escapeText(candidate.value)}</b><small>Explicit clue · selected text · needs your confirmation</small></span>
      <span class="confidence">${Math.round(candidate.confidence * 100)}% signal</span>
    </label>`).join('') : '<p>No safe explicit interests were found. Try wording that clearly says “I love…” or “I enjoy…”.</p>';
  $('#privacyNotice').textContent = rejected.length
    ? `${rejected.length} excerpt${rejected.length === 1 ? ' was' : 's were'} discarded by the privacy guard and will not influence ranking.`
    : 'Privacy guard passed the selected excerpts. Raw text is not returned in the result or shown to downstream agents.';
}

function renderGifts(gifts) {
  $('#giftGrid').innerHTML = gifts.map((gift, index) => {
    const evidence = (gift.evidence || []).map(item => item.value).join(' + ') || 'budget and occasion';
    return `<button class="giftCard" data-gift="${escapeText(gift.id)}"><span class="giftRank">0${index + 1}</span><span><h3>${escapeText(gift.name)}</h3><p>${escapeText(gift.story)} · Why: ${escapeText(evidence)}</p></span><strong>GBP ${gift.price}</strong></button>`;
  }).join('');
  document.querySelectorAll('.giftCard').forEach(button => button.addEventListener('click', () => selectGift(button.dataset.gift, button)));
}

async function selectGift(id, button) {
  const gift = state.recommendations.find(item => item.id === id);
  if (!gift) return;
  document.querySelectorAll('.giftCard').forEach(card => card.classList.toggle('selected', card === button));
  setAgent('catalogue', 'done', 'Demo offer evidence attached');
  setAgent('routing', 'running', 'Checking UK marketplace eligibility');
  addMessage('user', 'You', `I like ${gift.name}. Can it continue through Amazon?`);
  try {
    const route = await mcp('tools/call', {
      name: 'route_gift',
      arguments: { giftKind: 'physical', senderCountry: 'GB', destinationCountry: 'GB', amazonOffer: { available: true, shipsToDestination: true, detailPageUrl: `https://www.amazon.co.uk/s?k=${encodeURIComponent(gift.name)}` } }
    }, 'Fulfilment agent selected the Amazon marketplace handoff');
    const decision = route.result.structuredContent;
    setAgent('routing', 'done', 'Eligible fixture route · no checkout');
    setAgent('approval', 'done', 'External action waits for customer click');
    $('#selectedGift').textContent = gift.name;
    $('#selectedReason').textContent = `${gift.story} Selected from confirmed evidence; provider facts remain a demo fixture.`;
    $('#selectedPrice').textContent = `GBP ${gift.price}`;
    $('#amazonHandoff').href = decision.url || `https://www.amazon.co.uk/s?k=${encodeURIComponent(gift.name)}`;
    $('#handoffStage').hidden = false;
    setJourney('handoff');
    addMessage('alexa', 'WanderWrap', `${decision.voiceSummary} Review the handoff card—nothing happens unless you choose Continue to Amazon.`);
    $('#handoffStage').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    setAgent('routing', 'blocked', 'No provider route claimed');
    showInlineError(error.message);
  }
}

function showStage(name) {
  $('#clueStage').hidden = name !== 'clues';
  $('#confirmStage').hidden = name !== 'consent';
  $('#resultStage').hidden = name !== 'ideas';
  setJourney(name);
}

function setJourney(name) {
  const order = ['clues', 'consent', 'ideas', 'handoff'];
  const activeIndex = order.indexOf(name);
  stages.forEach((button, index) => {
    button.classList.toggle('active', index === activeIndex);
    button.classList.toggle('done', index < activeIndex);
  });
}

function setAgent(name, status, detail) {
  const card = agentRail.querySelector(`[data-agent="${name}"]`);
  if (!card) return;
  card.classList.remove('running', 'done', 'blocked');
  card.classList.add(status);
  card.querySelector('small').textContent = detail;
}

async function mcp(method, params, summary) {
  const started = performance.now();
  const response = await fetch('/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': protocolVersion },
    body: JSON.stringify({ jsonrpc: '2.0', id: crypto.randomUUID(), method, ...(params ? { params } : {}) })
  });
  const payload = await response.json();
  if (!response.ok || payload.error || payload.result?.isError) throw new Error(payload.error?.message || payload.result?.content?.[0]?.text || `HTTP ${response.status}`);
  state.calls.push({ step: method === 'tools/call' ? params.name : method, status: 'completed', durationMs: Math.round(performance.now() - started), summary });
  trace.textContent = ['Raw pasted text is intentionally omitted from this trace.', '', ...state.calls.map((call, index) => `${index + 1}. ${call.step}\n   ${call.status} · ${call.durationMs} ms · ${call.summary}`)].join('\n');
  return payload;
}

function showInlineError(message) {
  addMessage('alexa', 'WanderWrap stopped safely', message);
}

function addMessage(kind, label, text) {
  const article = document.createElement('article');
  article.className = `message ${kind}`;
  article.innerHTML = kind === 'user'
    ? `<div><small>${escapeText(label)}</small><p>${escapeText(text)}</p></div>`
    : `<div class="avatar">W</div><div><small>${escapeText(label)}</small><p>${escapeText(text)}</p></div>`;
  conversation.append(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

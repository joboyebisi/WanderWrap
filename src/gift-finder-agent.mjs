import { createHash, randomUUID } from 'node:crypto';
import { AgentOrchestrator, AgentRegistry, createAgentProposal } from './agent-orchestrator.mjs';
import { channel3Capability, runChannel3GiftFinderTurn, searchChannel3Gifts } from './channel3.mjs';
import { advanceGiftBrief, normalizeGiftBrief } from './gift-brief.mjs';
import { buildGiftFinderInteraction } from './gift-finder-interaction.mjs';

export const GIFT_FINDER_TENANT = 'public-gift-finder';
export const GIFT_FINDER_AGENT = 'gift-finder-specialist';
export const GIFT_FINDER_ACTION = 'continue-gift-conversation';

export function createGiftFinderHarness({ conversationProvider = runChannel3GiftFinderTurn, searchProvider = searchChannel3Gifts, timeoutMs = 30_000 } = {}) {
  const registry = new AgentRegistry();
  registry.register({
    id: GIFT_FINDER_AGENT,
    tenantId: GIFT_FINDER_TENANT,
    actions: { [GIFT_FINDER_ACTION]: { consentRequired: false, approvalRequired: false } },
    timeoutMs,
    maxRetries: 0,
    handler: async request => {
      const briefState = advanceGiftBrief(request.payload.brief, request.payload.message, request.payload.turnNumber);
      if (request.payload.intent === 'search') {
        if (briefState.score < 1) throw new TypeError('Share one useful detail before WanderWrap searches.');
        const search = await searchProvider({
          query: giftSearchQuery(briefState.brief),
          budget: numericBudget(briefState.brief.budget),
          userId: attributionId(request.actorId),
          country: 'GB',
          limit: 10
        });
        const ready = Boolean(search.products?.length);
        return createAgentProposal(request, {
          proposedAction: ready ? 'prepare-recommendation-reveal' : 'report-empty-search',
          arguments: {
            ...search,
            conversationId: request.payload.conversationId || `search_${request.requestId}`,
            reply: ready ? 'I’ve searched with the Gift Brief we have and prepared a shortlist for you. ✨' : 'I couldn’t find a useful match with this brief yet. Add one more detail and I’ll try again.',
            suggestions: [],
            brief: briefState.brief,
            briefProgress: briefState.score,
            missingBriefFields: briefState.missing,
            stage: ready ? 'recommendations_ready' : 'building_gift_brief',
            revealReady: ready,
            evaluation: evaluationFor({ before: request.payload.brief, briefState, turnNumber: request.payload.turnNumber, intent: 'search', productCount: search.products?.length || 0 })
          },
          evidence: ['giver-supplied-conversation', 'shopper-triggered-search'],
          provider: { id: search.provider || 'channel3', kind: 'catalogue-search' },
          capability: 'gift-finder.search'
        });
      }
      const turn = await conversationProvider({
        message: request.payload.message,
        conversationId: request.payload.conversationId || undefined,
        userId: attributionId(request.actorId)
      });
      const ready = briefState.readyToReveal && Boolean(turn.products?.length);
      const interaction = buildGiftFinderInteraction(briefState, turn.suggestions, request.payload.turnNumber);
      return createAgentProposal(request, {
        proposedAction: ready ? 'prepare-recommendation-reveal' : 'ask-gift-question',
        arguments: {
          ...turn,
          reply: ready ? 'Lovely — I have enough to make this feel considered. I’ve prepared a shortlist and kept the reasoning tied to your Gift Brief. ✨' : `${interaction.acknowledgement} ${briefState.nextQuestion}`,
          suggestions: ready ? [] : interaction.quickReplies,
          interaction: { persona: interaction.persona, acknowledgement: interaction.acknowledgement },
          brief: briefState.brief,
          briefProgress: briefState.score,
          missingBriefFields: briefState.missing,
          stage: ready ? 'recommendations_ready' : 'building_gift_brief',
          revealReady: ready,
          evaluation: evaluationFor({ before: request.payload.brief, briefState, turnNumber: request.payload.turnNumber, intent: 'continue', productCount: turn.products?.length || 0 })
        },
        evidence: ['giver-supplied-conversation'],
        provider: { id: turn.provider || 'channel3-conversations', kind: 'catalogue-conversation' },
        capability: 'gift-finder.conversation'
      });
    }
  });
  const orchestrator = new AgentOrchestrator({ registry });
  return Object.freeze({
    async turn({ sessionId, message, conversationId, turnNumber, brief, intent = 'continue', requestId = randomUUID() } = {}) {
      const input = validateTurn({ sessionId, message, conversationId, turnNumber, brief, intent });
      const result = await orchestrator.execute({
        requestId,
        correlationId: input.conversationId || requestId,
        idempotencyKey: `${input.sessionId}:${input.turnNumber}:${requestId}`,
        tenantId: GIFT_FINDER_TENANT,
        actorId: input.sessionId,
        agentId: GIFT_FINDER_AGENT,
        action: GIFT_FINDER_ACTION,
        payload: input,
        context: { channel: 'public-web', sideEffectsAllowed: false }
      });
      if (result.status !== 'completed') {
        const error = new Error(result.reason === 'execution-outcome-unknown' ? 'The gift agent took too long. Please try that turn again.' : 'The gift agent could not complete that turn.');
        error.code = result.reason;
        throw error;
      }
      return result.output.arguments;
    },
    getAuditLog: () => orchestrator.getAuditLog()
  });
}

export function giftFinderCapability(env = process.env) {
  const channel3 = channel3Capability(env);
  return channel3.status === 'available'
    ? { status: 'available', provider: 'channel3-conversations' }
    : { status: 'configuration_required', reason: channel3.reason };
}

function validateTurn({ sessionId, message, conversationId, turnNumber, brief, intent }) {
  const safeSession = String(sessionId || '').trim();
  const safeMessage = String(message || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  const safeIntent = intent === 'search' ? 'search' : 'continue';
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(safeSession)) throw new TypeError('A valid Gift Finder session is required');
  if ((safeIntent === 'continue' && !safeMessage) || safeMessage.length > 1_600) throw new TypeError('Message must be between 1 and 1,600 characters');
  if (conversationId && !/^[a-zA-Z0-9_-]{3,160}$/.test(String(conversationId))) throw new TypeError('Conversation reference is invalid');
  const safeTurn = Number(turnNumber);
  if (!Number.isInteger(safeTurn) || safeTurn < 1 || safeTurn > 16) throw new TypeError('Gift Finder supports up to 16 turns per session');
  return { sessionId: safeSession, message: safeMessage, conversationId: conversationId ? String(conversationId) : null, turnNumber: safeTurn, brief: normalizeGiftBrief(brief), intent: safeIntent };
}

function giftSearchQuery(brief) {
  return [
    brief.recipient && `Gift for ${brief.recipient}`,
    brief.occasion && `occasion: ${brief.occasion}`,
    brief.preferences.length && `interests and clues: ${brief.preferences.join(', ')}`,
    brief.constraints.length && `avoid or respect: ${brief.constraints.join(', ')}`,
    brief.timing && `needed ${brief.timing}`,
    brief.budget && `budget ${brief.budget}`
  ].filter(Boolean).join('. ').slice(0, 1_200);
}

function numericBudget(value) {
  const numbers = String(value || '').match(/\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
  return numbers.length ? Math.max(...numbers) : undefined;
}

function evaluationFor({ before, briefState, turnNumber, intent, productCount }) {
  const previous = normalizeGiftBrief(before);
  const previousScore = [previous.recipient, previous.occasion, previous.budget, previous.preferences.length || previous.constraints.length].filter(Boolean).length;
  const progressDelta = briefState.score - previousScore;
  return {
    intent,
    turnNumber,
    briefProgress: briefState.score,
    progressDelta,
    missingFieldCount: briefState.missing.length,
    productCount,
    loopRisk: intent === 'continue' && turnNumber >= 3 && progressDelta === 0 && briefState.missing.length > 0
  };
}

function attributionId(sessionId) {
  return `guest_${createHash('sha256').update(sessionId).digest('hex').slice(0, 24)}`;
}

import { createHash, randomUUID } from 'node:crypto';
import { AgentOrchestrator, AgentRegistry, createAgentProposal } from './agent-orchestrator.mjs';
import { channel3Capability, runChannel3GiftFinderTurn } from './channel3.mjs';

export const GIFT_FINDER_TENANT = 'public-gift-finder';
export const GIFT_FINDER_AGENT = 'gift-finder-specialist';
export const GIFT_FINDER_ACTION = 'continue-gift-conversation';

export function createGiftFinderHarness({ conversationProvider = runChannel3GiftFinderTurn, timeoutMs = 30_000 } = {}) {
  const registry = new AgentRegistry();
  registry.register({
    id: GIFT_FINDER_AGENT,
    tenantId: GIFT_FINDER_TENANT,
    actions: { [GIFT_FINDER_ACTION]: { consentRequired: false, approvalRequired: false } },
    timeoutMs,
    maxRetries: 0,
    handler: async request => {
      const turn = await conversationProvider({
        message: request.payload.message,
        conversationId: request.payload.conversationId || undefined,
        userId: attributionId(request.actorId)
      });
      return createAgentProposal(request, {
        proposedAction: turn.products?.length ? 'present-current-gifts' : 'ask-gift-question',
        arguments: {
          ...turn,
          stage: turn.products?.length ? 'recommendations_ready' : 'building_gift_brief',
          canCaptureLead: Boolean(turn.products?.length)
        },
        evidence: ['giver-supplied-conversation'],
        provider: { id: turn.provider || 'channel3-conversations', kind: 'catalogue-conversation' },
        capability: 'gift-finder.conversation'
      });
    }
  });
  const orchestrator = new AgentOrchestrator({ registry });
  return Object.freeze({
    async turn({ sessionId, message, conversationId, turnNumber, requestId = randomUUID() } = {}) {
      const input = validateTurn({ sessionId, message, conversationId, turnNumber });
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

function validateTurn({ sessionId, message, conversationId, turnNumber }) {
  const safeSession = String(sessionId || '').trim();
  const safeMessage = String(message || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(safeSession)) throw new TypeError('A valid Gift Finder session is required');
  if (!safeMessage || safeMessage.length > 1_600) throw new TypeError('Message must be between 1 and 1,600 characters');
  if (conversationId && !/^[a-zA-Z0-9_-]{3,160}$/.test(String(conversationId))) throw new TypeError('Conversation reference is invalid');
  const safeTurn = Number(turnNumber);
  if (!Number.isInteger(safeTurn) || safeTurn < 1 || safeTurn > 16) throw new TypeError('Gift Finder supports up to 16 turns per session');
  return { sessionId: safeSession, message: safeMessage, conversationId: conversationId ? String(conversationId) : null, turnNumber: safeTurn };
}

function attributionId(sessionId) {
  return `guest_${createHash('sha256').update(sessionId).digest('hex').slice(0, 24)}`;
}

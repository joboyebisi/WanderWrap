export const AUTH_FAILURE_REASONS = Object.freeze(['invalid', 'cancelled', 'account_exists', 'provider', 'exchange', 'unavailable']);

export function classifyOAuthResponse({ code, state, expectedState, verifier, error, errorDescription } = {}) {
  if (!state || !expectedState || state !== expectedState || !verifier) return { kind: 'failure', reason: 'invalid' };
  if (error) {
    if (String(errorDescription || '').includes('WANDERWRAP_ACCOUNT_EXISTS_USE_EMAIL')) return { kind: 'failure', reason: 'account_exists' };
    if (error === 'access_denied') return { kind: 'failure', reason: 'cancelled' };
    return { kind: 'failure', reason: 'provider' };
  }
  if (!code) return { kind: 'failure', reason: 'invalid' };
  return { kind: 'code' };
}

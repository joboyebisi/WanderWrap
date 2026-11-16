import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyOAuthResponse } from '../src/auth-callback.mjs';

const valid = { state: 'state-1', expectedState: 'state-1', verifier: 'verifier-1' };

test('OAuth callback distinguishes success, cancellation and account collision', () => {
  assert.deepEqual(classifyOAuthResponse({ ...valid, code: 'code-1' }), { kind: 'code' });
  assert.deepEqual(classifyOAuthResponse({ ...valid, error: 'access_denied' }), { kind: 'failure', reason: 'cancelled' });
  assert.deepEqual(classifyOAuthResponse({ ...valid, error: 'invalid_request', errorDescription: 'PreSignUp failed with error WANDERWRAP_ACCOUNT_EXISTS_USE_EMAIL.' }), { kind: 'failure', reason: 'account_exists' });
  assert.deepEqual(classifyOAuthResponse({ ...valid, error: 'server_error' }), { kind: 'failure', reason: 'provider' });
});

test('OAuth callback validates state before accepting codes or provider errors', () => {
  assert.deepEqual(classifyOAuthResponse({ ...valid, state: 'wrong', code: 'code-1' }), { kind: 'failure', reason: 'invalid' });
  assert.deepEqual(classifyOAuthResponse({ ...valid, state: 'wrong', error: 'access_denied' }), { kind: 'failure', reason: 'invalid' });
  assert.deepEqual(classifyOAuthResponse({ ...valid, verifier: '', code: 'code-1' }), { kind: 'failure', reason: 'invalid' });
});

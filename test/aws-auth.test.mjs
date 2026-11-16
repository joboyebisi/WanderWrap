import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAccessTokenClaims } from '../src/aws-handler.mjs';

const audience = 'https://api.wanderwrap.test/mcp';

test('AWS access-token claims are bound to the MCP audience and required scope', () => {
  const scopes = validateAccessTokenClaims({ aud: audience, scope: `openid ${audience}/gifts.read ${audience}/gifts.write` }, {
    audience,
    requiredScope: `${audience}/gifts.write`
  });
  assert.equal(scopes.has(`${audience}/gifts.read`), true);
});

test('AWS access-token claims reject the wrong resource audience', () => {
  assert.throws(() => validateAccessTokenClaims({ aud: 'https://evil.example/mcp', scope: `${audience}/gifts.read` }, {
    audience,
    requiredScope: `${audience}/gifts.read`
  }), /audience/);
});

test('AWS access-token claims reject missing write scope', () => {
  assert.throws(() => validateAccessTokenClaims({ aud: audience, scope: `${audience}/gifts.read` }, {
    audience,
    requiredScope: `${audience}/gifts.write`
  }), /Missing required scope/);
});

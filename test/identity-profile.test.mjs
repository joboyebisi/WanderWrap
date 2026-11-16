import test from 'node:test';
import assert from 'node:assert/strict';
import { identityDisplayName, isProviderIdentifier } from '../src/aws-handler.mjs';

test('Google profile name is preferred over a provider machine username', () => {
  assert.equal(identityDisplayName({ name: 'Job Oyebisi', email: 'joboyebisi@gmail.com' }, { username: 'Google_105189121046441812819' }), 'Job Oyebisi');
});

test('given and family names form the identity display name', () => {
  assert.equal(identityDisplayName({ given_name: 'Ada', family_name: 'Lovelace' }, {}), 'Ada Lovelace');
});

test('email local part is used before a provider machine username', () => {
  assert.equal(identityDisplayName({ email: 'giver@example.com' }, { username: 'google_123456' }), 'giver');
  assert.equal(isProviderIdentifier('google_123456'), true);
  assert.equal(isProviderIdentifier('thoughtful-giver'), false);
});

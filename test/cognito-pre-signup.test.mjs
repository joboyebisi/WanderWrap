import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCOUNT_EXISTS_CODE, guardGoogleAccountCollision } from '../src/cognito-pre-signup.mjs';

function googleEvent(overrides = {}) {
  return {
    triggerSource: 'PreSignUp_ExternalProvider', userPoolId: 'eu-west-2_example', userName: 'Google_123',
    request: { userAttributes: { email: ' Person@Example.com ', email_verified: 'true' } },
    ...overrides
  };
}

test('Google pre-sign-up allows a verified new identity without auto-linking', async () => {
  const calls = [];
  const event = googleEvent();
  const result = await guardGoogleAccountCollision(event, { listUsers: async input => { calls.push(input); return { Users: [] }; } });
  assert.equal(result, event);
  assert.equal(calls[0].Filter, 'email = "person@example.com"');
});

test('Google pre-sign-up blocks an existing email and never links it', async () => {
  let request;
  await assert.rejects(
    guardGoogleAccountCollision(googleEvent(), { listUsers: async input => { request = input; return { Users: [{ Username: 'native-user' }] }; } }),
    new RegExp(ACCOUNT_EXISTS_CODE)
  );
  assert.equal(Object.hasOwn(request, 'SourceUser'), false);
});

test('Google pre-sign-up rejects unverified provider email and ignores native sign-up', async () => {
  await assert.rejects(guardGoogleAccountCollision(googleEvent({ request: { userAttributes: { email: 'person@example.com', email_verified: 'false' } } }), { listUsers: async () => ({ Users: [] }) }), /EMAIL_NOT_VERIFIED/);
  const native = { triggerSource: 'PreSignUp_SignUp', userName: 'person@example.com', request: { userAttributes: { email: 'person@example.com' } } };
  assert.equal(await guardGoogleAccountCollision(native), native);
});

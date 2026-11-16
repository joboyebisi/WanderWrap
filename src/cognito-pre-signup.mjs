import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});
export const ACCOUNT_EXISTS_CODE = 'WANDERWRAP_ACCOUNT_EXISTS_USE_EMAIL';

export async function handler(event) {
  return guardGoogleAccountCollision(event, {
    listUsers: input => client.send(new ListUsersCommand(input))
  });
}

export async function guardGoogleAccountCollision(event, { listUsers } = {}) {
  if (event?.triggerSource !== 'PreSignUp_ExternalProvider' || !String(event?.userName || '').startsWith('Google_')) return event;
  const email = normalizeEmail(event?.request?.userAttributes?.email);
  const verified = String(event?.request?.userAttributes?.email_verified).toLowerCase() === 'true';
  if (!email || !verified) {
    console.warn(JSON.stringify({ event: 'google_signup_rejected', reason: verified ? 'invalid_email' : 'unverified_email' }));
    throw new Error('WANDERWRAP_GOOGLE_EMAIL_NOT_VERIFIED');
  }
  if (typeof listUsers !== 'function') throw new TypeError('A Cognito user lookup is required');
  const result = await listUsers({ UserPoolId: event.userPoolId, Filter: `email = "${escapeFilter(email)}"`, Limit: 2 });
  const existing = (result?.Users || []).some(user => user?.Username !== event.userName);
  if (existing) {
    console.info(JSON.stringify({ event: 'google_signup_collision_blocked', provider: 'Google' }));
    throw new Error(ACCOUNT_EXISTS_CODE);
  }
  console.info(JSON.stringify({ event: 'google_signup_allowed', provider: 'Google' }));
  return event;
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function escapeFilter(value) { return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"'); }

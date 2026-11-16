import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const secrets = new SecretsManagerClient({});
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
let cachedApiKey;

export async function handler(event) {
  if (process.env.LOOPS_MARKETING_ENABLED !== 'true') return { batchItemFailures: [] };
  const failures = [];
  for (const record of event.Records || []) {
    try { await deliver(JSON.parse(record.body)); }
    catch (error) { console.error(JSON.stringify({ type: 'marketing_delivery_failed', message: error.message, messageId: record.messageId })); failures.push({ itemIdentifier: record.messageId }); }
  }
  return { batchItemFailures: failures };
}

async function deliver(message) {
  if (!message?.userId || !allowedEvent(message.eventName)) throw new Error('Invalid marketing event');
  const result = await db.send(new GetCommand({ TableName: process.env.TABLE_NAME, Key: { PK: `USER#${message.userId}`, SK: 'MARKETING#PREFERENCES' } }));
  const preference = result.Item;
  if (!preference?.email) return;
  const profileResult = await db.send(new GetCommand({ TableName: process.env.TABLE_NAME, Key: { PK: `USER#${message.userId}`, SK: 'PROFILE' } }));
  const profile = profileResult.Item || {};
  const anyConsent = preference.productUpdates === true || preference.seasonalIdeas === true || preference.fullServiceWaitlist === true;
  if (message.eventName !== 'contact.preferences_updated' && !hasConsent(preference, message.eventName)) return;
  const apiKey = await getApiKey();
  const name = contactName(profile.displayName);
  const contactProperties = {
    productUpdates: Boolean(preference.productUpdates),
    seasonalIdeas: Boolean(preference.seasonalIdeas),
    fullServiceWaitlist: Boolean(preference.fullServiceWaitlist),
    country: profile.homeCountry || message.properties?.country || 'GB',
    currency: profile.currency || message.properties?.currency || 'GBP',
    lifecycleStage: lifecycleStage(message.eventName),
    lastActiveAt: message.occurredAt,
    ...safeProperties(message.properties)
  };
  const contact = { email: preference.email, userId: message.userId, ...name, ...contactProperties };
  if (message.eventName === 'contact.preferences_updated') contact.subscribed = anyConsent;
  await loops('PUT', '/api/v1/contacts/update', apiKey, contact);
  if (anyConsent) await loops('POST', '/api/v1/events/send', apiKey, { email: preference.email, userId: message.userId, eventName: message.eventName, eventProperties: safeProperties(message.properties) });
}

function hasConsent(preference, eventName) { if (eventName === 'full_service.waitlist_joined') return preference.fullServiceWaitlist === true; if (eventName === 'gift_brief.saved' || eventName === 'gift_item.saved') return preference.productUpdates === true; return preference.productUpdates === true || preference.seasonalIdeas === true || preference.fullServiceWaitlist === true; }
function allowedEvent(value) { return ['contact.preferences_updated', 'gift_brief.saved', 'gift_item.saved', 'full_service.waitlist_joined'].includes(value); }
function safeProperties(value = {}) { const output = {}; for (const key of ['source', 'country', 'currency']) if (typeof value[key] === 'string') output[key] = value[key].slice(0, 40); return output; }
export function lifecycleStage(eventName) { return eventName === 'gift_item.saved' ? 'saved-item' : eventName === 'gift_brief.saved' ? 'saved-brief' : eventName === 'full_service.waitlist_joined' ? 'waitlist' : 'subscribed'; }
export function contactName(value = '') { const parts = String(value).trim().split(/\s+/).filter(Boolean); return parts.length ? { firstName: parts[0].slice(0, 80), ...(parts.length > 1 ? { lastName: parts.slice(1).join(' ').slice(0, 80) } : {}) } : {}; }
async function loops(method, path, apiKey, body) { const response = await fetch(`https://app.loops.so${path}`, { method, headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) }); if (!response.ok) throw new Error(`Loops returned ${response.status}`); }
async function getApiKey() { if (cachedApiKey) return cachedApiKey; const arn = process.env.LOOPS_API_KEY_SECRET_ARN; if (!arn) throw new Error('Loops secret is not configured'); const result = await secrets.send(new GetSecretValueCommand({ SecretId: arn })); const value = result.SecretString || ''; try { cachedApiKey = JSON.parse(value).apiKey; } catch { cachedApiKey = value; } if (!cachedApiKey) throw new Error('Loops API key is empty'); return cachedApiKey; }

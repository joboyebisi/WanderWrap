import { createHash } from 'node:crypto';

export function normalizeLead(input, { now = new Date().toISOString() } = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('Lead details are required');
  const email = String(input.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new TypeError('Enter a valid email address');
  if (input.serviceConsent !== true) throw new TypeError('Permission to email this shortlist is required');
  if (input.valueReceived !== true) throw new TypeError('Lead capture is available after recommendations are shown');
  return Object.freeze({
    id: createHash('sha256').update(email).digest('hex'),
    email,
    source: 'gift-finder-after-value',
    serviceConsentAt: now,
    marketingConsentAt: input.marketingConsent === true ? now : null,
    recommendationCount: Math.max(1, Math.min(20, Number(input.recommendationCount) || 1)),
    createdAt: now,
    updatedAt: now
  });
}

export function leadRateKey(sourceIp, at = new Date()) {
  const hour = at.toISOString().slice(0, 13);
  return {
    PK: `RATE#LEAD#${createHash('sha256').update(String(sourceIp || 'unknown')).digest('hex')}`,
    SK: hour,
    expiresAt: Math.floor(at.getTime() / 1000) + 2 * 60 * 60
  };
}

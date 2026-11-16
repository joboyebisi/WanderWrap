import { createHash } from 'node:crypto';

export function normalizeLead(input, { now = new Date().toISOString() } = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('Lead details are required');
  const email = String(input.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new TypeError('Enter a valid email address');
  if (input.serviceConsent !== true) throw new TypeError('Permission to email this shortlist is required');
  if (input.valueReceived !== true) throw new TypeError('Lead capture is available after recommendations are shown');
  const interest = String(input.interest || 'save_shortlist');
  if (!['save_shortlist', 'full_service_launch', 'concierge_completion'].includes(interest)) throw new TypeError('Choose a valid next step');
  return Object.freeze({
    id: createHash('sha256').update(email).digest('hex'),
    email,
    source: 'gift-finder-after-value',
    interest,
    serviceConsentAt: now,
    marketingConsentAt: input.marketingConsent === true ? now : null,
    recommendationCount: Math.max(1, Math.min(20, Number(input.recommendationCount) || 1)),
    createdAt: now,
    updatedAt: now
  });
}

export function normalizeTeamEnquiry(input, { now = new Date().toISOString() } = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('Enquiry details are required');
  const clean = (value, max) => String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
  const name = clean(input.name, 120);
  const email = clean(input.email, 254).toLowerCase();
  const company = clean(input.company, 160);
  const role = clean(input.role, 120);
  const teamSize = clean(input.teamSize, 40);
  const region = clean(input.region, 80);
  const useCase = clean(input.useCase, 80);
  const message = clean(input.message, 2_000);
  if (name.length < 2 || company.length < 2 || role.length < 2) throw new TypeError('Name, company and role are required');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new TypeError('Enter a valid work email');
  if (!teamSize || !region || !useCase) throw new TypeError('Team size, region and gifting need are required');
  if (input.contactConsent !== true) throw new TypeError('Permission to respond to this enquiry is required');
  return Object.freeze({
    id: createHash('sha256').update(`${email}|${company.toLowerCase()}`).digest('hex'),
    name, email, company, role, teamSize, region, useCase, message,
    contactConsentAt: now,
    marketingConsentAt: input.marketingConsent === true ? now : null,
    source: 'teams-early-access',
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

export function teamEnquiryRateKey(sourceIp, at = new Date()) {
  const hour = at.toISOString().slice(0, 13);
  return {
    PK: `RATE#TEAM_ENQUIRY#${createHash('sha256').update(String(sourceIp || 'unknown')).digest('hex')}`,
    SK: hour,
    expiresAt: Math.floor(at.getTime() / 1000) + 2 * 60 * 60
  };
}

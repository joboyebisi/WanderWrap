export const GIFT_REVEAL_KEY = 'wanderwrap:gift-finder:reveal-v1';
export const SAVED_BRIEFS_KEY = 'wanderwrap:saved-briefs-v1';
export type GiftBrief = { recipient: string; occasion: string; budget: string; timing: string; preferences: string[]; constraints: string[] };
export type Offer = { id?: string; title: string; description?: string | null; url?: string; imageUrl?: string; imageAlt?: string; merchant?: string; availability?: string; price?: number | { displayAmount: string } | null; currency?: string | null; category?: string | null };
export type RevealState = { brief: GiftBrief; products: Offer[]; observedAt: string; disclosure: string; conversationId?: string; savedAt: string };
export function saveReveal(value: RevealState) { window.sessionStorage.setItem(GIFT_REVEAL_KEY, JSON.stringify(value)); }
export function readReveal(): RevealState | null { try { return JSON.parse(window.sessionStorage.getItem(GIFT_REVEAL_KEY) || 'null'); } catch { return null; } }
export function saveBriefLocally(brief: GiftBrief) { try { const current = JSON.parse(window.localStorage.getItem(SAVED_BRIEFS_KEY) || '[]'); const item = { id: crypto.randomUUID(), brief, savedAt: new Date().toISOString() }; window.localStorage.setItem(SAVED_BRIEFS_KEY, JSON.stringify([item, ...(Array.isArray(current) ? current : [])].slice(0, 20))); } catch {} }

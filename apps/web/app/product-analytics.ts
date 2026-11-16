'use client';

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export function captureProductEvent(event: string, properties: AnalyticsProperties = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('wanderwrap:analytics', { detail: { event, properties } }));
}

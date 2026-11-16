'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { PostHog } from 'posthog-js';
import type { AnalyticsProperties } from './product-analytics';

const COOKIE = 'ww_cookie_consent';
const PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;

function analyticsAllowed() {
  const raw = document.cookie.split('; ').find(value => value.startsWith(`${COOKIE}=`))?.split('=').slice(1).join('=');
  if (!raw) return false;
  try { return JSON.parse(decodeURIComponent(raw)).analytics === true; } catch { return false; }
}

async function enableAnalytics() {
  if (!PROJECT_TOKEN || !analyticsAllowed()) return null;
  if (client) return client;
  if (!loading) loading = import('posthog-js').then(({ default: posthog }) => {
    posthog.init(PROJECT_TOKEN, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      person_profiles: 'identified_only',
      respect_dnt: true
    });
    client = posthog;
    return client;
  }).catch(() => null);
  return loading;
}

function enableGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || !analyticsAllowed()) return false;
  const global = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  global.dataLayer ||= [];
  global.gtag ||= (...args: unknown[]) => { global.dataLayer!.push(args); };
  if (!document.querySelector('#wanderwrap-ga4')) {
    const script = document.createElement('script'); script.id = 'wanderwrap-ga4'; script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`; document.head.appendChild(script);
    global.gtag('js', new Date()); global.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false, allow_google_signals: false });
  }
  return true;
}

function captureGoogle(event: string, properties: AnalyticsProperties = {}) {
  if (!enableGoogleAnalytics()) return;
  const global = window as typeof window & { gtag?: (...args: unknown[]) => void };
  global.gtag?.('event', event, properties);
}

function safeAttribution() {
  const query = new URLSearchParams(location.search);
  let referrerHost = 'direct';
  try { if (document.referrer) referrerHost = new URL(document.referrer).hostname; } catch { /* keep direct */ }
  return {
    referrer_host: referrerHost,
    utm_source: query.get('utm_source')?.slice(0, 100) || null,
    utm_medium: query.get('utm_medium')?.slice(0, 100) || null,
    utm_campaign: query.get('utm_campaign')?.slice(0, 120) || null
  };
}

export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const sync = async (allowed: boolean) => {
      if (!allowed) {
        if (client) { client.opt_out_capturing(); client.reset(); }
        if (GA_MEASUREMENT_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
        return;
      }
      if (GA_MEASUREMENT_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      enableGoogleAnalytics();
      const posthog = await enableAnalytics();
      posthog?.opt_in_capturing();
    };
    void sync(analyticsAllowed());
    const onConsent = (event: Event) => void sync(Boolean((event as CustomEvent).detail?.analytics));
    window.addEventListener('wanderwrap:consent-updated', onConsent);
    return () => window.removeEventListener('wanderwrap:consent-updated', onConsent);
  }, []);

  useEffect(() => {
    void enableAnalytics().then(posthog => {
      if (!posthog) return;
      posthog.capture('$pageview', { $current_url: `${location.origin}${pathname}`, ...safeAttribution() });
    });
    captureGoogle('page_view', { page_location: `${location.origin}${pathname}`, page_path: pathname, ...safeAttribution() });
  }, [pathname]);

  useEffect(() => {
    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ event?: string; properties?: AnalyticsProperties }>).detail;
      if (!detail?.event || !/^[a-z0-9_]{2,80}$/.test(detail.event)) return;
      void enableAnalytics().then(posthog => posthog?.capture(detail.event!, detail.properties));
      captureGoogle(detail.event, detail.properties);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-analytics-event]') : null;
      const name = target?.dataset.analyticsEvent;
      if (!name) return;
      const properties = Object.fromEntries(Object.entries(target.dataset)
        .filter(([key]) => key.startsWith('analytics') && key !== 'analyticsEvent')
        .map(([key, value]) => [key.replace(/^analytics/, '').replace(/^[A-Z]/, letter => letter.toLowerCase()), value?.slice(0, 120)]));
      void enableAnalytics().then(posthog => posthog?.capture(name, properties));
      captureGoogle(name, properties);
    };
    window.addEventListener('wanderwrap:analytics', onEvent);
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('wanderwrap:analytics', onEvent); document.removeEventListener('click', onClick); };
  }, []);

  return null;
}

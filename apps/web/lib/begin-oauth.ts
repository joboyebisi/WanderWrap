import 'server-only';
import { NextResponse } from 'next/server';
import { BASE_COOKIE, oauthConfig, type OAuthBase, pkceChallenge, privateCookie, randomUrlSafe, RETURN_COOKIE, STATE_COOKIE, VERIFIER_COOKIE } from './oauth';

export function beginOAuth(mode: 'login' | 'signup', options: { returnTo?: string; provider?: string; base?: OAuthBase } = {}) {
  const base = options.base === 'fallback' ? 'fallback' : 'primary';
  const config = oauthConfig(base);
  const state = randomUrlSafe();
  const verifier = randomUrlSafe(64);
  const authorization = new URL(mode === 'signup' ? '/signup' : '/oauth2/authorize', config.baseUrl);
  authorization.searchParams.set('response_type', 'code');
  authorization.searchParams.set('client_id', config.clientId);
  authorization.searchParams.set('redirect_uri', config.redirectUri);
  authorization.searchParams.set('scope', config.scopes.join(' '));
  authorization.searchParams.set('state', state);
  authorization.searchParams.set('code_challenge_method', 'S256');
  authorization.searchParams.set('code_challenge', pkceChallenge(verifier));
  authorization.searchParams.set('resource', config.resource);
  if (options.provider === 'Google') authorization.searchParams.set('identity_provider', 'Google');

  const response = NextResponse.redirect(authorization);
  response.cookies.set(STATE_COOKIE, state, privateCookie(600));
  response.cookies.set(VERIFIER_COOKIE, verifier, privateCookie(600));
  response.cookies.set(RETURN_COOKIE, safeReturnPath(options.returnTo), privateCookie(600));
  response.cookies.set(BASE_COOKIE, base, privateCookie(600));
  return response;
}

function safeReturnPath(value?: string) {
  const path = String(value || '/dashboard');
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path.slice(0, 300) : '/dashboard';
}

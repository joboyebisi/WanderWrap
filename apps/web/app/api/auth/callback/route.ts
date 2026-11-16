import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, BASE_COOKIE, oauthConfig, privateCookie, REFRESH_COOKIE, RETURN_COOKIE, STATE_COOKIE, VERIFIER_COOKIE } from '../../../../lib/oauth';
// @ts-ignore Shared callback classifier is intentionally consumed by the web BFF.
import { classifyOAuthResponse } from '../../../../../../src/auth-callback.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  const verifier = jar.get(VERIFIER_COOKIE)?.value;
  const returnTo = safeReturnPath(jar.get(RETURN_COOKIE)?.value);
  const oauthBase = jar.get(BASE_COOKIE)?.value === 'fallback' ? 'fallback' : 'primary';
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const providerError = request.nextUrl.searchParams.get('error');
  const providerErrorDescription = request.nextUrl.searchParams.get('error_description');
  const classification = classifyOAuthResponse({ code, state, expectedState, verifier, error: providerError, errorDescription: providerErrorDescription });
  if (classification.kind === 'failure') {
    console.warn(JSON.stringify({
      event: classification.reason === 'cancelled' ? 'auth_callback_cancelled' : 'auth_callback_rejected',
      reason: classification.reason,
      hasCode: Boolean(code),
      hasReturnedState: Boolean(state),
      hasExpectedState: Boolean(expectedState),
      stateMatched: Boolean(state && expectedState && state === expectedState),
      hasVerifier: Boolean(verifier)
    }));
    return failedCallback(request, classification.reason);
  }

  try {
    const config = oauthConfig(oauthBase);
    const tokenResponse = await fetch(new URL('/oauth2/token', config.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code: code!,
        redirect_uri: config.redirectUri,
        code_verifier: verifier!,
        resource: config.resource
      }),
      cache: 'no-store'
    });
    if (!tokenResponse.ok) {
      console.error(JSON.stringify({ event: 'auth_token_exchange_failed', status: tokenResponse.status }));
      return failedCallback(request, 'exchange');
    }
    const tokens = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in?: number };
    if (!tokens.access_token) {
      console.error(JSON.stringify({ event: 'auth_token_response_invalid' }));
      return failedCallback(request, 'exchange');
    }
    const response = NextResponse.redirect(new URL(returnTo, config.webUrl));
    response.cookies.set(ACCESS_COOKIE, tokens.access_token, privateCookie(tokens.expires_in || 3600));
    if (tokens.refresh_token) response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, privateCookie(30 * 86400));
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(VERIFIER_COOKIE);
    response.cookies.delete(RETURN_COOKIE);
    response.cookies.delete(BASE_COOKIE);
    console.info(JSON.stringify({ event: 'auth_callback_succeeded', hasRefreshToken: Boolean(tokens.refresh_token) }));
    return response;
  } catch (error) {
    console.error(JSON.stringify({ event: 'auth_callback_failed', errorType: error instanceof Error ? error.name : 'UnknownError' }));
    return failedCallback(request, 'unavailable');
  }
}

function failedCallback(request: NextRequest, reason: 'invalid' | 'cancelled' | 'account_exists' | 'provider' | 'exchange' | 'unavailable') {
  const response = NextResponse.redirect(new URL(`/sign-in?error=${reason}`, request.url));
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  response.cookies.delete(RETURN_COOKIE);
  response.cookies.delete(BASE_COOKIE);
  return response;
}

function safeReturnPath(value?: string) {
  const path = String(value || '/dashboard');
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path.slice(0, 300) : '/dashboard';
}

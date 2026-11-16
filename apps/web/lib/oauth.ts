import { createHash, randomBytes } from 'node:crypto';

export const ACCESS_COOKIE = 'ww_access';
export const REFRESH_COOKIE = 'ww_refresh';
export const STATE_COOKIE = 'ww_oauth_state';
export const VERIFIER_COOKIE = 'ww_pkce_verifier';
export const RETURN_COOKIE = 'ww_oauth_return';
export const BASE_COOKIE = 'ww_oauth_base';

export type OAuthBase = 'primary' | 'fallback';

export function oauthConfig(base: OAuthBase = 'primary') {
  const primaryBaseUrl = authBase(required('WANDERWRAP_OAUTH_BASE_URL'));
  const baseUrl = base === 'fallback' ? authBase(required('WANDERWRAP_OAUTH_FALLBACK_BASE_URL')) : primaryBaseUrl;
  const clientId = required('WANDERWRAP_WEB_CLIENT_ID');
  const webUrl = required('NEXT_PUBLIC_WANDERWRAP_URL').replace(/\/$/, '');
  const resource = process.env.WANDERWRAP_OAUTH_RESOURCE || `${required('WANDERWRAP_CORE_API_URL').replace(/\/$/, '')}/mcp`;
  return {
    baseUrl,
    clientId,
    webUrl,
    resource,
    redirectUri: `${webUrl}/api/auth/callback`,
    scopes: (process.env.WANDERWRAP_WEB_OAUTH_SCOPES || 'openid email wanderwrap/gifts.read wanderwrap/gifts.write').split(/\s+/).filter(Boolean)
  };
}

function authBase(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('OAuth base URL must be an HTTPS origin');
  }
  return url.origin;
}

export function randomUrlSafe(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function pkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

export function privateCookie(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge
  };
}

export function decodeJwtPayload(token?: string) {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

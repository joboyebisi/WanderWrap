import assert from 'node:assert/strict';

const rawBase = process.argv[2] || process.env.WANDERWRAP_WEB_URL;
if (!rawBase) {
  console.error('Usage: npm run test:web:live -- https://www.wanderwrap.co.uk');
  process.exit(2);
}

const base = new URL(rawBase);
const checks = [];

async function request(path, options = {}) {
  const response = await fetch(new URL(path, base), { redirect: 'manual', ...options });
  checks.push({ path, status: response.status });
  return response;
}

for (const path of ['/', '/connections', '/gift-finder', '/simulator', '/teams', '/sign-in', '/gift-ideas/birthdays', '/gift-ideas/emerald-keepsake', '/privacy', '/cookies', '/terms']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must return 200`);
  assert.match(response.headers.get('server') || '', /vercel/i, `${path} must be served by Vercel`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${path} must send security headers`);
}

const home = await fetch(base);
const homeHtml = await home.text();
assert.match(homeHtml, /Make Every Gift/, 'Landing page headline is missing');
assert.match(homeHtml, /Your personal AI gifting team/, 'Landing page agent proposition is missing');
assert.match(homeHtml, /href="\/sign-in"/, 'Landing navigation must use the branded sign-in page');
assert.match(homeHtml, /Explore WanderWrap for Teams/, 'Landing page must give teams a distinct next step');
assert.match(homeHtml, /href="\/gift-ideas\/birthdays"/, 'Occasion imagery must lead to a meaningful destination');
assert.match(homeHtml, /href="\/gift-ideas\/emerald-keepsake"/, 'Gift-direction imagery must lead to a meaningful destination');
assert.match(homeHtml, /Birthday for someone who has everything/, 'Landing page must include the birthday starter prompt');
assert.match(homeHtml, /Last-minute, but still personal/, 'Landing page must include the urgent starter prompt');
assert.doesNotMatch(homeHtml, /href="\/unwrap"/, 'Landing page must not link to the unavailable unwrap flow');

const publicRoute = await fetch(new URL('/gift-finder', base));
const publicRouteHtml = await publicRoute.text();
assert.match(publicRouteHtml, /Talk it through\./, 'Conversational gifting journey is missing');
assert.match(publicRouteHtml, /No purchase without your action/, 'Public journey approval disclosure is missing');

const unavailableUnwrap = await request('/unwrap');
assert.equal(unavailableUnwrap.status, 404, 'Unavailable unwrap flow must remain removed');

const legacyRoute = await request('/route');
assert.ok([307, 308].includes(legacyRoute.status), `/route must redirect; received ${legacyRoute.status}`);
assert.equal(new URL(legacyRoute.headers.get('location'), base).pathname, '/gift-finder', '/route must redirect to /gift-finder');

const health = await request('/api/health');
assert.equal(health.status, 200, 'Web health must return 200');
assert.equal((await health.json()).status, 'ok', 'Web health payload must be ok');

const session = await request('/api/auth/session');
assert.equal(session.status, 200, 'Unauthenticated session check must return 200');
assert.equal((await session.json()).authenticated, false, 'Signed-out browser must fail closed');

const signup = await request('/api/auth/signup');
if (![302, 303, 307, 308].includes(signup.status)) {
  const detail = (await signup.text()).slice(0, 300);
  assert.fail(`Signup must redirect to Cognito; received ${signup.status}: ${detail}`);
}
const location = signup.headers.get('location');
assert.ok(location, 'Signup redirect must include Location');
const authorization = new URL(location);
const approvedCognitoHosts = new Set([
  'auth.wanderwrap.co.uk',
  'wanderwrap-signin.auth.eu-west-2.amazoncognito.com',
]);
assert.ok(approvedCognitoHosts.has(authorization.hostname), `Signup must use an approved WanderWrap Cognito hostname; received ${authorization.hostname}`);
assert.equal(authorization.pathname, '/signup', 'Signup must use the Cognito signup path');
assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256', 'Signup must require PKCE S256');
assert.ok(authorization.searchParams.get('code_challenge'), 'Signup must include a PKCE challenge');
assert.ok(authorization.searchParams.get('resource')?.endsWith('/mcp'), 'Signup must bind tokens to the MCP resource');
assert.equal(new URL(authorization.searchParams.get('redirect_uri')).origin, base.origin, 'OAuth callback must return to the tested web origin');
const cookies = signup.headers.getSetCookie?.() || [signup.headers.get('set-cookie') || ''];
assert.ok(cookies.some(value => /ww_oauth_state=.*HttpOnly/i.test(value)), 'OAuth state must use an HttpOnly cookie');

console.log(JSON.stringify({ status: 'passed', origin: base.origin, checks }, null, 2));

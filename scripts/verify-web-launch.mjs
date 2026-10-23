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

for (const path of ['/', '/connections', '/simulator']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must return 200`);
  assert.match(response.headers.get('server') || '', /vercel/i, `${path} must be served by Vercel`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${path} must send security headers`);
}

const home = await fetch(base);
assert.match(await home.text(), /Remember the person\. Find the gift\./, 'Landing page content is missing');

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
assert.match(authorization.hostname, /\.auth\.[a-z0-9-]+\.amazoncognito\.com$/, 'Signup must redirect to Cognito managed login');
assert.equal(authorization.pathname, '/signup', 'Signup must use the Cognito signup path');
assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256', 'Signup must require PKCE S256');
assert.ok(authorization.searchParams.get('code_challenge'), 'Signup must include a PKCE challenge');
assert.ok(authorization.searchParams.get('resource')?.endsWith('/mcp'), 'Signup must bind tokens to the MCP resource');
assert.equal(new URL(authorization.searchParams.get('redirect_uri')).origin, base.origin, 'OAuth callback must return to the tested web origin');
const cookies = signup.headers.getSetCookie?.() || [signup.headers.get('set-cookie') || ''];
assert.ok(cookies.some(value => /ww_oauth_state=.*HttpOnly/i.test(value)), 'OAuth state must use an HttpOnly cookie');

console.log(JSON.stringify({ status: 'passed', origin: base.origin, checks }, null, 2));

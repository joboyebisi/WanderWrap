/** @type {import('next').NextConfig} */
const scriptPolicy = process.env.NODE_ENV === 'production' ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const config = {
  output: 'standalone',
  poweredByHeader: false,
  typedRoutes: true,
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://m.media-amazon.com; object-src 'none'; ${scriptPolicy}; style-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests` },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
      ]
    }];
  }
};

export default config;

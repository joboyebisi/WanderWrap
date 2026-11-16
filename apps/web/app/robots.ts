import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_WANDERWRAP_URL || 'https://www.wanderwrap.co.uk';
  return { rules: { userAgent: '*', allow: '/', disallow: ['/account', '/admin', '/wishlist', '/api/'] }, sitemap: new URL('/sitemap.xml', base).toString(), host: base };
}

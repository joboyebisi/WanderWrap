import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_WANDERWRAP_URL || 'https://www.wanderwrap.co.uk';
  return ['', '/gift-finder', '/teams', '/connections', '/privacy', '/cookies', '/terms'].map(path => ({ url: new URL(path || '/', base).toString(), lastModified: new Date(), changeFrequency: path === '' ? 'daily' : 'weekly', priority: path === '' ? 1 : path === '/gift-finder' ? 0.9 : 0.6 }));
}

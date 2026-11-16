import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CookieConsent from './cookie-consent';
import AnalyticsProvider from './analytics-provider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WANDERWRAP_URL || 'http://127.0.0.1:3000'),
  applicationName: 'WanderWrap',
  title: { default: 'WanderWrap — Make every gift feel personal', template: '%s · WanderWrap' },
  description: 'WanderWrap’s AI gifting agents build the brief, research personal gift ideas and prepare the next step—always with your approval.',
  icons: { icon: '/icon.png', apple: '/apple-icon.png' },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  openGraph: {
    title: 'WanderWrap — Make every gift feel personal',
    description: 'AI gifting agents that research personal ideas and bring back a thoughtful, approval-ready shortlist.',
    type: 'website',
    siteName: 'WanderWrap',
    locale: 'en_GB'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WanderWrap — Make every gift feel personal',
    description: 'AI gifting agents that research personal ideas and bring back a thoughtful, approval-ready shortlist.'
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const structuredData = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'WanderWrap', applicationCategory: 'ShoppingApplication', operatingSystem: 'Web', description: 'A personal gift-shopping agent that builds Gift Briefs and researches current products for user-approved retailer handoff.', url: process.env.NEXT_PUBLIC_WANDERWRAP_URL || 'https://www.wanderwrap.co.uk' };
  return (
    <html lang="en">
      <body><a className="skipLink" href="#main-content">Skip to main content</a><div id="main-content" tabIndex={-1}>{children}</div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }} /><AnalyticsProvider /><CookieConsent /></body>
    </html>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WANDERWRAP_URL || 'http://127.0.0.1:3000'),
  applicationName: 'WanderWrap',
  title: { default: 'WanderWrap — Make every gift feel personal', template: '%s · WanderWrap' },
  description: 'WanderWrap’s AI gifting agents build the brief, research personal gift ideas and prepare the next step—always with your approval.',
  icons: { icon: '/icon.png', apple: '/apple-icon.png' },
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
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WANDERWRAP_URL || 'http://127.0.0.1:3000'),
  title: { default: 'WanderWrap — Make every gift feel personal', template: '%s · WanderWrap' },
  description: 'Discover thoughtful gifts shaped around the people you know and the moments that matter.',
  openGraph: {
    title: 'WanderWrap — Make every gift feel personal',
    description: 'Discover thoughtful gifts shaped around the people you know and the moments that matter.',
    type: 'website',
    siteName: 'WanderWrap'
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

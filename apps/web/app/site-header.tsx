'use client';

import Image from 'next/image';
import Link from 'next/link';
import AccountMenu from './gift-finder/account-menu';

export default function SiteHeader({ tone = 'light', wide = false }: { tone?: 'light' | 'dark'; wide?: boolean }) {
  return <header className={`siteHeader ${tone === 'dark' ? 'siteHeaderDark' : ''}`}>
    <div className={`siteHeaderInner ${wide ? 'siteHeaderWide' : 'shell'}`}>
      <Link className="siteWordmark" href="/" aria-label="WanderWrap home"><Image src="/landing/wanderwrap-emblem.png" alt="" width={34} height={34} priority/><span>WanderWrap</span></Link>
      <nav className="sitePrimaryNav" aria-label="Primary navigation"><Link href="/teams">For Teams</Link><Link className="siteGiftFinder" href="/gift-finder">Gift Finder</Link><AccountMenu/></nav>
    </div>
  </header>;
}

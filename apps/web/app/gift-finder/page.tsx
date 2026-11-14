import type { Metadata } from 'next';
import Link from 'next/link';
import GiftFinderExperience from './gift-finder-experience';

export const metadata: Metadata = {
  title: 'Gift Finder · Agent-curated gifts from real clues',
  description: 'Build an editable Gift Brief, let WanderWrap agents research current products with Channel3, then choose a retailer to complete checkout.',
  alternates: { canonical: '/gift-finder' }
};

export default function GiftFinderPage() {
  return <main className="routePage">
    <div className="shell">
      <nav className="nav routeNav" aria-label="Demo navigation">
        <Link className="brand" href="/">wanderwrap <span aria-hidden="true">✦</span></Link>
        <div className="navLinks"><Link href="/connections">Connections</Link><Link className="navButton" href="/gift-finder">🎁 Gift Finder</Link></div>
      </nav>
      <header className="routeHero">
        <div><p className="eyebrow">✨ A LIVE, NO-ACCOUNT PREVIEW</p><h1>One lovely clue.<br />One genuinely thoughtful gift.</h1></div>
        <p>Share only clues you are allowed to use. WanderWrap turns them into confirmed interests, coordinates specialist agents and researches current products with Channel3. You choose the gift and complete checkout with the retailer.</p>
      </header>
      <GiftFinderExperience />
    </div>
  </main>;
}

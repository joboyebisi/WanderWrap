import type { Metadata } from 'next';
import Link from 'next/link';
import GiftFinderExperience from './gift-finder-experience';

export const metadata: Metadata = {
  title: 'Gift Finder · Thoughtful gift ideas from real clues',
  description: 'Use selected, permitted clues to find explainable gift ideas and prepare a safe Amazon handoff.',
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
        <p>Paste only words you are allowed to use. WanderWrap turns them into confirmation-only interests, coordinates specialist agents, then prepares an Amazon handoff. No feed access. No silent purchase.</p>
      </header>
      <GiftFinderExperience />
    </div>
  </main>;
}

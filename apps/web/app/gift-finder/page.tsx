import type { Metadata } from 'next';
import Link from 'next/link';
import GiftFinderExperience from './gift-finder-experience';

export const metadata: Metadata = {
  title: 'Gift Finder · Talk it through, find something personal',
  description: 'Have a natural conversation with WanderWrap’s specialist gift agent, then compare current gifts from trusted shopping sites.',
  alternates: { canonical: '/gift-finder' }
};

export default function GiftFinderPage() {
  return <main className="routePage">
    <div className="shell">
      <nav className="nav routeNav" aria-label="Gift Finder navigation">
        <Link className="brand" href="/">wanderwrap <span aria-hidden="true">✦</span></Link>
        <div className="navLinks"><Link href="/teams">For Teams</Link><Link className="navButton" href="/gift-finder">Gift Finder</Link></div>
      </nav>
      <header className="routeHero">
        <div><p className="eyebrow">YOUR SPECIALIST GIFT AGENT</p><h1>Talk it through.<br />Find something personal.</h1></div>
        <p>Describe the person and the moment in your own words. WanderWrap carries the context, asks useful follow-ups and researches current gifts when the brief is ready.</p>
      </header>
      <GiftFinderExperience />
    </div>
  </main>;
}

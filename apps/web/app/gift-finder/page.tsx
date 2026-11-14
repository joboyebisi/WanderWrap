import type { Metadata } from 'next';
import Link from 'next/link';
import GiftFinderExperience from './gift-finder-experience';

export const metadata: Metadata = {
  title: 'Gift Finder · Personal gifts, researched for them',
  description: 'Build an editable Gift Brief, let WanderWrap agents research current products with Channel3, then choose a retailer to complete checkout.',
  alternates: { canonical: '/gift-finder' }
};

export default function GiftFinderPage() {
  return <main className="routePage">
    <div className="shell">
      <nav className="nav routeNav" aria-label="Gift Finder navigation">
        <Link className="brand" href="/">wanderwrap <span aria-hidden="true">✦</span></Link>
        <div className="navLinks"><Link href="/connections">Connections</Link><Link className="navButton" href="/gift-finder">Gift Finder</Link></div>
      </nav>
      <header className="routeHero">
        <div><p className="eyebrow">GIFT FINDER · NO ACCOUNT NEEDED</p><h1>Tell us about them.<br />We’ll find the gifts.</h1></div>
        <p>Build a Gift Brief with the details that make them who they are. WanderWrap’s agents turn it into thoughtful, current recommendations; you make the final choice.</p>
      </header>
      <GiftFinderExperience />
    </div>
  </main>;
}

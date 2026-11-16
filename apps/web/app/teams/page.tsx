import type { Metadata } from 'next';
import Link from 'next/link';
import TeamEnquiryForm from './team-enquiry-form';

export const metadata: Metadata = {
  title: 'WanderWrap for Teams',
  description: 'Speak with WanderWrap about thoughtful employee, client and multi-country gifting.'
};

export default function TeamsPage() {
  return <main className="teamsPage">
    <div className="shell">
      <nav className="nav" aria-label="Teams navigation"><Link className="brand" href="/">wanderwrap <span aria-hidden="true">✦</span></Link><div className="navLinks"><Link href="/gift-finder">Gift Finder</Link><Link href="/sign-in">Sign in</Link></div></nav>
      <header className="teamsExecutiveHero"><div><p className="eyebrow">WANDERWRAP FOR TEAMS · EARLY ACCESS</p><h1>Personal gifting,<br />with operational control.</h1></div><p>For People, Executive Assistant, client and recognition teams that want every gift to feel considered—without turning thoughtful work into administration.</p></header>
      <section className="teamProof" aria-label="WanderWrap for Teams capabilities"><article><span>01</span><h2>Brief once</h2><p>Set budgets, policies, markets and approval rules while preserving the context that makes each gift personal.</p></article><article><span>02</span><h2>Review clearly</h2><p>See why each direction fits, what it costs and where an exception needs human judgement.</p></article><article><span>03</span><h2>Scale thoughtfully</h2><p>Prepare ten gifts or hundreds with a consistent approval trail and a recipient-respectful handoff.</p></article></section>
      <TeamEnquiryForm />
    </div>
  </main>;
}

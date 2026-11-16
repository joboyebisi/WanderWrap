import Link from 'next/link';
import GiftWorkspace from './gift-workspace';
import SiteHeader from '../site-header';

export default function DashboardPage() {
  return (
    <main className="dashboard"><SiteHeader/><div className="shell">
      <header className="dashboardIntro">
        <div>
          <p className="eyebrow">YOUR GIFT SPACE</p>
          <h1>Thoughtfulness, without the scramble.</h1>
          <p className="lede">Add one person, confirm what they enjoy, and turn it into a shortlist you can understand.</p>
        </div>
        <div className="trustPill"><span aria-hidden="true">●</span> Nothing is purchased without your approval</div>
      </header>
      <GiftWorkspace /></div>
    </main>
  );
}

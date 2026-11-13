import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const assets = {
  emblem: '/landing/wanderwrap-emblem.png', hero: '/landing/emerald-keepsake.png', birthday: '/landing/birthday-gift.png',
  anniversary: '/landing/anniversary-keepsake.png', celebration: '/landing/celebration-coupes.png',
  justBecause: '/landing/artisanal-surprise.png', corporate: '/landing/corporate-unboxing.png',
  serenity: '/landing/serenity-sanctuary.png', poet: '/landing/poet-retreat.png', coffee: '/landing/pour-over-set.png'
} as const;

const occasions = [
  { title: 'Birthdays', icon: '🎂', label: 'Bespoke suite', image: assets.birthday },
  { title: 'Anniversaries', icon: '❤', label: 'Timeless keepsakes', image: assets.anniversary, offset: true },
  { title: 'Celebrations', icon: '🎉', label: 'Milestones & wins', image: assets.celebration },
  { title: 'Just Because', icon: '💝', label: 'Everyday delights', image: assets.justBecause, offset: true }
];

const directions = [
  { name: 'The Emerald Keepsake', description: 'Velvet, satin ribbon & considered treats', label: 'Velvet & rose', image: assets.hero, detail: 'A rich emerald presentation direction with rose silk, a personal note and a keepsake ritual.' },
  { name: 'Serenity Sanctuary', description: 'Candle, botanicals & a quiet tea ritual', label: 'Sensory rest', image: assets.serenity, detail: 'A calm direction shaped around botanical fragrance, herbal tea and slower moments.' },
  { name: "The Poet's Retreat", description: 'Linen journal, brass pen & rare tea', label: 'Creative ritual', image: assets.poet, detail: 'A reflective direction for someone who treasures words, tactile stationery and unhurried thought.' },
  { name: 'Artisan Pour-Over Set', description: 'Brass brewer, linen beans & ceramic mug', label: 'Coffee & craft', image: assets.coffee, detail: 'A handcrafted direction for slow mornings, considered coffee and beautiful everyday objects.' }
];

function Emblem({ size = 34 }: { size?: number }) {
  return <Image className={styles.emblem} src={assets.emblem} alt="" width={size} height={size} priority />;
}

export default function HomePage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <div className={styles.navInner}>
          <div className={styles.navLeft}>
            <Link href="/gift-finder">Gift Finder <span>🎁</span></Link><Link href="/connections">For Teams</Link>
            <Link className={styles.claimLink} href="/gift-finder">Start a Gift <span>💝</span></Link>
          </div>
          <Link className={styles.wordmark} href="/" aria-label="WanderWrap home"><Emblem /><span>WanderWrap</span></Link>
          <div className={styles.navRight}>
            <Link className={styles.conciergeLink} href="/gift-finder"><span>✦</span> AI Concierge</Link><a href="/api/auth/login">Sign in</a>
          </div>
          <details className={styles.mobileMenu}>
            <summary aria-label="Open navigation"><span /><span /><span /></summary>
            <div><Link href="/gift-finder">Gift Finder 🎁</Link><Link href="/connections">For Teams</Link><Link href="/gift-finder">Start a Gift 💝</Link><a href="/api/auth/login">Sign in</a></div>
          </details>
        </div>
      </nav>

      <header className={styles.hero}>
        <Image className={styles.heroImage} src={assets.hero} alt="Emerald velvet gift box tied with rose satin ribbon" fill sizes="100vw" priority />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}><span>✦</span> Your AI gifting concierge</p>
          <h1>Make Every Gift<br /><em>Feel Personal.</em></h1>
          <p className={styles.heroLead}>Discover thoughtful gift directions for the people who matter, without the endless searching and guesswork.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/gift-finder">Find a Gift <span>🎁</span></Link>
            <Link className={styles.outlineButton} href="/connections">For Teams</Link>
            <Link className={styles.roseButton} href="/gift-finder">Start a Gift <span>💝</span></Link>
          </div>
          <p className={styles.heroNote}>No account needed to explore · You control every clue · No automatic purchases</p>
        </div>
      </header>

      <section className={styles.pillars} aria-labelledby="how-it-works">
        <h2 className={styles.visuallyHidden} id="how-it-works">How WanderWrap works</h2>
        <div className={styles.pillarGrid}>
          <article><span className={styles.pillarIcon}>♡</span><h3>Understand Them</h3><p>Share only what you choose: their quirks, cherished memories, hobbies and personal tastes.</p></article>
          <article><span className={styles.pillarIcon}>✣</span><h3>Find Their Gift</h3><p>Turn confirmed clues into thoughtful, explainable directions—each with a reason it could fit.</p></article>
          <article><span className={styles.pillarIcon}>◇</span><h3>Make Their Day</h3><p>Shape the plan, add a personal message and choose when you are ready to continue to a retailer.</p></article>
        </div>
      </section>

      <section className={styles.occasions} aria-labelledby="occasions-title">
        <div className={styles.sectionIntro}><p>Tailored moments</p><h2 id="occasions-title">Every Occasion Deserves Something Special.</h2></div>
        <div className={styles.occasionGrid}>
          {occasions.map((occasion) => (
            <Link className={`${styles.occasionCard} ${occasion.offset ? styles.offset : ''}`} href="/gift-finder" key={occasion.title}>
              <span className={styles.arch}><Image src={occasion.image} alt="" fill sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 23vw" /><small>{occasion.label}</small></span>
              <h3>{occasion.title} <span>{occasion.icon}</span></h3><span className={styles.explore}>Explore curations</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.teamsBanner} aria-labelledby="teams-title">
        <Image src={assets.corporate} alt="Curated corporate gift presentation with rose and gold details" fill sizes="100vw" />
        <div className={styles.teamsShade} />
        <div className={styles.teamsContent}>
          <p>WanderWrap for workspaces</p><h2 id="teams-title">Make Every Employee<br /><em>Feel Valued.</em></h2>
          <p className={styles.teamsLead}>A planned workspace for thoughtful milestone gifting, clear approvals and privacy-conscious recipient handoff.</p>
          <Link href="/connections">Explore the teams roadmap <span>→</span></Link>
        </div>
      </section>

      <section className={styles.recommendations} aria-labelledby="recommendations-title">
        <div className={styles.recommendationHeading}>
          <div><p>Handpicked inspiration</p><h2 id="recommendations-title">Thoughtful Gifts, Chosen for Them.</h2><small>Illustrative directions · Your gift journey is personalised from confirmed clues</small></div>
          <Link href="/gift-finder">Open AI Gift Concierge</Link>
        </div>
        <div className={styles.directionGrid}>
          {directions.map((direction) => (
            <Link className={styles.directionCard} href="/gift-finder" key={direction.name}>
              <span className={styles.directionImage}>
                <Image src={direction.image} alt="" fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 23vw" /><small>{direction.label}</small>
                <span className={styles.directionOverlay}><b>AI-curated direction</b><span>{direction.detail}</span><em>Explore direction</em></span>
              </span>
              <span className={styles.directionCopy}><span><strong>{direction.name}</strong><small>{direction.description}</small></span><em>Direction</em></span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.disclosure}><span>✦</span><p><strong>A beautiful preview, honestly presented.</strong> Gift examples are illustrative and the public Gift Finder uses deterministic demo data. Nothing is ordered or paid for without your explicit approval.</p></section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}><Link href="/"><Emblem size={32} /><span>WanderWrap</span></Link><p>Make every gift feel personal. Thoughtful, explainable gift directions with you in control.</p></div>
          <div><h2>Platform</h2><Link href="/gift-finder">Gift Finder 🎁</Link><Link href="/connections">Connections & teams</Link><Link href="/simulator">Alexa+ simulator</Link></div>
          <div><h2>WanderWrap</h2><a href="/api/auth/login">Sign in</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div>
          <div className={styles.footerCta}><h2>Your next thoughtful gift</h2><p>Begin with a person, a moment and the clues you are comfortable sharing.</p><Link href="/gift-finder">Find a Gift <span>→</span></Link></div>
        </div>
        <div className={styles.footerBottom}><p>© {new Date().getFullYear()} WanderWrap. Make every gift feel personal.</p><p>Consent-first · Human-approved · No automatic purchases</p></div>
      </footer>
      <Link className={styles.floatingCta} href="/gift-finder"><span>🎁</span> Find a Gift</Link>
    </main>
  );
}

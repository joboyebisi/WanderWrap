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
  { name: 'The Emerald Keepsake', description: 'Velvet, satin ribbon & considered treats', label: 'Velvet & rose', image: assets.hero, detail: 'Rose silk, deep emerald velvet and a personal keepsake make the unboxing part of the gift.' },
  { name: 'Serenity Sanctuary', description: 'Candle, botanicals & a quiet tea ritual', label: 'Sensory rest', image: assets.serenity, detail: 'Botanical fragrance, herbal tea and calming rituals create a pocket of time just for them.' },
  { name: "The Poet's Retreat", description: 'Linen journal, brass pen & rare tea', label: 'Creative ritual', image: assets.poet, detail: 'Beautiful tools for someone who treasures words, tactile stationery and time to think.' },
  { name: 'Artisan Pour-Over Set', description: 'Brass brewer, linen beans & ceramic mug', label: 'Coffee & craft', image: assets.coffee, detail: 'Handcrafted pieces turn their morning coffee into a ritual worth slowing down for.' }
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
            <Link className={styles.claimLink} href="/unwrap">Unwrap a Gift <span>💝</span></Link>
          </div>
          <Link className={styles.wordmark} href="/" aria-label="WanderWrap home"><Emblem /><span>WanderWrap</span></Link>
          <div className={styles.navRight}>
            <Link className={styles.conciergeLink} href="/gift-finder"><span>✦</span> AI Gift Concierge</Link><a href="/api/auth/login">Sign in</a>
          </div>
          <details className={styles.mobileMenu}>
            <summary aria-label="Open navigation"><span /><span /><span /></summary>
            <div><Link href="/gift-finder">Gift Finder 🎁</Link><Link href="/connections">For Teams</Link><Link href="/unwrap">Unwrap a Gift 💝</Link><a href="/api/auth/login">Sign in</a></div>
          </details>
        </div>
      </nav>

      <header className={styles.hero}>
        <Image className={styles.heroImage} src={assets.hero} alt="Emerald velvet gift box tied with rose satin ribbon" fill sizes="100vw" loading="eager" priority />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}><span>✦</span> Your personal AI gifting team</p>
          <h1>Make Every Gift<br /><em>Feel Personal.</em></h1>
          <p className={styles.heroLead}>Tell us about the person and the moment. Our specialist agents shape a Gift Brief, research promising ideas and bring back a shortlist that feels personal—not generic.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/gift-finder">Find a Gift <span>🎁</span></Link>
            <Link className={styles.outlineButton} href="/connections">For Teams</Link>
            <Link className={styles.roseButton} href="/unwrap">Unwrap a Gift <span>💝</span></Link>
          </div>
          <p className={styles.heroNote}>Start without an account · Share only what you choose · Nothing is purchased without your approval</p>
        </div>
      </header>

      <section className={styles.pillars} aria-labelledby="how-it-works">
        <h2 className={styles.visuallyHidden} id="how-it-works">How WanderWrap works</h2>
        <div className={styles.pillarGrid}>
          <article><span className={styles.pillarIcon}>♡</span><h3>Build the Gift Brief</h3><p>Share the occasion, budget and a few things you know about them. Our agents turn those details into a brief you can check and edit.</p></article>
          <article><span className={styles.pillarIcon}>✣</span><h3>Let the Agents Research</h3><p>Specialists compare ideas, current products and practical trade-offs, then explain why each recommendation earned its place.</p></article>
          <article><span className={styles.pillarIcon}>◇</span><h3>Choose What Moves Forward</h3><p>Review the shortlist, refine the plan and approve the next step. WanderWrap coordinates the work; the decision stays with you.</p></article>
        </div>
      </section>

      <section className={styles.occasions} aria-labelledby="occasions-title">
        <div className={styles.sectionIntro}><p>Tailored moments</p><h2 id="occasions-title">Every Occasion Deserves Something Special.</h2></div>
        <div className={styles.occasionGrid}>
          {occasions.map((occasion) => (
            <Link className={`${styles.occasionCard} ${occasion.offset ? styles.offset : ''}`} href="/gift-finder" key={occasion.title}>
              <span className={styles.arch}><Image src={occasion.image} alt="" fill sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 23vw" /><small>{occasion.label}</small></span>
              <h3>{occasion.title} <span>{occasion.icon}</span></h3><span className={styles.explore}>Explore gifts</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.teamsBanner} aria-labelledby="teams-title">
        <Image src={assets.corporate} alt="Curated corporate gift presentation with rose and gold details" fill sizes="100vw" />
        <div className={styles.teamsShade} />
        <div className={styles.teamsContent}>
          <p>WanderWrap for teams · Early access</p><h2 id="teams-title">Make Every Employee<br /><em>Feel Valued.</em></h2>
          <p className={styles.teamsLead}>Give the agents your programme rules, budgets and recipient context. They prepare personalised gift briefs, research options, organise approvals and report back—so your team can run ten gifts or hundreds without losing the human touch.</p>
          <Link href="/connections">Explore WanderWrap for Teams <span>→</span></Link>
        </div>
      </section>

      <section className={styles.recommendations} aria-labelledby="recommendations-title">
        <div className={styles.recommendationHeading}>
          <div><p>Agent-researched inspiration</p><h2 id="recommendations-title">Thoughtful Gifts, Chosen for Them.</h2><small>Built from the Gift Brief · Explained before you decide</small></div>
          <Link href="/gift-finder">Find Their Gift</Link>
        </div>
        <div className={styles.directionGrid}>
          {directions.map((direction) => (
            <Link className={styles.directionCard} href="/gift-finder" key={direction.name}>
              <span className={styles.directionImage}>
                <Image src={direction.image} alt="" fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 23vw" /><small>{direction.label}</small>
                <span className={styles.directionOverlay}><b>Why it fits</b><span>{direction.detail}</span><em>Explore this gift</em></span>
              </span>
              <span className={styles.directionCopy}><span><strong>{direction.name}</strong><small>{direction.description}</small></span><em>Gift idea</em></span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.disclosure}><span>✦</span><p><strong>Agents do the legwork. You stay in control.</strong> WanderWrap researches, compares and prepares the next step. You decide what feels right, and no purchase or recipient contact happens without your approval.</p></section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}><Link href="/"><Emblem size={32} /><span>WanderWrap</span></Link><p>AI agents for personal gifting—researching the right ideas while you keep the final say.</p></div>
          <div><h2>Platform</h2><Link href="/gift-finder">Gift Finder 🎁</Link><Link href="/connections">Connections & teams</Link><Link href="/simulator">Alexa+ simulator</Link></div>
          <div><h2>WanderWrap</h2><a href="/api/auth/login">Sign in</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div>
          <div className={styles.footerCta}><h2>Your next thoughtful gift</h2><p>Begin with the person, the occasion and the little things that make them special.</p><Link href="/gift-finder">Find a Gift <span>→</span></Link></div>
        </div>
        <div className={styles.footerBottom}><p>© {new Date().getFullYear()} WanderWrap. Make every gift feel personal.</p><p>Private by design · Every purchase is your decision</p></div>
      </footer>
      <Link className={styles.floatingCta} href="/gift-finder"><span>🎁</span> Find a Gift</Link>
    </main>
  );
}

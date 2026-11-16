import Image from 'next/image';
import Link from 'next/link';
import LandingGiftComposer from './landing-gift-composer';
import { giftIdeas } from './gift-ideas/gift-ideas';
import styles from './page.module.css';

const assets = {
  emblem: '/landing/wanderwrap-emblem.png', hero: '/landing/emerald-keepsake.png', corporate: '/landing/corporate-unboxing.png'
} as const;

const occasions = giftIdeas.filter(item => item.kind === 'occasion');
const directions = giftIdeas.filter(item => item.kind === 'direction');

function Emblem({ size = 34 }: { size?: number }) {
  return <Image className={styles.emblem} src={assets.emblem} alt="" width={size} height={size} priority />;
}

export default function HomePage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <div className={styles.navInner}>
          <div className={styles.navLeft}>
            <Link href="/gift-finder" data-analytics-event="landing_cta_clicked" data-analytics-placement="navigation">Gift Finder <span>🎁</span></Link><Link href="/teams" data-analytics-event="teams_cta_clicked" data-analytics-placement="navigation">For Teams</Link>
          </div>
          <Link className={styles.wordmark} href="/" aria-label="WanderWrap home"><Emblem /><span>WanderWrap</span></Link>
          <div className={styles.navRight}>
            <Link className={styles.conciergeLink} href="/gift-finder" data-analytics-event="landing_cta_clicked" data-analytics-placement="navigation_concierge"><span>✦</span> Find a gift with AI</Link><Link href="/sign-in" data-analytics-event="auth_page_opened">Sign in</Link>
          </div>
          <details className={styles.mobileMenu}>
            <summary aria-label="Open navigation"><span /><span /><span /></summary>
            <div><Link href="/gift-finder">Gift Finder 🎁</Link><Link href="/teams">For Teams</Link><Link href="/sign-in">Sign in</Link></div>
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
          <LandingGiftComposer />
          <p className={styles.heroNote}>Start without an account · Share only what you choose · Nothing is purchased without your approval</p>
          <p className={styles.teamsPath}>Gifting for employees or clients? <Link href="/teams" data-analytics-event="teams_cta_clicked" data-analytics-placement="below_composer">Explore WanderWrap for Teams <span>→</span></Link></p>
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
            <Link className={`${styles.occasionCard} ${occasion.offset ? styles.offset : ''}`} href={`/gift-ideas/${occasion.slug}`} key={occasion.title} data-analytics-event="gift_idea_opened" data-analytics-idea={occasion.slug}>
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
          <Link href="/teams" data-analytics-event="teams_cta_clicked" data-analytics-placement="teams_banner">Speak with our team <span>→</span></Link>
        </div>
      </section>

      <section className={styles.recommendations} aria-labelledby="recommendations-title">
        <div className={styles.recommendationHeading}>
          <div><p>Agent-researched inspiration</p><h2 id="recommendations-title">Thoughtful Gifts, Chosen for Them.</h2><small>Built from the Gift Brief · Explained before you decide</small></div>
          <Link href="/gift-finder" data-analytics-event="landing_cta_clicked" data-analytics-placement="recommendations_heading">Find Their Gift</Link>
        </div>
        <div className={styles.directionGrid}>
          {directions.map((direction) => (
            <Link className={styles.directionCard} href={`/gift-ideas/${direction.slug}`} key={direction.title} data-analytics-event="gift_idea_opened" data-analytics-idea={direction.slug}>
              <span className={styles.directionImage}>
                <Image src={direction.image} alt="" fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 23vw" /><small>{direction.label}</small>
                <span className={styles.directionOverlay}><b>Explore the direction</b><span>{direction.detail}</span><em>See the idea</em></span>
              </span>
              <span className={styles.directionCopy}><span><strong>{direction.title}</strong><small>{direction.description}</small></span><em>Gift idea</em></span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.disclosure}><span>✦</span><p><strong>Agents do the legwork. You stay in control.</strong> WanderWrap researches, compares and prepares the next step. You decide what feels right, and no purchase or recipient contact happens without your approval.</p></section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}><Link href="/"><Emblem size={32} /><span>WanderWrap</span></Link><p>AI agents for personal gifting—researching the right ideas while you keep the final say.</p></div>
          <div><h2>Platform</h2><Link href="/gift-finder">Gift Finder 🎁</Link><Link href="/teams">For Teams</Link><Link href="/connections">Connections</Link></div>
          <div><h2>WanderWrap</h2><Link href="/sign-in">Sign in</Link><a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/terms">Terms</a></div>
          <div className={styles.footerCta}><h2>Your next thoughtful gift</h2><p>Begin with the person, the occasion and the little things that make them special.</p><Link href="/gift-finder">Find a Gift <span>→</span></Link></div>
        </div>
        <div className={styles.footerBottom}><p>© {new Date().getFullYear()} WanderWrap. Make every gift feel personal.</p><p>Private by design · Every purchase is your decision</p></div>
      </footer>
      <Link className={styles.floatingCta} href="/gift-finder" data-analytics-event="landing_cta_clicked" data-analytics-placement="floating"> <span>🎁</span> Find a Gift</Link>
    </main>
  );
}

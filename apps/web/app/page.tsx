import Link from 'next/link';

const steps = [
  ['💌', 'Share a little clue', 'Start with a person and only the words or interests you are allowed to use.'],
  ['✨', 'Confirm what feels true', 'WanderWrap proposes possible interests. You decide what can shape the gift ideas.'],
  ['🎁', 'Choose with confidence', 'Compare a small, explainable shortlist, then continue to Amazon when you are ready.']
];

export default function HomePage() {
  return (
    <main>
      <div className="shell">
        <nav className="nav" aria-label="Primary navigation">
          <Link className="brand" href="/">wanderwrap <span aria-hidden="true">✦</span></Link>
          <div className="navLinks"><Link href="/connections">Connections</Link><a href="/api/auth/login">Sign in</a><Link className="navButton" href="/gift-finder">🎁 Gift Finder</Link></div>
        </nav>
        <section className="hero">
          <div className="heroCopy">
            <p className="eyebrow">✨ ONE THOUGHTFUL JOURNEY · EVERY CHANNEL</p>
            <h1>Remember the person. Find the gift.</h1>
            <p className="lede">Turn a few selected clues into gifts with a reason behind them—beautifully guided on the web and designed to continue with Alexa+.</p>
            <div className="actions"><Link className="primary" href="/gift-finder">Find their perfect gift 🎁</Link><a className="secondary" href="/api/auth/signup">Create your gift space</a></div>
            <p className="microcopy">No account needed to try · You control every clue · No automatic purchases</p>
          </div>
          <aside className="giftPreview" aria-label="Example recommendation conversation">
            <div className="previewSparkles" aria-hidden="true">✨</div>
            <div className="voiceOrb" aria-hidden="true"><span /><span /><span /></div>
            <p className="previewLabel">ALEXA+ WITH WANDERWRAP</p>
            <blockquote>“Help me surprise my partner. They love ceramics and slow Sunday mornings.”</blockquote>
            <div className="previewResult"><span>🏺</span><div><strong>A make-your-own ceramic cup</strong><small>Fits their confirmed creative side and love of calm rituals. You approve the Amazon handoff.</small></div></div>
            <Link className="previewTry" href="/gift-finder">See the agents at work →</Link>
          </aside>
        </section>
      </div>
      <section className="marquee" aria-label="Available and planned channels"><div>🌐 WEB <span>✦</span> 🔊 ALEXA+ <span>✦</span> ✈️ TELEGRAM <span>✦</span> 💬 MESSENGER <span>✦</span> 𝕏 X / TWITTER <span>✦</span> 📱 MOBILE</div></section>
      <section className="shell storySection">
        <div className="sectionHeading"><p className="eyebrow">LESS SEARCHING. MORE KNOWING.</p><h2>A delightful little path from “I should get something” to “this feels exactly right.”</h2></div>
        <div className="stepGrid">{steps.map((step, index) => <article className="stepCard" key={step[1]}><span className="stepEmoji">{step[0]}</span><small>0{index + 1}</small><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div>
      </section>
      <section className="connectionBand">
        <div className="shell connectionLayout"><div><p className="eyebrow light">YOUR CHANNELS, YOUR CHOICE</p><h2>Begin on the sofa. Continue on your phone.</h2></div><div><p>Your WanderWrap journey can move between web and Alexa+. Every future social or messaging channel is a separate permission—not an invitation to read someone’s private life.</p><Link className="creamButton" href="/connections">Explore connections</Link></div></div>
      </section>
      <section className="shell finalCta"><p className="eyebrow">💛 MAKE THOUGHTFUL FEEL EFFORTLESS</p><h2>Who would you love to surprise?</h2><Link className="primary" href="/gift-finder">Open the Gift Finder →</Link><p className="microcopy">The public preview uses fictional examples and deterministic gift data. Live Amazon links appear after Creators API credentials are connected.</p></section>
    </main>
  );
}

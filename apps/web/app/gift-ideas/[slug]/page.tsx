import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGiftIdea, giftIdeas } from '../gift-ideas';
import GiftIdeaStart from './gift-idea-start';
import styles from './page.module.css';

export function generateStaticParams() { return giftIdeas.map(item => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const idea = getGiftIdea((await params).slug);
  if (!idea) return {};
  return { title: idea.title, description: idea.description, alternates: { canonical: `/gift-ideas/${idea.slug}` }, openGraph: { title: `${idea.title} · WanderWrap`, description: idea.description, images: [idea.image] } };
}

export default async function GiftIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const idea = getGiftIdea((await params).slug);
  if (!idea) notFound();
  const related = giftIdeas.filter(item => item.slug !== idea.slug && item.kind === idea.kind).slice(0, 3);
  return <main className={styles.page}>
    <nav className={styles.nav}><Link href="/" className={styles.brand}>WanderWrap <span>✦</span></Link><div><Link href="/gift-finder">Gift Finder</Link><Link href="/sign-in">Sign in</Link></div></nav>
    <header className={styles.hero}>
      <div className={styles.image}><Image src={idea.image} alt="" fill priority sizes="(max-width: 800px) 100vw, 52vw" /></div>
      <div className={styles.copy}><p>{idea.kind === 'occasion' ? 'GIFTING MOMENT' : 'GIFT DIRECTION'} · {idea.label}</p><h1>{idea.title}</h1><strong>{idea.description}</strong><span>{idea.detail}</span><GiftIdeaStart prompt={idea.prompt} slug={idea.slug} /><small>WanderWrap will use this as a starting point, then ask about the person, budget and constraints before researching current options.</small></div>
    </header>
    <section className={styles.cues}><div><p>MAKE IT PERSONAL</p><h2>Give WanderWrap the details that change the answer.</h2></div><ol>{idea.cues.map((cue, index) => <li key={cue}><span>0{index + 1}</span>{cue}</li>)}</ol></section>
    <section className={styles.note}><span>✦</span><p><strong>Inspiration, not a fixed gift box.</strong> These images show a mood and direction. WanderWrap researches current products for the actual person, occasion and budget you share.</p></section>
    <section className={styles.related}><p>EXPLORE ANOTHER DIRECTION</p><div>{related.map(item => <Link href={`/gift-ideas/${item.slug}`} key={item.slug}><span><Image src={item.image} alt="" fill sizes="(max-width: 700px) 90vw, 30vw" /></span><strong>{item.title}</strong><small>{item.description}</small></Link>)}</div></section>
  </main>;
}

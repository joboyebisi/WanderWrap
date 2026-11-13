import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Unwrap a Gift',
  description: 'Open your private WanderWrap gift invitation and choose what happens next.'
};

export default function UnwrapPage() {
  return (
    <main className={`${styles.page} ${styles.unwrapPage}`}>
      <nav className={styles.unwrapNav} aria-label="Recipient navigation">
        <Link className={styles.wordmark} href="/" aria-label="WanderWrap home">
          <Image className={styles.emblem} src="/landing/wanderwrap-emblem.png" alt="" width={34} height={34} priority />
          <span>WanderWrap</span>
        </Link>
        <Link href="/gift-finder">Find a Gift</Link>
      </nav>
      <section className={styles.unwrapMain}>
        <div className={styles.unwrapCard}>
          <span className={styles.unwrapIcon} aria-hidden="true">💝</span>
          <p>A private gift moment</p>
          <h1>Something thoughtful is waiting.</h1>
          <p className={styles.unwrapLead}>Your secure gift invitation is the private link sent to you by the giver. Open that link from your message to reveal and respond to your gift—no account is required.</p>
          <div className={styles.unwrapSteps}>
            <p><span>01</span> Return to the email, message or invitation where your WanderWrap link arrived.</p>
            <p><span>02</span> Open the private link to see the gift chosen for you.</p>
            <p><span>03</span> Accept or decline privately. Delivery details are never shown to the sender.</p>
          </div>
          <Link className={styles.outlineButton} href="/">Return to WanderWrap</Link>
          <p className={styles.unwrapPrivacy}>Each invitation uses a unique, expiring claim link. WanderWrap cannot identify your gift without it.</p>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Sign in', description: 'Sign in securely to your WanderWrap gift space.', alternates: { canonical: '/sign-in' } };

export default function SignInPage() {
  return <main className={styles.page}>
    <nav><Link href="/">WanderWrap <span>✦</span></Link><Link href="/gift-finder">Continue as a guest</Link></nav>
    <section className={styles.card}>
      <div className={styles.mark}>WW</div><p>YOUR WANDERWRAP SPACE</p><h1>Welcome back.</h1><div className={styles.intro}>Sign in to return to your Gift Briefs, saved ideas and personal gifting workspace.</div>
      <a className={styles.google} href="/api/auth/login?provider=Google&returnTo=/account" data-analytics-event="auth_started" data-analytics-method="google"><span>G</span> Continue with Google</a>
      <a className={styles.email} href="/api/auth/login?returnTo=/account" data-analytics-event="auth_started" data-analytics-method="email">Continue with email</a>
      <div className={styles.newAccount}>New to WanderWrap? <a href="/api/auth/signup?returnTo=/account" data-analytics-event="auth_started" data-analytics-method="create_account">Create an account</a></div>
      <small>Secure sign-in is provided through WanderWrap’s protected authentication service. We never receive your Google password, and signing in does not connect contacts, messages or social feeds.</small>
    </section>
  </main>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleMark } from '../components/google-mark';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Sign in', description: 'Sign in securely to your WanderWrap gift space.', alternates: { canonical: '/sign-in' } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const authError = error ? authErrorMessage(error) : null;
  const googleAuthEnabled = process.env.NEXT_PUBLIC_WANDERWRAP_GOOGLE_AUTH_ENABLED !== 'false';
  return <main className={styles.page}>
    <nav><Link href="/">WanderWrap <span>✦</span></Link><Link href="/gift-finder">Continue as a guest</Link></nav>
    <section className={styles.card}>
      <Image className={styles.mark} src="/landing/wanderwrap-emblem.png" alt="" width={64} height={64} priority/><p>YOUR WANDERWRAP SPACE</p><h1>Welcome back.</h1><div className={styles.intro}>Sign in to return to your Gift Briefs, saved ideas and personal gifting workspace.</div>
      {authError && <div className={styles.authError} role="alert"><strong>{authError.title}</strong><span>{authError.message}</span></div>}
      {googleAuthEnabled && <a className={styles.google} href="/api/auth/login?provider=Google&returnTo=/account" data-analytics-event="auth_started" data-analytics-method="google"><GoogleMark/> Continue with Google</a>}
      <a className={styles.email} href="/api/auth/login?returnTo=/account" data-analytics-event="auth_started" data-analytics-method="email">Continue with email</a>
      <div className={styles.newAccount}>New to WanderWrap? <a href="/api/auth/signup?returnTo=/account" data-analytics-event="auth_started" data-analytics-method="create_account">Create an account</a></div>
      <details id="backup" className={styles.backup}><summary>Secure sign-in page not opening?</summary><p>Use the backup only when your network cannot resolve <strong>auth.wanderwrap.co.uk</strong>.</p><div>{googleAuthEnabled && <a href="/api/auth/login?provider=Google&returnTo=/account&domain=fallback">Backup Google sign-in</a>}<a href="/api/auth/login?returnTo=/account&domain=fallback">Backup email sign-in</a></div></details>
      <small>Secure sign-in is provided through WanderWrap’s protected authentication service. We never receive your Google password, and signing in does not connect contacts, messages or social feeds.</small>
    </section>
  </main>;
}

function authErrorMessage(error: string) {
  if (error === 'cancelled') return { title: 'Sign-in was cancelled.', message: 'Nothing changed. You can try Google again or continue with email.' };
  if (error === 'account_exists') return { title: 'This email already has a WanderWrap account.', message: 'Continue with email to use the existing account. Google was not linked or merged.' };
  if (error === 'invalid') return { title: 'Sign-in didn’t finish.', message: 'The secure sign-in link expired or could not be verified. Please start again.' };
  if (error === 'exchange') return { title: 'Sign-in didn’t finish.', message: 'The identity service could not complete this sign-in. Please try again.' };
  if (error === 'provider') return { title: 'Google sign-in didn’t finish.', message: 'The identity provider could not complete this request. You can try again or continue with email.' };
  return { title: 'Sign-in is temporarily unavailable.', message: 'Please try again in a moment.' };
}

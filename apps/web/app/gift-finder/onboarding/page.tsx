import type { Metadata } from 'next';
import Link from 'next/link';
import OnboardingGate from './onboarding-gate';
export const metadata:Metadata={title:'Save your Gift Brief',robots:{index:false,follow:false}};
export default function GiftFinderOnboardingPage(){return <main className="onboardingPage"><nav className="nav shell"><Link className="brand" href="/">wanderwrap <span>✦</span></Link><Link href="/gift-finder">Back to Wren</Link></nav><OnboardingGate/></main>;}

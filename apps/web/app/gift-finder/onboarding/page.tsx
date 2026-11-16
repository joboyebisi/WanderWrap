import type { Metadata } from 'next';
import OnboardingGate from './onboarding-gate';
import SiteHeader from '../../site-header';
export const metadata:Metadata={title:'Save your Gift Brief',robots:{index:false,follow:false}};
export default function GiftFinderOnboardingPage(){return <main className="onboardingPage"><SiteHeader/><OnboardingGate/></main>;}

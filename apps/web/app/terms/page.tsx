import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Terms of use', description: 'Terms for using WanderWrap and its Gift Finder.' };

export default function TermsPage() {
  return <main className="legalPage"><div className="legalShell"><nav><Link href="/">WanderWrap ✦</Link><Link href="/privacy">Privacy notice</Link></nav><header><p className="eyebrow">TRUST CENTRE</p><h1>Terms of use</h1><p>The practical rules for using WanderWrap responsibly.</p><small>Last updated 15 November 2026</small></header><article>
    <h2>What WanderWrap provides</h2><p>WanderWrap helps you build a Gift Brief, research options and decide what to do next. Until an end-to-end feature is expressly marked live, product links are external shopping-site handoffs: the retailer—not WanderWrap—sets the final price, availability, delivery, returns and checkout terms.</p>
    <h2>Your account</h2><p>Keep account access secure, provide accurate information and tell us promptly if you suspect misuse. You are responsible for activity performed through your account unless caused by our failure to protect it.</p>
    <h2>Information about other people</h2><p>Only provide recipient information you are entitled to use. Do not upload private messages, sensitive personal information, unlawful material or full social-account exports. You remain responsible for reviewing Gift Brief clues and recommendations.</p>
    <h2>Recommendations and prices</h2><p>Recommendations are decision support, not a guarantee that a recipient will like an item. Product facts can change. Confirm suitability, allergens, age restrictions, accessibility, price, delivery and return terms with the shopping site before purchasing.</p>
    <h2>Approvals and payments</h2><p>Nothing is purchased or sent merely because an agent recommends it. Any future WanderWrap purchase, payment, recipient contact or fulfilment action will require an explicit approval and will identify the provider responsible.</p>
    <h2>Acceptable use</h2><p>Do not probe or bypass security, automate abusive requests, impersonate others, infringe rights, misuse referral links or use the service to profile sensitive traits. We may restrict access to protect users and the service.</p>
    <h2>Availability and changes</h2><p>Early-access features may change, pause or be withdrawn. We aim to keep the service reliable but do not promise uninterrupted availability. Material term changes will be dated and, where appropriate, notified before taking effect.</p>
    <h2>Liability and governing terms</h2><p>Nothing in these terms excludes liability that cannot lawfully be excluded. Final business identity, governing-law, consumer-rights and dispute provisions must be reviewed by qualified UK counsel before paid launch; this early-access notice does not replace those required provisions.</p>
    <h2>Contact</h2><p>Questions can be sent to <a href="mailto:privacy@wanderwrap.co.uk">privacy@wanderwrap.co.uk</a>. This mailbox must be operational before public launch.</p>
  </article></div></main>;
}

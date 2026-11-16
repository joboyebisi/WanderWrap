'use client';

import { FormEvent, useState } from 'react';

const initial = { name: '', email: '', company: '', role: '', teamSize: '', region: '', useCase: '', message: '', contactConsent: false, marketingConsent: false };

export default function TeamEnquiryForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  function field(name: keyof typeof form, value: string | boolean) {
    setForm(current => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('sending'); setError('');
    try {
      const response = await fetch('/api/teams/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your enquiry.');
      setStatus('sent');
    } catch (value) {
      setError(value instanceof Error ? value.message : 'We could not send your enquiry.');
      setStatus('idle');
    }
  }

  if (status === 'sent') return <div className="teamEnquirySuccess"><span>✓</span><p className="eyebrow">ENQUIRY RECEIVED</p><h2>We’ll be in touch personally.</h2><p>Thank you for telling us what your team needs. We’ll review the brief and reply to your work email—no automated sales sequence.</p></div>;

  return <form className="teamEnquiryForm" onSubmit={submit}>
    <div className="teamFormIntro"><p className="eyebrow">PRIVATE EARLY-ACCESS CONVERSATION</p><h2>Tell us what thoughtful gifting needs to solve.</h2><p>Share enough for a useful first conversation. We’ll review it and a member of the WanderWrap team will reach out directly.</p></div>
    <div className="teamFormGrid">
      <label>Full name<input required autoComplete="name" value={form.name} onChange={e => field('name', e.target.value)} /></label>
      <label>Work email<input required type="email" autoComplete="email" value={form.email} onChange={e => field('email', e.target.value)} /></label>
      <label>Company<input required autoComplete="organization" value={form.company} onChange={e => field('company', e.target.value)} /></label>
      <label>Role<input required autoComplete="organization-title" value={form.role} onChange={e => field('role', e.target.value)} /></label>
      <label>Team size<select required value={form.teamSize} onChange={e => field('teamSize', e.target.value)}><option value="">Select</option><option>1–50</option><option>51–200</option><option>201–500</option><option>501–1,000</option><option>1,001+</option></select></label>
      <label>Primary region<select required value={form.region} onChange={e => field('region', e.target.value)}><option value="">Select</option><option>United Kingdom</option><option>Europe</option><option>United States & Canada</option><option>Middle East & Africa</option><option>Asia Pacific</option><option>Global</option></select></label>
      <label className="spanTwo">What are you planning?<select required value={form.useCase} onChange={e => field('useCase', e.target.value)}><option value="">Select the closest fit</option><option>Employee milestones</option><option>Recognition and rewards</option><option>Client and partner gifting</option><option>Seasonal campaigns</option><option>Multi-country gifting</option><option>Something else</option></select></label>
      <label className="spanTwo">What would make this work for your organisation?<textarea rows={5} maxLength={2000} value={form.message} onChange={e => field('message', e.target.value)} placeholder="Volumes, countries, timing, approval needs or the experience you want recipients to have." /></label>
    </div>
    <label className="teamConsent"><input required type="checkbox" checked={form.contactConsent} onChange={e => field('contactConsent', e.target.checked)} /><span>I agree that WanderWrap may use these details to respond to this enquiry.</span></label>
    <label className="teamConsent optional"><input type="checkbox" checked={form.marketingConsent} onChange={e => field('marketingConsent', e.target.checked)} /><span>Also send occasional product and early-access updates. Optional.</span></label>
    {error && <p className="teamFormError" role="alert">{error}</p>}
    <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Request an executive conversation →'}</button>
    <small>We use your details only for this enquiry unless you separately choose updates. Read our <a href="/privacy">privacy notice</a>.</small>
  </form>;
}

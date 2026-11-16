'use client';
import { FormEvent, useState } from 'react';
export default function FullServiceOptIn({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail); const [agreed, setAgreed] = useState(false); const [message, setMessage] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!agreed) return; setMessage('Saving…'); const response = await fetch('/api/core/marketing/preferences', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, fullServiceWaitlist: true, source: 'recommendations' }) }); setMessage(response.ok ? 'You’re on the list. We’ll only email you about this launch.' : 'We could not save that yet. Please try again.'); };
  return <form className="fullServiceOptIn" onSubmit={submit}><label><span>Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com"/></label><label className="optInCheck"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} required/><span>Email me when full service opens.</span></label><button type="submit">Notify me</button><small aria-live="polite">{message}</small></form>;
}

'use client';

import { useEffect, useState } from 'react';
type User = { id: string; email: string; enabled: boolean; status?: string; createdAt?: string };
export default function AdminWorkspace() {
  const [state, setState] = useState<{ loading: boolean; forbidden: boolean; users: User[] }>({ loading: true, forbidden: false, users: [] });
  useEffect(() => { void fetch('/api/core/admin/users', { cache: 'no-store' }).then(async response => setState({ loading: false, forbidden: response.status === 403 || response.status === 401, users: response.ok ? (await response.json()).users : [] })); }, []);
  if (state.loading) return <section className="shell adminSpace"><p>Verifying administrator access…</p></section>;
  if (state.forbidden) return <section className="shell adminSpace"><p className="eyebrow">ROLE-GATED ADMINISTRATION</p><h1>Administrator access required.</h1><p>This console is available only to members of the Cognito <code>wanderwrap-admins</code> group.</p></section>;
  return <section className="shell adminSpace"><header><p className="eyebrow">WANDERWRAP OPERATIONS</p><h1>Account health.</h1><p>This first release is deliberately read-only. Destructive account actions remain in audited AWS administration until approval, reason capture and recovery controls are implemented.</p></header><div className="adminSummary"><strong>{state.users.length}</strong><span>accounts visible in this page</span></div><div className="adminTable" role="table" aria-label="WanderWrap accounts"><div role="row"><strong>Email</strong><strong>Status</strong><strong>Created</strong></div>{state.users.map(user => <div role="row" key={user.id}><span>{user.email || 'Email unavailable'}</span><span>{user.enabled ? user.status || 'Enabled' : 'Disabled'}</span><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></div>)}</div></section>;
}

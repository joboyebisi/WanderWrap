'use client';

import { useEffect, useState } from 'react';

type User = { id: string; email: string; enabled: boolean; status?: string; createdAt?: string };
type Campaign = { id: string; market: string; region: string; window: string; themes: string[]; audienceRule: string; compliance: string; deliveryStatus: string };
type Agent = { id: string; name: string; autonomy: string; responsibility: string; approval: string };
type Operations = { mode: string; gates: Record<string, boolean>; campaigns: Campaign[]; agents: Agent[]; approvalPolicy: string };

export default function AdminWorkspace() {
  const [state, setState] = useState<{ loading: boolean; forbidden: boolean; users: User[]; operations?: Operations }>({ loading: true, forbidden: false, users: [] });

  useEffect(() => {
    void Promise.all([
      fetch('/api/core/admin/users', { cache: 'no-store' }),
      fetch('/api/core/admin/operations', { cache: 'no-store' })
    ]).then(async ([usersResponse, operationsResponse]) => {
      const forbidden = [usersResponse.status, operationsResponse.status].some(status => status === 401 || status === 403);
      setState({
        loading: false,
        forbidden,
        users: usersResponse.ok ? (await usersResponse.json()).users : [],
        operations: operationsResponse.ok ? await operationsResponse.json() : undefined
      });
    });
  }, []);

  if (state.loading) return <section className="shell adminSpace"><p>Verifying administrator access…</p></section>;
  if (state.forbidden) return <section className="shell adminSpace"><p className="eyebrow">ROLE-GATED ADMINISTRATION</p><h1>Administrator access required.</h1><p>This console is available only to members of the Cognito <code>wanderwrap-admins</code> group.</p></section>;

  const operations = state.operations;
  return <section className="shell adminSpace">
    <header><p className="eyebrow">WANDERWRAP OPERATIONS</p><h1>Launch control.</h1><p>A read-only view of account health, regional campaign readiness and bounded agent responsibilities. Publishing, sending and account mutations remain approval-gated and audited.</p></header>

    <div className="adminSummary"><strong>{state.users.length}</strong><span>accounts visible in this page</span><em>{operations?.mode === 'limited-production' ? 'Limited production' : 'Safe draft mode'}</em></div>

    {operations && <>
      <section className="adminPanel" aria-labelledby="email-readiness"><div className="adminPanelHead"><div><p className="eyebrow">COMMUNICATIONS</p><h2 id="email-readiness">Email readiness</h2></div><p>Every launch gate must be healthy before a regional audience becomes send-eligible.</p></div><div className="readinessGrid">{Object.entries(operations.gates).map(([gate, ready]) => <article key={gate} className={ready ? 'ready' : 'blocked'}><span aria-hidden="true">{ready ? '✓' : '—'}</span><strong>{gateLabel(gate)}</strong><small>{ready ? 'Ready' : 'Not enabled'}</small></article>)}</div></section>

      <section className="adminPanel" aria-labelledby="campaigns"><div className="adminPanelHead"><div><p className="eyebrow">NOVEMBER–DECEMBER</p><h2 id="campaigns">Regional campaigns</h2></div><p>Audience membership is consent-based and market-specific. Location never implies an observance.</p></div><div className="campaignGrid">{operations.campaigns.map(campaign => <article key={campaign.id}><header><span>{campaign.market}</span><div><h3>{campaign.region}</h3><small>{campaign.window}</small></div></header><p>{campaign.themes.join(' · ')}</p><dl><div><dt>Audience</dt><dd><code>{campaign.audienceRule}</code></dd></div><div><dt>Delivery</dt><dd>{campaign.deliveryStatus.replaceAll('-', ' ')}</dd></div><div><dt>Compliance</dt><dd>{campaign.compliance}</dd></div></dl></article>)}</div></section>

      <section className="adminPanel" aria-labelledby="agents"><div className="adminPanelHead"><div><p className="eyebrow">AGENT OPERATIONS</p><h2 id="agents">Bounded automation</h2></div><p>{operations.approvalPolicy}</p></div><div className="agentGrid">{operations.agents.map(agent => <article key={agent.id}><div><strong>{agent.name}</strong><span>{agent.autonomy}</span></div><p>{agent.responsibility}</p><small>{agent.approval}</small></article>)}</div></section>
    </>}

    <section className="adminPanel" aria-labelledby="accounts"><div className="adminPanelHead"><div><p className="eyebrow">IDENTITY</p><h2 id="accounts">Accounts</h2></div><p>Read-only. Sensitive support actions stay in the audited AWS runbook.</p></div><div className="adminTable" role="table" aria-label="WanderWrap accounts"><div role="row"><strong>Email</strong><strong>Status</strong><strong>Created</strong></div>{state.users.map(user => <div role="row" key={user.id}><span>{user.email || 'Email unavailable'}</span><span>{user.enabled ? user.status || 'Enabled' : 'Disabled'}</span><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></div>)}</div></section>
  </section>;
}

function gateLabel(value: string) {
  return ({ transactionalEmail: 'Transactional email', lifecycleQueue: 'Lifecycle queue', loopsSecret: 'Loops credential', loopsSending: 'Lifecycle sending' } as Record<string, string>)[value] || value;
}

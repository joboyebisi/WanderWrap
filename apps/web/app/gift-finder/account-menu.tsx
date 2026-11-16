'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type User = { displayName?: string; handle?: string };
const ACCOUNT_ITEMS = [
  ['📝', 'Gift Briefs', '/account', 'Saved'],
  ['💝', 'Saved items', '/wishlist', 'Wishlist'],
  ['👥', 'People & contacts', '/account#people', 'Coming next'],
  ['🔗', 'Connections', '/connections', 'Manage'],
  ['📅', 'Occasions', '/account#occasions', 'Coming next'],
  ['💳', 'Payments', '/account#payments', 'Not enabled']
] as const;

export default function AccountMenu({ displayName }: { displayName?: string }) {
  const [open, setOpen] = useState(false); const [user, setUser] = useState<User | null | undefined>(undefined); const drawerRef = useRef<HTMLElement>(null);
  useEffect(() => { void fetch('/api/auth/session', { cache: 'no-store' }).then(response => response.json()).then(session => setUser(session.authenticated ? session.user : null)).catch(() => setUser(null)); }, []);
  useEffect(() => { if (!open) return; const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); if (event.key === 'Tab' && drawerRef.current) trapFocus(event, drawerRef.current); }; document.addEventListener('keydown', key); document.body.classList.add('menuOpen'); return () => { document.removeEventListener('keydown', key); document.body.classList.remove('menuOpen'); }; }, [open]);
  const name = displayName || user?.displayName || user?.handle?.split('#')[0] || 'Your gift space';
  return <><button className="accountMenuButton" type="button" aria-label="Open navigation and account menu" aria-expanded={open} aria-controls="wanderwrap-menu" onClick={() => setOpen(true)}><span>Account</span><i aria-hidden="true"><b/><b/><b/></i></button>{open && <div className="accountDrawerLayer" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}><aside id="wanderwrap-menu" ref={drawerRef} className="accountDrawer" role="dialog" aria-modal="true" aria-labelledby="account-menu-title"><header><div className="agentAvatar">WW</div><div><small>{user ? 'WANDERWRAP ACCOUNT' : 'WANDERWRAP'}</small><strong id="account-menu-title">{user ? name : 'Find something thoughtful'}</strong></div><button autoFocus type="button" aria-label="Close menu" onClick={() => setOpen(false)}>×</button></header><nav aria-label="Menu"><ul className="drawerPrimary"><li><Link href="/" onClick={() => setOpen(false)}>Home</Link></li><li><Link href="/gift-finder" onClick={() => setOpen(false)}>Gift Finder</Link></li><li><Link href="/teams" onClick={() => setOpen(false)}>For Teams</Link></li></ul>{user ? <ul className="drawerAccount">{ACCOUNT_ITEMS.map(([icon, label, href, status]) => <li key={label}><Link href={href} onClick={() => setOpen(false)}><span>{icon}</span><strong>{label}</strong><small>{status}</small></Link></li>)}</ul> : <div className="drawerGuest"><p>Sign in to keep Gift Briefs and saved finds across devices.</p><Link className="primary" href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link><a href="/api/auth/signup?returnTo=/account">Create account</a></div>}</nav><div className="drawerTruth"><strong>Built around your permission.</strong><p>Contacts, birthdays, messages and feeds always require a separate connection and consent.</p></div>{user && <form action="/api/auth/logout" method="post"><button className="drawerSignout" type="submit">Sign out</button></form>}</aside></div>}</>;
}

function trapFocus(event: KeyboardEvent, container: HTMLElement) { const items = Array.from(container.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled])')); if (!items.length) return; const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }

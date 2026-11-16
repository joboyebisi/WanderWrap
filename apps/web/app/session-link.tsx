'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SessionLink({ compact = false }: { compact?: boolean }) {
  const [user, setUser] = useState<{ displayName?: string; handle?: string } | null>(null);
  useEffect(() => { void fetch('/api/auth/session', { cache: 'no-store' }).then(response => response.json()).then(session => setUser(session.authenticated ? session.user : null)).catch(() => undefined); }, []);
  return user ? <Link href="/account">{compact ? 'Gift space' : `Hi, ${user.displayName || user.handle?.split('#')[0] || 'gifter'}`}</Link> : <Link href="/sign-in" data-analytics-event="auth_page_opened">Sign in</Link>;
}

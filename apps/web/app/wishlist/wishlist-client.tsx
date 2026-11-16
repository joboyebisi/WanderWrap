'use client';
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SavedItem = { productId: string; title: string; imageUrl?: string; merchant?: string; category?: string; createdAt: string };

export default function WishlistClient() {
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  useEffect(() => { void fetch('/api/core/saved-items', { cache: 'no-store' }).then(async response => { if (response.status === 401) setSignedOut(true); setItems(response.ok ? await response.json() : []); }); }, []);
  const remove = async (productId: string) => { const response = await fetch(`/api/core/saved-items/${encodeURIComponent(productId)}`, { method: 'DELETE' }); if (response.ok) setItems(current => current?.filter(item => item.productId !== productId) || []); };
  if (items === null) return <section className="shell emptyWishlist"><p>Opening your saved items…</p></section>;
  if (!items.length) return <section className="shell emptyWishlist"><span>💝</span><p className="eyebrow">SAVED ITEMS</p><h1>{signedOut ? 'Sign in to see your saved finds.' : 'Your wishlist is ready for its first find.'}</h1><p>{signedOut ? 'Your saved products are attached to your WanderWrap account.' : 'Tap the heart on any recommendation to keep it here across devices.'}</p><Link className="primary" href={signedOut ? '/sign-in' : '/gift-finder'}>{signedOut ? 'Sign in' : 'Find a thoughtful gift'}</Link></section>;
  return <section className="shell wishlistSpace"><header><p className="eyebrow">SAVED ITEMS</p><h1>Your thoughtful finds.</h1><p>Saved product references are durable. Price, availability and checkout are always reconfirmed with the shopping site.</p></header><div className="wishlistGrid">{items.map(item => <article key={item.productId}>{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="wishlistPlaceholder">🎁</div>}<small>{item.merchant || 'Shopping site'}</small><h2>{item.title}</h2>{item.category && <p>{item.category}</p>}<button type="button" onClick={() => void remove(item.productId)}>Remove</button></article>)}</div><Link className="primary" href="/gift-finder?new=1">＋ Start a new conversation</Link></section>;
}

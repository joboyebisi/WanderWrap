'use client';
import Link from 'next/link';
export default function WishlistClient(){return <section className="shell emptyWishlist"><span>💝</span><p className="eyebrow">SAVED ITEMS</p><h1>Your wishlist is ready for its first find.</h1><p>The shortlist heart control is a preview in this release. Cloud-synced saved items will activate after the account data boundary and deletion/export controls pass their release checks.</p><Link className="primary" href="/gift-finder">Find a thoughtful gift</Link></section>;}

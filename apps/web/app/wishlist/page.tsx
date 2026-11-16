import Link from 'next/link';
import WishlistClient from './wishlist-client';
export default function WishlistPage(){return <main className="accountPage"><nav className="nav shell"><Link className="brand" href="/">wanderwrap <span>✦</span></Link><Link href="/gift-finder/recommendations">Back to shortlist</Link></nav><WishlistClient/></main>;}

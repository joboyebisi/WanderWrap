import Link from 'next/link';
import BriefWorkspace from './workspace';

export default async function SavedBriefPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <main className="accountPage"><nav className="nav shell"><Link className="brand" href="/">wanderwrap <span>✦</span></Link><Link href="/account">Back to gift space</Link></nav><BriefWorkspace id={id}/></main>; }

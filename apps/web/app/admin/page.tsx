import Link from 'next/link';
import AdminWorkspace from './workspace';

export default function AdminPage() { return <main className="accountPage"><nav className="nav shell"><Link className="brand" href="/">wanderwrap <span>✦</span></Link><Link href="/account">Back to account</Link></nav><AdminWorkspace/></main>; }

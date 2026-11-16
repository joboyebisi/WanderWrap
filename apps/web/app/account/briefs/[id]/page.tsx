import BriefWorkspace from './workspace';
import SiteHeader from '../../../site-header';

export default async function SavedBriefPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <main className="accountPage"><SiteHeader/><BriefWorkspace id={id}/></main>; }

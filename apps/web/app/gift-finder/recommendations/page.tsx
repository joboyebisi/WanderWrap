import type { Metadata } from 'next';
import Link from 'next/link';
import RecommendationWorkspace from './recommendation-workspace';
export const metadata:Metadata={title:'Your gift shortlist',description:'Compare the current gifts Wren researched for your Gift Brief.',robots:{index:false,follow:false}};
export default function RecommendationsPage(){return <main className="recommendationsPage"><nav className="nav shell"><Link className="brand" href="/">wanderwrap <span>✦</span></Link><div className="resultsNavLabel">Wren’s shortlist</div></nav><RecommendationWorkspace/></main>;}

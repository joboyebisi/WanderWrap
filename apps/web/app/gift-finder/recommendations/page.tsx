import type { Metadata } from 'next';
import RecommendationWorkspace from './recommendation-workspace';
import SiteHeader from '../../site-header';
export const metadata:Metadata={title:'Your gift shortlist',description:'Compare the current gifts WanderWrap researched for your Gift Brief.',robots:{index:false,follow:false}};
export default function RecommendationsPage(){return <main className="recommendationsPage"><SiteHeader/><RecommendationWorkspace/></main>;}

import Link from 'next/link';
import AlexaSimulator from './simulator';
import SiteHeader from '../site-header';

export default function SimulatorPage() {
  return <main className="dashboard"><SiteHeader/><div className="shell">
    <header className="pageIntro simulatorIntro"><p className="eyebrow">AUTHENTICATED ALEXA+ JOURNEY DEMO</p><h1>See the conversation and the tools behind it.</h1><p className="lede">This browser simulator calls WanderWrap’s protected MCP service as the signed-in user. It demonstrates the intended Alexa+ journey; it is not Amazon’s Web Simulator and it cannot purchase anything.</p></header>
    <AlexaSimulator /></div>
  </main>;
}

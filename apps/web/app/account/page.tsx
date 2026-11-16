import Link from 'next/link';
import AccountMenu from '../gift-finder/account-menu';
import AccountWorkspace from './account-workspace';
export default function AccountPage(){return <main className="accountPage"><nav className="nav shell"><Link className="brand" href="/">wanderwrap <span>✦</span></Link><AccountMenu/></nav><AccountWorkspace/></main>;}

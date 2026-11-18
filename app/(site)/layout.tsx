import './site.css';
import './site-a.css';
import './site-b.css';
import './site-c.css';
import './site-v2.css';
import './site-v3.css';
import './site-mkt.css';
import './site-home.css';
import { SiteFrame } from '@/components/site/SiteFrame';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}

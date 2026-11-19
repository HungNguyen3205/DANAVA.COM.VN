import './site.css';
import './site-a.css';
import './site-b.css';
import './site-c.css';
import './site-v2.css';
import './site-v3.css';
import './site-mkt.css';
import './site-home.css';
import './site-theme.css';
import './site-app.css';
import './site-upgrade.css';
import { SiteFrame } from '@/components/site/SiteFrame';
import { siteFont } from '@/lib/site-font';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={siteFont.variable} style={{ display: 'contents' }}>
      <SiteFrame>{children}</SiteFrame>
    </div>
  );
}

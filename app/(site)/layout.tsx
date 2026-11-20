import '../fonts.css';
import './site.css';
import './site-a.css';
import './site-b.css';
import './site-c.css';
import './site-v2.css';
import './site-v3.css';
import './site-home.css';
import './site-theme.css';
import './site-app.css';
import './site-upgrade.css';
import './site-identity.css';
import './site-studio.css';
import './site-ecosystem.css';
import './site-partners.css';
import './site-products.css';
import './site-blog.css';
import './site-home2.css';
import './site-home3.css';
import './site-mobile.css';
import './site-headings.css';
import { SiteFrame } from '@/components/site/SiteFrame';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}

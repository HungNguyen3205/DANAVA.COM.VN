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
import './site-shell.css';
import './site-anna.css';
import './site-solutions.css';
import './site-megamenu.css';
import './site-header.css';
import './site-landing.css';
import './site-buttons.css';
import './site-quote.css';
import './site-quote-chat.css';
import './site-services.css';
import './site-gym.css';
import './site-mau.css';
import { SiteFrame } from '@/components/site/SiteFrame';
import { CmsOverlay } from '@/components/site/CmsOverlay';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // CmsOverlay chỉ hoạt động khi trang mở trong trình chỉnh sửa của admin (iframe + ?cms=1)
  return <SiteFrame>{children}<CmsOverlay /></SiteFrame>;
}

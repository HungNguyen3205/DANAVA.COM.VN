import { Be_Vietnam_Pro } from 'next/font/google';
import './site.css';
import './site-a.css';
import './site-b.css';
import './site-c.css';
import './site-v2.css';
import './site-v3.css';
import './site-mkt.css';
import './site-home.css';
import './site-theme.css';
import { SiteFrame } from '@/components/site/SiteFrame';

// Font chính của DANAVA Studio; next/font tải về lúc build và tự phục vụ, trình duyệt không gọi Google.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bvp'
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={beVietnamPro.variable} style={{ display: 'contents' }}>
      <SiteFrame>{children}</SiteFrame>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Header, Footer, MobileBar, QuickContact } from '../Shell';

/** Khung chung của website công khai: skip link, header, nội dung, footer. */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="s-app">
      <div className="s-blobs" aria-hidden="true"><span /><span /><span /></div>
      <a className="s-skip" href="#main">Đến nội dung chính</a>
      <Header />
      {children}
      <Footer />
      <MobileBar />
      <QuickContact />
    </div>
  );
}

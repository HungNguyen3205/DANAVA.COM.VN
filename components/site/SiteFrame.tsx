import type { ReactNode } from 'react';
import { Header, Footer, MobileBar } from '../Shell';

/** Khung chung của website công khai: skip link, header, nội dung, footer. */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="s-app">
      <a className="s-skip" href="#main">Đến nội dung chính</a>
      <Header />
      {children}
      <Footer />
      <MobileBar />
    </div>
  );
}

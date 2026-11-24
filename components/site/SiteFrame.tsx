import type { ReactNode } from 'react';
import { Header, Footer, MobileBar } from '../Shell';
import { ContactDock } from './ContactDock';
import { AnnaProvider } from './anna/AnnaProvider';
import { AnnaLauncher } from './anna/AnnaEntry';
import { CmsStyles } from './CmsStyles';

/** Khung chung của website công khai: skip link, header, nội dung, footer. */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="s-app">
      <div className="s-blobs" aria-hidden="true"><span /><span /><span /></div>
      <a className="s-skip" href="#main">Đến nội dung chính</a>
      <AnnaProvider>
        <Header />
        {children}
        <Footer />
        <MobileBar />
        <ContactDock />
        <AnnaLauncher />
        <CmsStyles />
      </AnnaProvider>
    </div>
  );
}

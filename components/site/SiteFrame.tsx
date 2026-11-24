import type { ReactNode } from 'react';
import { Header, Footer, MobileBar } from '../Shell';
import { ContactDock } from './ContactDock';
import { AnnaProvider } from './anna/AnnaProvider';
import { AnnaLauncher } from './anna/AnnaEntry';
import { CmsStyles } from './CmsStyles';
import { ct } from './cms';
import { getSiteContent } from '@/lib/database';
import { LocaleLinks } from './LangSwitch';

/** Khung chung của website công khai: skip link, header, nội dung, footer. */
/** Khung chung (máy chủ): tự đọc dữ liệu trang vì layout được render song song với layout gốc (không chờ kho của yêu cầu). */
export async function SiteFrame({ children }: { children: ReactNode }) {
  const { data } = await getSiteContent();
  const skip = ct(data, 'shared.skip', 'Đến nội dung chính', 'Liên kết bỏ qua menu (bàn phím)', { scope: 'global' });
  return (
    <div className="s-app">
      <div className="s-blobs" aria-hidden="true"><span /><span /><span /></div>
      <a className="s-skip" href="#main" data-lang-keep><span {...skip.a}>{skip.v}</span></a>
      <AnnaProvider>
        <Header />
        {children}
        <Footer />
        <MobileBar />
        <ContactDock />
        <AnnaLauncher />
        <CmsStyles />
        <LocaleLinks />
      </AnnaProvider>
    </div>
  );
}

import Link from 'next/link';
import { Check } from 'lucide-react';
import { seo } from '@/lib/seo';
import { CONTACT } from '@/components/site/catalog';

export const metadata = {
  ...seo('Cảm ơn bạn đã gửi yêu cầu báo giá', 'Chúng tôi đã nhận phiếu thiết kế landing page của bạn.', '/bao-gia-web/cam-on/'),
  robots: { index: false, follow: false }
};

export default function Page() {
  return (
    <main id="main" className="wq-page">
      <section className="wq-body">
        <div className="s-container">
          <div className="qc-done" role="status">
            <span className="qc-done__ico" aria-hidden="true"><Check /></span>
            <h1>Cảm ơn bạn! Phiếu đã được gửi.</h1>
            <p>Chuyên viên DANAVA sẽ đọc phiếu, xác nhận phạm vi và gửi báo giá chính thức cho bạn qua số điện thoại hoặc email đã cung cấp.</p>
            <p>Cần trao đổi gấp? Gọi <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a> hoặc nhắn Zalo.</p>
            <div className="qc-done__actions">
              <Link className="qc__btn" href="/">Về trang chủ</Link>
              <Link className="qc__btn qc__btn--ghost" href="/bao-gia-web/">Báo giá khác</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { QuoteChat } from '@/components/site/QuoteChat';

export const generateMetadata = seoPage('/bao-gia-web/');

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Báo giá landing page và website', href: '/bao-gia-web/' }])} />
      <main id="main" className="wq-page">
        <section className="wq-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Báo giá landing page' }]} />
            <p className="wq-kicker">Phiếu thiết kế landing page</p>
            <h1 className="wq-title">Trò chuyện cùng DANAVA để <span>nhận báo giá</span> landing page</h1>
            <p className="wq-lead">Trợ lý sẽ hỏi lần lượt về thương hiệu, mục tiêu, khách hàng và phong cách. Khoảng giá tham khảo hiện ở bên phải và cập nhật theo lựa chọn của bạn. Chuyên viên DANAVA sẽ xác nhận báo giá chính thức.</p>
          </div>
        </section>
        <section className="wq-body">
          <div className="s-container">
            <QuoteChat />
          </div>
        </section>
      </main>
    </>
  );
}

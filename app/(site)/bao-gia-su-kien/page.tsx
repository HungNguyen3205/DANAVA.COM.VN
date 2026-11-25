import { breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { QuoteChat } from '@/components/site/QuoteChat';

export const generateMetadata = seoPage('/bao-gia-su-kien/');

/** Dịch vụ → Báo giá tổ chức sự kiện: phiếu hội thoại (QuoteChat flow "events", lib/event-brief.ts). */
export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Báo giá tổ chức sự kiện', href: '/bao-gia-su-kien/' }])} />
      <main id="main" className="wq-page">
        <section className="wq-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Báo giá tổ chức sự kiện' }]} />
            <p className="wq-kicker">Phiếu tổ chức sự kiện</p>
            <h1 className="wq-title">Kể về sự kiện của bạn để <span>nhận báo giá</span> tham khảo</h1>
            <p className="wq-lead">Trợ lý hỏi lần lượt về loại sự kiện, quy mô, hạng mục và ngân sách. Khoảng chi phí tham khảo hiện ở bên phải và cập nhật theo lựa chọn của bạn. Chuyên viên DANAVA sẽ xác nhận báo giá chính thức.</p>
          </div>
        </section>
        <section className="wq-body">
          <div className="s-container">
            <QuoteChat flow="events" />
          </div>
        </section>
      </main>
    </>
  );
}

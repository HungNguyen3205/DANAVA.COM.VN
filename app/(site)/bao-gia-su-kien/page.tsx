import { breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { QuoteChat } from '@/components/site/QuoteChat';
import { ct } from '@/components/site/cms';
import { getSiteContent } from '@/lib/database';

export const generateMetadata = seoPage('/bao-gia-su-kien/');

/** Dịch vụ → Báo giá tổ chức sự kiện: phiếu hội thoại (QuoteChat flow "events", lib/event-brief.ts). */
export default async function Page() {
  const { data } = await getSiteContent();
  const k = ct(data, 'quote-event.kicker', 'Phiếu tổ chức sự kiện', 'Dòng chữ nhỏ (trang báo giá)');
  const t1 = ct(data, 'quote-event.title1', 'Kể với ANNA về sự kiện của bạn để ', 'Tiêu đề (phần đầu)');
  const t2 = ct(data, 'quote-event.title2', 'nhận báo giá', 'Tiêu đề (chữ cam)');
  const t3 = ct(data, 'quote-event.title3', ' tham khảo', 'Tiêu đề (phần cuối)');
  const lead = ct(data, 'quote-event.lead', 'ANNA (bé Mây) hỏi lần lượt về loại sự kiện, quy mô, hạng mục và ngân sách ngay trong khung chat. Khoảng chi phí tham khảo hiện trên trang và cập nhật theo lựa chọn của bạn. Chuyên viên DANAVA sẽ xác nhận báo giá chính thức.', 'Đoạn giới thiệu (trang báo giá)', { multiline: true });
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Báo giá tổ chức sự kiện', href: '/bao-gia-su-kien/' }])} />
      <main id="main" className="wq-page">
        <section className="wq-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Báo giá tổ chức sự kiện' }]} />
            <p className="wq-kicker"><span {...k.a}>{k.v}</span></p>
            <h1 className="wq-title"><span {...t1.a}>{t1.v}</span><span className="wq-hl" {...t2.a}>{t2.v}</span><span {...t3.a}>{t3.v}</span></h1>
            <p className="wq-lead"><span {...lead.a}>{lead.v}</span></p>
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

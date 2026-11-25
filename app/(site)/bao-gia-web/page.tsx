import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { QuoteChat } from '@/components/site/QuoteChat';
import { ct } from '@/components/site/cms';
import { getSiteContent } from '@/lib/database';

export const generateMetadata = seoPage('/bao-gia-web/');

export default async function Page() {
  const { data } = await getSiteContent();
  const k = ct(data, 'quote-web.kicker', 'Phiếu thiết kế landing page', 'Dòng chữ nhỏ (trang báo giá)');
  const t1 = ct(data, 'quote-web.title1', 'Trò chuyện cùng ANNA để ', 'Tiêu đề (phần đầu)');
  const t2 = ct(data, 'quote-web.title2', 'nhận báo giá', 'Tiêu đề (chữ cam)');
  const t3 = ct(data, 'quote-web.title3', ' landing page', 'Tiêu đề (phần cuối)');
  const lead = ct(data, 'quote-web.lead', 'ANNA (bé Mây) hỏi lần lượt về thương hiệu, mục tiêu, khách hàng và phong cách ngay trong khung chat. Khoảng giá tham khảo hiện trên trang và cập nhật theo lựa chọn của bạn. Chuyên viên DANAVA sẽ xác nhận báo giá chính thức.', 'Đoạn giới thiệu (trang báo giá)', { multiline: true });
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Báo giá landing page và website', href: '/bao-gia-web/' }])} />
      <main id="main" className="wq-page">
        <section className="wq-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Báo giá landing page' }]} />
            <p className="wq-kicker"><span {...k.a}>{k.v}</span></p>
            <h1 className="wq-title"><span {...t1.a}>{t1.v}</span><span className="wq-hl" {...t2.a}>{t2.v}</span><span {...t3.a}>{t3.v}</span></h1>
            <p className="wq-lead"><span {...lead.a}>{lead.v}</span></p>
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

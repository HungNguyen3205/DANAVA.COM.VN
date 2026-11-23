import { seo, breadcrumbLD } from '@/lib/seo';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { WebQuote } from '@/components/site/WebQuote';

export const metadata = seo(
  'Báo giá thiết kế landing page và website',
  'Điền yêu cầu để nhận báo giá tham khảo thiết kế landing page hoặc website doanh nghiệp tại DANAVA.',
  '/bao-gia-web/'
);

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Báo giá landing page và website', href: '/bao-gia-web/' }])} />
      <main id="main" className="wq-page">
        <section className="wq-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Báo giá landing page và website' }]} />
            <p className="wq-kicker">Báo giá tham khảo</p>
            <h1 className="wq-title">Báo giá <span>landing page</span> và <span>website</span></h1>
            <p className="wq-lead">Trả lời vài câu hỏi ngắn để chúng tôi hiểu nhu cầu của bạn. Khoảng giá sẽ hiện ngay bên phải, và chuyên viên sẽ xác nhận báo giá chính thức.</p>
          </div>
        </section>
        <section className="wq-body">
          <div className="s-container">
            <WebQuote />
          </div>
        </section>
      </main>
    </>
  );
}

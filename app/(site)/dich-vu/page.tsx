import Link from 'next/link';
import { ArrowRight, CalendarDays, Megaphone, MonitorSmartphone, Plane } from 'lucide-react';
import { seo, breadcrumbLD } from '@/lib/seo';
import { JsonLd } from '@/components/site/blocks';
import { DichVuAsk } from '@/components/site/DichVuAsk';
import { Crumbs, CtaBand } from '@/components/site/ui';
import { DICH_VU } from '@/lib/dich-vu';
import { getSiteContent } from '@/lib/database';
import { ct } from '@/components/site/cms';

export const metadata = seo(
  'Dịch vụ: truyền thông, landing page, sự kiện và du lịch',
  'Dịch vụ của DANAVA ngoài phần mềm: truyền thông nội dung, thiết kế landing page, tổ chức sự kiện và du lịch trải nghiệm.',
  '/dich-vu/'
);

const ICONS = [Megaphone, MonitorSmartphone, CalendarDays, Plane];

export default async function Page() {
  const { data } = await getSiteContent();
  /** Chữ sửa được trong trình biên tập (khóa services.*). */
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `services.${k}`, def, label, opts);
  const T = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return <span {...x.a}>{x.v}</span>; };
  const P = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return { ...x.a, children: x.v }; };
  const title = t('hero.title', 'Đồng hành cùng *thương hiệu* của bạn', 'Tiêu đề trang', { rich: true });
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dịch vụ', href: '/dich-vu/' }])} />
      <main id="main" className="svc">
        <section className="svc-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Dịch vụ' }]} />
            <p className="svc-kicker" {...P('hero.kicker', 'Dịch vụ DANAVA', 'Nhãn nhỏ')} />
            <h1 className="svc-title" {...title.a}>{title.v.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 ? <span key={i}>{part}</span> : part))}</h1>
            <p className="svc-lead" {...P('hero.lead', 'Truyền thông, landing page, sự kiện và hành trình trải nghiệm: những dịch vụ DANAVA triển khai trọn gói, ngoài các sản phẩm phần mềm.', 'Câu dẫn', { multiline: true })} />
          </div>
        </section>

        <section className="svc-list" aria-label="Danh sách dịch vụ">
          <div className="s-container svc-grid">
            {DICH_VU.map((s, i) => {
              const Icon = ICONS[i] ?? Megaphone;
              return (
                <Link key={s.id} href={`/dich-vu/${s.slug}/`} className="svc-card">
                  <span className="svc-card__no">0{i + 1}</span>
                  <span className="svc-card__ico" aria-hidden="true"><Icon /></span>
                  <h2 className="svc-card__title" {...P(`cards.${i}.title`, s.title, 'Tên dịch vụ')} />
                  <p className="svc-card__text" {...P(`cards.${i}.text`, s.description, 'Mô tả dịch vụ', { multiline: true })} />
                  <ul className="svc-card__items">
                    {s.items.slice(0, 3).map((item, j) => <li key={item} {...P(`cards.${i}.items.${j}`, item, 'Hạng mục')} />)}
                  </ul>
                  <span className="svc-card__go">{T('cards.go', 'Xem chi tiết', 'Chữ liên kết thẻ')} <ArrowRight aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <DichVuAsk />

        <CtaBand title={T('cta.title', 'Cần tư vấn dịch vụ?', 'Dải cuối trang: tiêu đề')} lead={T('cta.lead', 'Chia sẻ mục tiêu của bạn, chuyên viên DANAVA sẽ đề xuất phương án và báo giá theo phạm vi.', 'Dải cuối trang: câu dẫn', { multiline: true })} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
      </main>
    </>
  );
}

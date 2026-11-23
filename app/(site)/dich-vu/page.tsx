import Link from 'next/link';
import { ArrowRight, CalendarDays, Megaphone, MonitorSmartphone, Plane } from 'lucide-react';
import { seo, breadcrumbLD } from '@/lib/seo';
import { JsonLd } from '@/components/site/blocks';
import { DichVuAsk } from '@/components/site/DichVuAsk';
import { Crumbs, CtaBand } from '@/components/site/ui';
import { DICH_VU } from '@/lib/dich-vu';

export const metadata = seo(
  'Dịch vụ: truyền thông, landing page, sự kiện và du lịch',
  'Dịch vụ của DANAVA ngoài phần mềm: truyền thông nội dung, thiết kế landing page, tổ chức sự kiện và du lịch trải nghiệm.',
  '/dich-vu/'
);

const ICONS = [Megaphone, MonitorSmartphone, CalendarDays, Plane];

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dịch vụ', href: '/dich-vu/' }])} />
      <main id="main" className="svc">
        <section className="svc-hero">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Dịch vụ' }]} />
            <p className="svc-kicker">Dịch vụ DANAVA</p>
            <h1 className="svc-title">Đồng hành cùng <span>thương hiệu</span> của bạn</h1>
            <p className="svc-lead">Truyền thông, landing page, sự kiện và hành trình trải nghiệm: những dịch vụ DANAVA triển khai trọn gói, ngoài các sản phẩm phần mềm.</p>
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
                  <h2 className="svc-card__title">{s.title}</h2>
                  <p className="svc-card__text">{s.description}</p>
                  <ul className="svc-card__items">
                    {s.items.slice(0, 3).map(item => <li key={item}>{item}</li>)}
                  </ul>
                  <span className="svc-card__go">Xem chi tiết <ArrowRight aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <DichVuAsk />

        <CtaBand title="Cần tư vấn dịch vụ?" lead="Chia sẻ mục tiêu của bạn, chuyên viên DANAVA sẽ đề xuất phương án và báo giá theo phạm vi." primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
      </main>
    </>
  );
}

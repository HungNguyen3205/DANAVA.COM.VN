import { breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { GymPlanner } from '@/components/site/GymPlanner';
import { publicEquipment } from '@/lib/equipment';

export const generateMetadata = seoPage('/bao-gia-setup-phong-gym/');

/** Dịch vụ → Báo giá setup phòng gym: phòng lab 3D tự bố trí máy và tính chi phí (components/site/GymPlanner.tsx). */
export default async function Page({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const { data } = await getSiteContent();
  const { add } = await searchParams;
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Setup phòng gym', href: '/giai-phap/setup-van-hanh-phong-gym/' }, { label: 'Phòng lab 3D', href: '/bao-gia-setup-phong-gym/' }])} />
      <main id="main" className="gp-page">
        <section className="gp-hero">
          <div className="s-container">
            <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/setup-van-hanh-phong-gym/', label: 'Setup phòng gym' }, { label: 'Phòng lab 3D' }]} />
            <p className="gy-kicker">DANAVA Gym Solutions · Phòng lab 3D</p>
            <h1 className="gy-h2">Tự setup phòng tập của bạn</h1>
            <p className="gy-lead">Nhập diện tích, chỉnh ô gạch, kéo thả máy móc vào phòng và xem tổng chi phí thiết bị ngay bên dưới.</p>
          </div>
        </section>
        <section className="gp-body">
          <div className="s-container">
            <GymPlanner equipment={publicEquipment(data.equipment)} addId={typeof add === 'string' ? add.slice(0, 60) : undefined} />
          </div>
        </section>
      </main>
    </>
  );
}

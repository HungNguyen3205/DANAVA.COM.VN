import { breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { GymStudioPage } from '@/components/site/gym/GymStudioPage';
import { FLOORING, publicEquipment } from '@/lib/equipment-seeds';

export const generateMetadata = seoPage('/bao-gia-setup-phong-gym/');

/**
 * Dịch vụ → Báo giá setup phòng tập: phòng lab thiết kế nhiều tầng (components/site/gym/GymStudio.tsx).
 * ?ma=GYM-XXXXXX mở lại đúng phương án đã lưu / gửi; ?add=<mã máy> thêm máy từ trang thiết bị.
 */
export default async function Page({ searchParams }: { searchParams: Promise<{ add?: string; ma?: string }> }) {
  const { data } = await getSiteContent();
  const { add, ma } = await searchParams;
  const code = typeof ma === 'string' && /^GYM-[A-Z0-9]{6}$/i.test(ma) ? ma.toUpperCase() : undefined;
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Setup phòng gym', href: '/giai-phap/setup-van-hanh-phong-gym/' }, { label: 'Phòng lab 3D', href: '/bao-gia-setup-phong-gym/' }])} />
      <main id="main" className="gp-page">
        <section className="gp-hero">
          <div className="s-container">
            <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/setup-van-hanh-phong-gym/', label: 'Setup phòng gym' }, { label: 'Phòng lab 3D' }]} />
            <p className="gy-kicker">DANAVA Gym Solutions · Phòng lab 3D</p>
            <h1 className="gy-h2">Thiết kế phòng tập của bạn</h1>
            <p className="gy-lead">Nhập nhu cầu, xem phòng tập 3D gợi ý cùng chi phí dự kiến, rồi gửi để DANAVA tư vấn triển khai.</p>
          </div>
        </section>
        <section className="gp-body">
          <div className="s-container s-container--wide">
            <GymStudioPage flooring={FLOORING} equipment={publicEquipment(data.equipment).filter(x => x.category !== 'accessory')} addId={typeof add === 'string' ? add.slice(0, 60) : undefined} code={code} aiEnabled={!!process.env.GEMINI_API_KEY} />
          </div>
        </section>
      </main>
    </>
  );
}

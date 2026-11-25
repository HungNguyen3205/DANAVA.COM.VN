import { breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { EquipmentPage } from '@/components/site/EquipmentPage';

export const generateMetadata = seoPage('/thiet-bi-gym/');

export default async function Page() {
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Setup phòng gym', href: '/giai-phap/setup-van-hanh-phong-gym/' }, { label: 'Thiết bị phòng gym', href: '/thiet-bi-gym/' }])} />
      <EquipmentPage data={data} />
    </>
  );
}

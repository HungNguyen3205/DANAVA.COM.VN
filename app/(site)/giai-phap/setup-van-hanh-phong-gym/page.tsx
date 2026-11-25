import { siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { GymSolutionsPage } from '@/components/site/GymSolutionsPage';

export const generateMetadata = seoPage('/giai-phap/setup-van-hanh-phong-gym/');

export default async function Page() {
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'DANAVA Gym Solutions: setup và vận hành phòng gym trọn gói',
        serviceType: 'Setup và vận hành phòng gym',
        provider: { '@id': ORG_ID },
        areaServed: 'VN',
        url: `${siteURL}/giai-phap/setup-van-hanh-phong-gym/`,
        description: 'DANAVA Solutions tư vấn setup phòng gym, triển khai phần mềm quản lý hội viên và truyền thông khai trương.'
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }, { label: 'Setup & vận hành phòng gym', href: '/giai-phap/setup-van-hanh-phong-gym/' }])} />
      <GymSolutionsPage data={data} />
    </>
  );
}

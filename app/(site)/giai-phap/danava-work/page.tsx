import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { seoLater } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { WorkPage } from '@/components/site/ProductPages';
import { WORK } from '@/lib/products';

export const generateMetadata = seoLater(
  'DANAVA Work — Bảng công việc của đội ngũ DANAVA',
  'DANAVA Work: nền tảng quản trị công việc, nơi đội ngũ DANAVA phân bổ và theo dõi công việc của nhóm.',
  '/giai-phap/danava-work/',
  '/assets/products/work-login.webp'
);

export default async function Page() {
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DANAVA Work',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: WORK.url,
        description: 'DANAVA Work: nền tảng quản trị công việc, nơi đội ngũ DANAVA phân bổ và theo dõi công việc của nhóm.',
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: `${siteURL}/giai-phap/danava-work/`
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }, { label: 'DANAVA Work', href: '/giai-phap/danava-work/' }])} />
      <WorkPage data={data} />
    </>
  );
}

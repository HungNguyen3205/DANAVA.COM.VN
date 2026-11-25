import '../site-careers.css';
import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { CareersPage } from '@/components/site/careers/CareersPage';

export const generateMetadata = seoPage('/tuyen-dung/');

export default async function Page() {
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Tuyển dụng', href: '/tuyen-dung/' }])} />
      <CareersPage data={data} />
    </>
  );
}

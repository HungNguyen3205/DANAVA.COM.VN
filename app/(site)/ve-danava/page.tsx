import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import AboutPage from '@/components/site/AboutPage';

export const generateMetadata = seoPage('/ve-danava/');

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Về DANAVA', href: '/ve-danava/' }])} />
      <AboutPage />
    </>
  );
}

import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import { ServicesIndex } from '@/components/site/ServicesPages';

export const generateMetadata = seoPage('/giai-phap/');

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }])} />
      <ServicesIndex />
    </>
  );
}

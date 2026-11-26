import { breadcrumbLD, siteURL } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { TemplatesPage } from '@/components/site/TemplatesPage';
import { publishedTemplates, templateHref } from '@/lib/web-templates';

export const generateMetadata = seoPage('/mau-website/');

export default async function Page() {
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Thiết kế website', href: '/giai-phap/thiet-ke-website/' }, { label: 'Kho mẫu website', href: '/mau-website/' }])} />
      <JsonLd value={{
        '@context': 'https://schema.org', '@type': 'ItemList', name: 'Kho mẫu website & landing page DANAVA',
        itemListElement: publishedTemplates(data).map((t, i) => { const h = templateHref(t); return { '@type': 'ListItem', position: i + 1, name: t.name, url: h.startsWith('/') ? siteURL + h : h }; })
      }} />
      <TemplatesPage data={data} />
    </>
  );
}

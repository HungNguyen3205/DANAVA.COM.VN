import { notFound } from 'next/navigation';
import { ServiceDetailPage } from '@/components/site/ServiceDetailPage';
import { JsonLd } from '@/components/site/blocks';
import { getContent } from '@/lib/database';
import { seo, siteURL, ORG_ID, breadcrumbLD, notFoundMeta } from '@/lib/seo';
import { DICH_VU, dichVuBySlug } from '@/lib/dich-vu';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const s = dichVuBySlug(slug);
  if (!s) return notFoundMeta;
  return seo(s.seoTitle || s.title, s.seoDescription || s.heroLead || s.description, `/dich-vu/${s.slug}/`);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const s = dichVuBySlug(slug);
  if (!s) notFound();
  const { data } = await getContent();
  const url = `${siteURL}/dich-vu/${s.slug}/`;
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${url}#service`,
        name: s.title,
        description: s.heroLead || s.description,
        url,
        provider: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'Việt Nam' }
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dịch vụ', href: '/dich-vu/' }, { label: s.title, href: `/dich-vu/${s.slug}/` }])} />
      <ServiceDetailPage
        service={s}
        data={data}
        section={{ base: '/dich-vu/', label: 'Dịch vụ', siblings: DICH_VU, siblingsTitle: 'Dịch vụ khác của DANAVA' }}
      />
    </>
  );
}

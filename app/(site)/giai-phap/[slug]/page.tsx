import { notFound } from 'next/navigation';
import { ServiceDetailPage } from '@/components/site/ServiceDetailPage';
import { JsonLd } from '@/components/site/blocks';
import { getSiteContent } from '@/lib/database';
import { seo, siteURL, ORG_ID, breadcrumbLD, notFoundMeta } from '@/lib/seo';
import { findService } from '@/lib/site-queries';
import { servicePhotos } from '@/lib/media';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const s = findService((await getSiteContent()).data, slug);
  if (!s) return notFoundMeta;
  return seo(s.seoTitle || s.title, s.seoDescription || s.heroLead || s.description, `/giai-phap/${s.slug}/`, s.image || servicePhotos[s.id]);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const { data } = await getSiteContent();
  const s = findService(data, slug);
  if (!s) notFound();
  const url = `${siteURL}/giai-phap/${s.slug}/`;
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${url}#service`,
        name: s.title,
        description: s.heroLead || s.description,
        url,
        serviceType: s.title,
        provider: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'Việt Nam' },
        ...(s.audience?.length ? { audience: { '@type': 'BusinessAudience', audienceType: s.audience.join(', ') } } : {})
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }, { label: s.title, href: `/giai-phap/${s.slug}/` }])} />
      <ServiceDetailPage service={s} data={data} />
    </>
  );
}

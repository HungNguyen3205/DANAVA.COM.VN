import { notFound } from 'next/navigation';
import { ServiceDetail } from '@/components/site/ServicesPages';
import { getContent } from '@/lib/database';
import { seo, jsonLD, siteURL } from '@/lib/seo';
import { servicePhotos } from '@/lib/media';

const find = (slug: string) => getContent().data.services.find(s => s.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = find(slug);
  return s ? seo(`${s.title} — DANAVA Solutions`, s.description, `/giai-phap/${slug}/`, servicePhotos[s.id]) : { title: 'Không tìm thấy', robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = find(slug);
  if (!s) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLD({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: s.title,
            description: s.description,
            url: `${siteURL}/giai-phap/${slug}/`,
            provider: { '@type': 'Organization', name: 'DANAVA Solutions', url: siteURL },
            areaServed: 'VN'
          })
        }}
      />
      <ServiceDetail service={s} />
    </>
  );
}

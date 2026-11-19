import { notFound } from 'next/navigation';
import { SubServicePage } from '@/components/site/SubServicePage';
import { JsonLd } from '@/components/site/blocks';
import { getContent } from '@/lib/database';
import { session } from '@/lib/auth';
import { seo, siteURL, ORG_ID, breadcrumbLD, notFoundMeta } from '@/lib/seo';
import { findSubService } from '@/lib/site-queries';

type Params = { params: Promise<{ slug: string; sub: string }> };

/** Bản nháp: 404 với khách; quản trị viên đã đăng nhập xem trước (noindex). */
async function load(slug: string, sub: string) {
  const { data } = await getContent();
  const found = findSubService(data, slug, sub);
  if (!found) return null;
  if (found.sub.published) return { ...found, data, preview: false };
  return (await session()) ? { ...found, data, preview: true } : null;
}

export async function generateMetadata({ params }: Params) {
  const { slug, sub } = await params;
  const r = await load(slug, sub);
  if (!r) return notFoundMeta;
  const path = `/giai-phap/${r.parent.slug}/${r.sub.slug}/`;
  return seo(r.sub.seoTitle || r.sub.title, r.sub.seoDescription || r.sub.description, path, r.sub.image || undefined, { noindex: r.preview });
}

export default async function Page({ params }: Params) {
  const { slug, sub } = await params;
  const r = await load(slug, sub);
  if (!r) notFound();
  const path = `/giai-phap/${r.parent.slug}/${r.sub.slug}/`;
  return (
    <>
      {!r.preview && (
        <>
          <JsonLd value={{
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: r.sub.title,
            description: r.sub.description,
            url: siteURL + path,
            serviceType: r.parent.title,
            provider: { '@id': ORG_ID },
            areaServed: { '@type': 'Country', name: 'Việt Nam' }
          }} />
          <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }, { label: r.parent.title, href: `/giai-phap/${r.parent.slug}/` }, { label: r.sub.title, href: path }])} />
        </>
      )}
      <SubServicePage parent={r.parent} sub={r.sub} data={r.data} preview={r.preview} />
    </>
  );
}

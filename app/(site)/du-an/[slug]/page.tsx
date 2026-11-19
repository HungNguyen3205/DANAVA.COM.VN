import { notFound } from 'next/navigation';
import { ProjectDetailPage } from '@/components/site/ProjectDetailPage';
import { JsonLd } from '@/components/site/blocks';
import { getContent } from '@/lib/database';
import { session } from '@/lib/auth';
import { seo, siteURL, ORG_ID, breadcrumbLD, notFoundMeta, absoluteURL } from '@/lib/seo';
import { servicesForProject } from '@/lib/site-queries';

type Params = { params: Promise<{ slug: string }> };

/** Dự án nháp: 404 với khách; quản trị viên đã đăng nhập xem trước (noindex). */
async function load(slug: string) {
  const { data } = await getContent();
  const p = (data.projects || []).find(x => x.slug === slug);
  if (!p) return null;
  if (p.published) return { p, data, preview: false };
  return (await session()) ? { p, data, preview: true } : null;
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) return notFoundMeta;
  return seo(r.p.seoTitle || r.p.title, r.p.seoDescription || r.p.summary, `/du-an/${r.p.slug}/`, r.p.image || undefined, { noindex: r.preview });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  const { p, data } = r;
  const url = `${siteURL}/du-an/${p.slug}/`;
  return (
    <>
      {!r.preview && (
        <>
          <JsonLd value={{
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: p.title,
            description: p.summary,
            url,
            ...(p.image ? { image: absoluteURL(p.image) } : {}),
            ...(p.updated ? { dateModified: p.updated } : {}),
            creator: { '@id': ORG_ID },
            ...(servicesForProject(data, p).length ? { about: servicesForProject(data, p).map(s => ({ '@type': 'Service', name: s.title, url: `${siteURL}/giai-phap/${s.slug}/` })) } : {})
          }} />
          <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dự án', href: '/du-an/' }, { label: p.client || p.title, href: `/du-an/${p.slug}/` }])} />
        </>
      )}
      <ProjectDetailPage project={p} data={data} preview={r.preview} />
    </>
  );
}

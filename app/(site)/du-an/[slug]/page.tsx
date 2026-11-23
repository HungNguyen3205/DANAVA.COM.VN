import { notFound } from 'next/navigation';
import { ProjectDetailPage } from '@/components/site/ProjectDetailPage';
import { ShowcaseCaseStudy } from '@/components/site/ShowcaseCaseStudy';
import { JsonLd } from '@/components/site/blocks';
import { getSiteContent } from '@/lib/database';
import { canPreview } from '@/lib/auth';
import { seo, siteURL, ORG_ID, breadcrumbLD, notFoundMeta, absoluteURL } from '@/lib/seo';
import { findShowcase, servicesForProject } from '@/lib/site-queries';

type Params = { params: Promise<{ slug: string }> };

/**
 * /du-an/[slug]/ phục vụ hai loại: hồ sơ dự án (data.projects) và case study của mục trưng bày (data.showcase).
 * Bản nháp: 404 với khách; quản trị viên đã đăng nhập xem trước (noindex).
 */
async function load(slug: string) {
  const { data } = await getSiteContent();
  const p = (data.projects || []).find(x => x.slug === slug);
  const s = p ? undefined : findShowcase(data, slug);
  if (!p && !(s && s.caseStudy)) return null;
  const live = p ? p.published : s!.published;
  if (!live && !(await canPreview())) return null;
  return { p, s, data, preview: !live };
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) return notFoundMeta;
  if (r.p) return seo(r.p.seoTitle || r.p.title, r.p.seoDescription || r.p.summary, `/du-an/${r.p.slug}/`, r.p.image || undefined, { noindex: r.preview });
  const s = r.s!;
  return seo(s.seoTitle || `${s.name} — case study`, s.seoDescription || s.description, `/du-an/${s.slug}/`, s.image || undefined, { noindex: r.preview });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  const { data } = r;

  if (r.s) {
    const s = r.s;
    const url = `${siteURL}/du-an/${s.slug}/`;
    return (
      <>
        {!r.preview && (
          <>
            <JsonLd value={{
              '@context': 'https://schema.org',
              '@type': 'CreativeWork',
              name: `${s.name} — ${s.kind}`,
              description: s.description,
              url,
              image: absoluteURL(s.image),
              dateModified: s.updated,
              creator: { '@id': ORG_ID },
              ...(s.url ? { workExample: { '@type': 'WebSite', name: s.name, url: s.url } } : {})
            }} />
            <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dự án', href: '/du-an/' }, { label: s.name, href: `/du-an/${s.slug}/` }])} />
          </>
        )}
        <ShowcaseCaseStudy item={s} data={data} preview={r.preview} />
      </>
    );
  }

  const p = r.p!;
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

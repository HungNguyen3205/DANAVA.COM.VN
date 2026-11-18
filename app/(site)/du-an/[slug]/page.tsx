import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/site/ProjectsPages';
import { getContent } from '@/lib/database';
import { seo, jsonLD, siteURL } from '@/lib/seo';

const find = async (slug: string) => (await getContent()).data.projects?.find(p => p.slug === slug && p.published);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await find(slug);
  return p ? seo(p.title, p.summary, `/du-an/${p.slug}/`, p.image) : { title: 'Không tìm thấy dự án', robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await find(slug);
  if (!p) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLD({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: p.title,
            description: p.summary,
            url: `${siteURL}/du-an/${slug}/`,
            creator: { '@type': 'Organization', name: 'DANAVA Solutions' }
          })
        }}
      />
      <ProjectDetail slug={slug} />
    </>
  );
}

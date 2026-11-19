import { notFound } from 'next/navigation';
import { ArticleView } from '@/components/site/ArticleView';
import { JsonLd, postCover } from '@/components/site/blocks';
import { getContent } from '@/lib/database';
import { session } from '@/lib/auth';
import { seo, siteURL, ORG_ID, BRAND, breadcrumbLD, notFoundMeta, absoluteURL, plainExcerpt } from '@/lib/seo';
import { authorOf, topicHasPage, topicHref, topicOf } from '@/lib/site-queries';

type Params = { params: Promise<{ slug: string }> };

/** Bài nháp: 404 với khách; quản trị viên đã đăng nhập xem trước (noindex). */
async function load(slug: string) {
  const { data } = await getContent();
  const post = data.posts.find(p => p.slug === slug);
  if (!post) return null;
  if (post.published) return { post, data, preview: false };
  return (await session()) ? { post, data, preview: true } : null;
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) return notFoundMeta;
  const p = r.post;
  return seo(
    p.seoTitle || p.title,
    p.seoDescription || p.excerpt || plainExcerpt(p.body, 160),
    `/kien-thuc/${p.slug}/`,
    postCover(p) || undefined,
    {
      type: 'article',
      publishedTime: p.date || undefined,
      modifiedTime: p.updated || undefined,
      noindex: r.preview || !!p.noindex
    }
  );
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  const { post: p, data } = r;
  const url = `${siteURL}/kien-thuc/${p.slug}/`;
  const author = authorOf(data, p);
  const topic = topicOf(data, p);
  const cover = postCover(p);
  const crumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Kiến thức', href: '/kien-thuc/' },
    ...(topic && topicHasPage(data, topic) ? [{ label: topic.name, href: topicHref(topic) }] : []),
    { label: p.title, href: `/kien-thuc/${p.slug}/` }
  ];
  return (
    <>
      {!r.preview && (
        <>
          <JsonLd value={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: p.title.slice(0, 110),
            description: p.seoDescription || p.excerpt || plainExcerpt(p.body, 160),
            mainEntityOfPage: url,
            url,
            ...(p.date ? { datePublished: p.date } : {}),
            ...(p.updated || p.date ? { dateModified: p.updated || p.date } : {}),
            ...(cover ? { image: absoluteURL(cover) } : {}),
            ...(topic ? { articleSection: topic.name } : {}),
            inLanguage: 'vi',
            // Tác giả cá nhân chỉ khi đã gắn hồ sơ nhân sự thật; còn lại là tổ chức.
            author: author
              ? { '@type': 'Person', name: author.name, jobTitle: author.role, url: `${siteURL}/doi-ngu/${author.id}/` }
              : { '@type': 'Organization', '@id': ORG_ID, name: BRAND },
            publisher: { '@id': ORG_ID }
          }} />
          <JsonLd value={breadcrumbLD(crumbs)} />
        </>
      )}
      <ArticleView post={p} data={data} preview={r.preview} />
    </>
  );
}

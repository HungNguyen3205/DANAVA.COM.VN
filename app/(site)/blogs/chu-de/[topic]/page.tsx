import { notFound } from 'next/navigation';
import { getSiteContent } from '@/lib/database';
import { seo, siteURL, ORG_ID, breadcrumbLD, notFoundMeta } from '@/lib/seo';
import { findTopic, postsForTopic, sortServices, topicHasPage, topicHref } from '@/lib/site-queries';
import { JsonLd, PostTile, ServiceLinks } from '@/components/site/blocks';
import { PageHead, CtaBand } from '@/components/site/ui';
import { TopicNav } from '@/components/site/NewsPage';
import { BlogSearch } from '@/components/site/BlogSearch';
import { pageCopy } from '@/lib/blocks';
import { rich } from '@/components/site/rich';

type Params = { params: Promise<{ topic: string }> };

/** Trang danh mục chỉ tồn tại khi danh mục đã xuất bản và đủ số bài (TOPIC_PAGE_MIN_POSTS). */
async function load(slug: string) {
  const { data } = await getSiteContent();
  const topic = findTopic(data, slug);
  if (!topic || !topicHasPage(data, topic)) return null;
  return { data, topic, posts: postsForTopic(data, topic.id) };
}

export async function generateMetadata({ params }: Params) {
  const r = await load((await params).topic);
  if (!r) return notFoundMeta;
  return seo(r.topic.seoTitle || `${r.topic.name} — Blogs DANAVA`, r.topic.seoDescription || r.topic.description, topicHref(r.topic));
}

export default async function Page({ params }: Params) {
  const r = await load((await params).topic);
  if (!r) notFound();
  const { data, topic, posts } = r;
  const services = sortServices(data.services.filter(s => topic.serviceIds.includes(s.id)));
  const crumbs = [{ label: 'Trang chủ', href: '/' }, { label: 'Blogs', href: '/blogs/' }, { label: topic.name, href: topicHref(topic) }];
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: topic.name,
        description: topic.description,
        url: siteURL + topicHref(topic),
        publisher: { '@id': ORG_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteURL}/blogs/${p.slug}/` }))
        }
      }} />
      <JsonLd value={breadcrumbLD(crumbs)} />
      <main id="main">
        <PageHead eyebrow="Blogs" title={topic.name} lead={topic.description} crumbs={[{ href: '/', label: 'Trang chủ' }, { href: '/blogs/', label: 'Blogs' }, { label: topic.name }]} />
        <div className="s-container bl-topicbar"><BlogSearch data={data} filter={{ q: '', topic: topic.slug }} /><TopicNav data={data} current={topic.id} /></div>
        <section className="s-section s-section--flush-top" aria-label={`Bài viết ${topic.name}`}>
          <div className="s-container">
            <div className="s-grid s-grid--3 s-list-m">
              {posts.map(p => <PostTile key={p.id} post={p} data={data} />)}
            </div>
          </div>
        </section>
        <ServiceLinks services={services} title="Giải pháp DANAVA liên quan" />
        <CtaBand title={rich(pageCopy(data, 'mac-dinh').ctaTitle)} lead={pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
      </main>
    </>
  );
}

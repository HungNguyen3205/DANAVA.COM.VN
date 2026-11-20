import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { getContent } from '@/lib/database';
import NewsPage from '@/components/site/NewsPage';
import { JsonLd } from '@/components/site/blocks';

export const metadata = seo(
  'Blogs DANAVA — vận hành phòng tập, website, yoga và sự kiện',
  'Bài viết về vận hành phòng tập, website, yoga, du lịch và hoạt động cộng đồng từ DANAVA Solutions.',
  '/kien-thuc/',
  '/assets/legacy/event-session.webp'
);

export default async function Page() {
  const { data } = await getContent();
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Blogs DANAVA',
        description: 'Bài viết về vận hành phòng tập, website, yoga, du lịch và hoạt động cộng đồng.',
        url: `${siteURL}/kien-thuc/`,
        publisher: { '@id': ORG_ID }
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Blogs', href: '/kien-thuc/' }])} />
      <NewsPage data={data} />
    </>
  );
}

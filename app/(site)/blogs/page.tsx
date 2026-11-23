import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { getSiteContent } from '@/lib/database';
import NewsPage from '@/components/site/NewsPage';
import { JsonLd } from '@/components/site/blocks';
import { isFiltering, readBlogFilter } from '@/lib/blog-search';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const meta = seo(
  'Blogs DANAVA — vận hành phòng tập, website, yoga và sự kiện',
  'Bài viết về vận hành phòng tập, website, yoga, du lịch và hoạt động cộng đồng từ DANAVA Solutions.',
  '/blogs/',
  '/assets/legacy/event-session.webp'
);

/** Trang kết quả tìm kiếm không cho lập chỉ mục; canonical vẫn là /blogs/. */
export async function generateMetadata({ searchParams }: Props) {
  return isFiltering(readBlogFilter(await searchParams)) ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function Page({ searchParams }: Props) {
  const filter = readBlogFilter(await searchParams);
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Blogs DANAVA',
        description: 'Bài viết về vận hành phòng tập, website, yoga, du lịch và hoạt động cộng đồng.',
        url: `${siteURL}/blogs/`,
        publisher: { '@id': ORG_ID }
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Blogs', href: '/blogs/' }])} />
      <NewsPage data={data} filter={filter} />
    </>
  );
}

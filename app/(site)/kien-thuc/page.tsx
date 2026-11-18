import { seo, jsonLD, siteURL } from '@/lib/seo';
import NewsPage from '@/components/site/NewsPage';

export const metadata = seo(
  'Bản tin DANAVA — Góc nhìn, công nghệ và nhịp đập thực chiến',
  'Cập nhật bài viết chuyên sâu về số hóa phòng tập, chiến lược truyền thông, du lịch wellness và tin tức từ các kênh chính thức của DANAVA Solutions.',
  '/kien-thuc/',
  '/assets/legacy/event-session.webp'
);

export default function Page() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bản tin DANAVA — Góc nhìn & Kiến thức Thực chiến',
    description: 'Kho bài viết, sự kiện, hướng dẫn quản trị phòng tập và tin tức từ các kênh chính thức của DANAVA Solutions.',
    url: `${siteURL}/kien-thuc/`,
    publisher: {
      '@type': 'Organization',
      name: 'DANAVA Solutions',
      url: siteURL,
      logo: `${siteURL}/assets/danava-logo.png`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(schemaData) }}
      />
      <NewsPage />
    </>
  );
}
